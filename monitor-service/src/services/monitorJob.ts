import type { MonitorConfig } from "../config.ts";
import { PlatformClient } from "../clients/platformClient.ts";
import { AlertService } from "./alertService.ts";
import { MonitorRepository } from "../repositories/monitorRepository.ts";
import type { MonitorRunStatus, TenantRecord } from "../types.ts";
import { safeStringify, toErrorMessage, truncateText } from "../types.ts";

interface RunCounter {
  tenantCount: number;
  tenantSuccessCount: number;
  tenantFailureCount: number;
  agentRequestCount: number;
  agentFailureCount: number;
}

export class MonitorJobRunner {
  private running = false;
  private schedulerStarted = false;
  private timerId: number | null = null;

  constructor(
    private readonly config: MonitorConfig,
    private readonly repository: MonitorRepository,
    private readonly platformClient: PlatformClient,
    private readonly alertService: AlertService,
  ) {}

  startScheduler(): boolean {
    if (!this.config.enabled || this.schedulerStarted) {
      return false;
    }

    this.schedulerStarted = true;
    this.timerId = setInterval(() => {
      this.runOnce("scheduler").catch((error) => {
        console.error("[monitor] scheduler run failed", toErrorMessage(error));
      });
    }, this.config.monitorIntervalMs);

    if (this.config.runImmediatelyOnStart) {
      setTimeout(() => {
        this.runOnce("startup").catch((error) => {
          console.error("[monitor] startup run failed", toErrorMessage(error));
        });
      }, 1500);
    }

    return true;
  }

  stopScheduler(): void {
    if (this.timerId !== null) {
      clearInterval(this.timerId);
      this.timerId = null;
    }
    this.schedulerStarted = false;
  }

  async runOnce(triggerSource: string): Promise<Record<string, unknown>> {
    if (!this.config.enabled) {
      return {
        skipped: true,
        reason: "Monitor is disabled by MONITOR_ENABLED=false",
      };
    }

    if (this.running) {
      return {
        skipped: true,
        reason: "Monitor run is already in progress",
      };
    }

    const runId = crypto.randomUUID();
    this.running = true;
    await this.repository.createRun(runId, triggerSource);

    const counters: RunCounter = {
      tenantCount: 0,
      tenantSuccessCount: 0,
      tenantFailureCount: 0,
      agentRequestCount: 0,
      agentFailureCount: 0,
    };
    const failures: string[] = [];

    try {
      const tenants = await this.collectTenants(runId, counters, failures);
      counters.tenantCount = tenants.length;

      if (tenants.length > 0) {
        await this.repository.upsertTenantCache(tenants);
        await this.checkTenantAgents(runId, tenants, counters, failures);
      }

      const status: MonitorRunStatus = failures.length > 0 ? "failed" : "success";
      await this.repository.completeRun(runId, {
        status,
        tenantCount: counters.tenantCount,
        tenantSuccessCount: counters.tenantSuccessCount,
        tenantFailureCount: counters.tenantFailureCount,
        agentRequestCount: counters.agentRequestCount,
        agentFailureCount: counters.agentFailureCount,
        errorSummary: truncateText(failures.join(" | "), 4000),
      });

      return {
        skipped: false,
        runId,
        status,
        failureCount: failures.length,
        counters,
      };
    } catch (error) {
      const message = `Unexpected monitor run error: ${toErrorMessage(error)}`;
      failures.push(message);

      await this.sendAlertAndLog(runId, "RUNNER_ERROR", "监控任务异常退出", message);
      await this.repository.completeRun(runId, {
        status: "failed",
        tenantCount: counters.tenantCount,
        tenantSuccessCount: counters.tenantSuccessCount,
        tenantFailureCount: counters.tenantFailureCount,
        agentRequestCount: counters.agentRequestCount,
        agentFailureCount: counters.agentFailureCount,
        errorSummary: truncateText(failures.join(" | "), 4000),
      });

      return {
        skipped: false,
        runId,
        status: "failed",
        failureCount: failures.length,
        counters,
      };
    } finally {
      this.running = false;
    }
  }

  async getStatus(): Promise<Record<string, unknown>> {
    const recentRequestHealth = await this.repository.getRecentRequestHealth(10);

    return {
      enabled: this.config.enabled,
      running: this.running,
      schedulerStarted: this.schedulerStarted,
      monitorIntervalSeconds: this.config.monitorIntervalMs / 1000,
      latestRun: await this.repository.getLatestRun(),
      recentAlerts: await this.repository.getRecentAlerts(10),
      todayApiCallCounts: await this.repository.getTodayApiCallCounts(),
      recentRequestHealth,
    };
  }

  private async collectTenants(runId: string, counters: RunCounter, failures: string[]): Promise<TenantRecord[]> {
    const allTenants: TenantRecord[] = [];
    let page = 1;
    let totalPages = 1;

    while (page <= totalPages) {
      const result = await this.platformClient.fetchTenantsPage(page, this.config.tenantPageSize);
      const responsePayload = result.data;
      const responseCode = responsePayload?.code;
      const responseMessage =
        responsePayload && typeof responsePayload === "object" && "message" in responsePayload
          ? String((responsePayload as { message?: unknown }).message ?? "")
          : "";
      const tenants = Array.isArray(responsePayload?.data?.tenants) ? responsePayload.data?.tenants : [];
      totalPages = responsePayload?.data?.totalPages ?? totalPages;
      const hasTenantArray = Array.isArray(responsePayload?.data?.tenants);

      const isSuccess = result.success && (responseCode === 200 || hasTenantArray);
      if (isSuccess) {
        counters.tenantSuccessCount += 1;
      } else {
        counters.tenantFailureCount += 1;
      }

      await this.repository.logRequest({
        runId,
        apiName: "tenants",
        requestUrl: result.requestUrl,
        requestMethod: result.method,
        statusCode: result.statusCode,
        isSuccess,
        durationMs: result.durationMs,
        requestPayload: result.requestPayload ?? null,
        responseSummary: safeStringify({
          page,
          totalPages,
          tenantCount: tenants.length,
          code: responseCode,
          message: responseMessage,
          statusCode: result.statusCode,
        }),
        errorMessage: isSuccess
          ? null
          : truncateText(
              result.errorMessage ?? `Tenant response failed: code=${responseCode ?? "N/A"}, message=${responseMessage || "unknown"}`,
              2000,
            ),
      });

      if (!isSuccess) {
        const tenantFailureDetail =
          result.errorMessage ??
          `code=${responseCode ?? "N/A"}, message=${responseMessage || "unknown"}, response=${result.responseSummary ?? "n/a"}`;
        const errorMessage = `租户接口请求失败：page=${page}, status=${result.statusCode ?? "N/A"}, detail=${tenantFailureDetail}`;
        failures.push(errorMessage);
        await this.sendAlertAndLog(runId, "TENANTS_REQUEST_FAILED", "租户接口请求失败", errorMessage);
        return [];
      }

      allTenants.push(...tenants);
      page += 1;
    }

    if (allTenants.length === 0) {
      const errorMessage = "租户接口返回空数组，判定异常";
      failures.push(errorMessage);
      await this.sendAlertAndLog(runId, "TENANTS_EMPTY", "租户接口返回空数组", errorMessage);
    }

    return allTenants;
  }

  private async checkTenantAgents(
    runId: string,
    tenants: TenantRecord[],
    counters: RunCounter,
    failures: string[],
  ): Promise<void> {
    for (const tenant of tenants) {
      const tenantId = tenant.id;
      const tenantName = tenant.name ?? null;

      if (!tenantId) {
        counters.agentFailureCount += 1;
        failures.push("租户数据缺失 id 字段，无法请求 agents");
        continue;
      }

      const result = await this.platformClient.fetchAgentsByTenant(tenantId);
      counters.agentRequestCount += 1;

      const hasAgentsArray = Array.isArray(result.data?.data);
      const businessSuccess = result.success && (result.data?.success === true || hasAgentsArray);
      const agentMessage =
        result.data && typeof result.data === "object" && "message" in result.data
          ? String((result.data as { message?: unknown }).message ?? "")
          : "";
      const agents = Array.isArray(result.data?.data) ? result.data?.data : [];
      const agentNames = agents
        .map((agent) => {
          if (agent && typeof agent === "object" && "name" in agent) {
            const value = (agent as { name?: unknown }).name;
            return typeof value === "string" ? value : null;
          }
          return null;
        })
        .filter((name): name is string => Boolean(name));

      await this.repository.logRequest({
        runId,
        apiName: "agents",
        tenantId,
        tenantName,
        requestUrl: result.requestUrl,
        requestMethod: result.method,
        statusCode: result.statusCode,
        isSuccess: businessSuccess,
        durationMs: result.durationMs,
        requestPayload: null,
        responseSummary: businessSuccess
          ? safeStringify({
              count: agents.length,
              agentNames,
              success: result.data?.success,
              message: agentMessage,
              statusCode: result.statusCode,
            })
          : truncateText(result.responseSummary ?? null, 8000),
        errorMessage: businessSuccess
          ? null
          : truncateText(
              result.errorMessage ??
                `Agents response failed: status=${result.statusCode ?? "N/A"}, success=${result.data?.success ?? "N/A"}, message=${agentMessage || "unknown"}`,
              3000,
            ),
      });

      if (!businessSuccess) {
        counters.agentFailureCount += 1;
        const failureDetail =
          result.errorMessage ??
          `status=${result.statusCode ?? "N/A"}, success=${result.data?.success ?? "N/A"}, message=${agentMessage || "unknown"}, response=${result.responseSummary ?? "n/a"}`;
        const failureMessage = `agents 接口请求失败 tenantId=${tenantId}, detail=${failureDetail}`;
        failures.push(failureMessage);
        await this.sendAlertAndLog(runId, "AGENTS_REQUEST_FAILED", `agents 接口请求失败: ${tenantId}`, failureMessage);
        continue;
      }

      if (this.isCriticalTenant(tenant) && agents.length === 0) {
        counters.agentFailureCount += 1;
        const failureMessage = `关键租户 agents 返回空数组 tenantId=${tenantId}, tenantName=${tenantName ?? "unknown"}`;
        failures.push(failureMessage);
        await this.sendAlertAndLog(runId, "CRITICAL_TENANT_EMPTY_AGENTS", "关键租户 agents 返回空数组", failureMessage);
      }
    }
  }

  private isCriticalTenant(tenant: TenantRecord): boolean {
    const candidates = [tenant.slug, tenant.name, tenant.agentDomain]
      .filter(Boolean)
      .map((value) => String(value).toLowerCase());

    return candidates.some((candidate) => this.config.criticalTenantMatchers.includes(candidate));
  }

  private async sendAlertAndLog(
    runId: string,
    alertType: string,
    alertTitle: string,
    detail: string,
  ): Promise<void> {
    const subject = `[MSPBots Monitor][${alertType}] ${alertTitle}`;
    const text = [
      `告警类型: ${alertType}`,
      `执行批次: ${runId}`,
      `告警标题: ${alertTitle}`,
      `详情: ${detail}`,
      `时间: ${new Date().toISOString()}`,
    ].join("\n");

    const result = await this.alertService.sendAlert({
      subject,
      text,
    });

    await this.repository.logAlert({
      runId,
      alertType,
      alertSubject: subject,
      alertBody: text,
      sendStatus: result.ok ? "sent" : "failed",
      errorMessage: result.ok ? null : result.errorMessage,
    });
  }
}
