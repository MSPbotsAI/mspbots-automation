import type { RowDataPacket } from "npm:mysql2/promise";

import type { MonitorRunStatus, AlertLogInput, RequestLogInput, RunFinalizeInput, TenantRecord } from "../types.ts";
import { safeStringify, truncateText } from "../types.ts";
import { MonitorDatabase } from "../db.ts";

interface LatestRunRow extends RowDataPacket {
  run_id: string;
  trigger_source: string;
  status: MonitorRunStatus;
  started_at: string;
  finished_at: string | null;
  tenant_count: number;
  tenant_success_count: number;
  tenant_failure_count: number;
  agent_request_count: number;
  agent_failure_count: number;
  error_summary: string | null;
}

interface AlertRow extends RowDataPacket {
  run_id: string | null;
  alert_type: string;
  alert_subject: string;
  send_status: string;
  error_message: string | null;
  created_at: string;
}

interface ApiCallCountRow extends RowDataPacket {
  api_name: string;
  call_count: number;
}

interface RecentRequestHealthRow extends RowDataPacket {
  total_requests: number;
  success_requests: number;
  failed_requests: number;
  last_request_at: string | null;
}

export class MonitorRepository {
  constructor(private readonly db: MonitorDatabase) {}

  async createRun(runId: string, triggerSource: string): Promise<void> {
    await this.db.execute(
      `
      INSERT INTO monitor_runs (run_id, trigger_source, started_at, status)
      VALUES (?, ?, NOW(), 'running')
      `,
      [runId, triggerSource],
    );
  }

  async completeRun(runId: string, input: RunFinalizeInput): Promise<void> {
    await this.db.execute(
      `
      UPDATE monitor_runs
      SET
        finished_at = NOW(),
        status = ?,
        tenant_count = ?,
        tenant_success_count = ?,
        tenant_failure_count = ?,
        agent_request_count = ?,
        agent_failure_count = ?,
        error_summary = ?
      WHERE run_id = ?
      `,
      [
        input.status,
        input.tenantCount,
        input.tenantSuccessCount,
        input.tenantFailureCount,
        input.agentRequestCount,
        input.agentFailureCount,
        truncateText(input.errorSummary ?? null, 4000),
        runId,
      ],
    );
  }

  async upsertTenantCache(tenants: TenantRecord[]): Promise<void> {
    for (const tenant of tenants) {
      await this.db.execute(
        `
        INSERT INTO tenant_cache
        (tenant_id, tenant_slug, tenant_name, tenant_domain, raw_json, last_seen_at)
        VALUES (?, ?, ?, ?, ?, NOW())
        ON DUPLICATE KEY UPDATE
          tenant_slug = VALUES(tenant_slug),
          tenant_name = VALUES(tenant_name),
          tenant_domain = VALUES(tenant_domain),
          raw_json = VALUES(raw_json),
          last_seen_at = VALUES(last_seen_at)
        `,
        [
          tenant.id,
          tenant.slug ?? null,
          tenant.name ?? null,
          tenant.agentDomain ?? null,
          safeStringify(tenant, 15000),
        ],
      );
    }
  }

  async logRequest(input: RequestLogInput): Promise<void> {
    await this.db.execute(
      `
      INSERT INTO request_logs
      (
        run_id,
        api_name,
        tenant_id,
        tenant_name,
        request_url,
        request_method,
        status_code,
        is_success,
        duration_ms,
        request_payload,
        response_summary,
        error_message
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        input.runId,
        input.apiName,
        input.tenantId ?? null,
        input.tenantName ?? null,
        truncateText(input.requestUrl, 1000),
        input.requestMethod,
        input.statusCode ?? null,
        input.isSuccess ? 1 : 0,
        input.durationMs,
        truncateText(input.requestPayload, 8000),
        truncateText(input.responseSummary, 8000),
        truncateText(input.errorMessage, 8000),
      ],
    );
  }

  async logAlert(input: AlertLogInput): Promise<void> {
    await this.db.execute(
      `
      INSERT INTO alert_logs
      (run_id, alert_type, alert_subject, alert_body, send_status, error_message)
      VALUES (?, ?, ?, ?, ?, ?)
      `,
      [
        input.runId ?? null,
        input.alertType,
        truncateText(input.alertSubject, 250),
        truncateText(input.alertBody, 8000),
        input.sendStatus,
        truncateText(input.errorMessage, 4000),
      ],
    );
  }

  async getLatestRun(): Promise<LatestRunRow | null> {
    const rows = await this.db.query<LatestRunRow[]>(
      `
      SELECT
        run_id,
        trigger_source,
        status,
        started_at,
        finished_at,
        tenant_count,
        tenant_success_count,
        tenant_failure_count,
        agent_request_count,
        agent_failure_count,
        error_summary
      FROM monitor_runs
      ORDER BY id DESC
      LIMIT 1
      `,
    );
    return rows.length > 0 ? rows[0] : null;
  }

  async getRecentAlerts(limit = 10): Promise<AlertRow[]> {
    const safeLimit = Math.max(1, Math.min(limit, 100));
    const rows = await this.db.query<AlertRow[]>(
      `
      SELECT
        run_id,
        alert_type,
        alert_subject,
        send_status,
        error_message,
        created_at
      FROM alert_logs
      ORDER BY id DESC
      LIMIT ?
      `,
      [safeLimit],
    );
    return rows;
  }

  async getTodayApiCallCounts(): Promise<Array<{ apiName: string; callCount: number }>> {
    const rows = await this.db.query<ApiCallCountRow[]>(
      `
      SELECT
        api_name,
        COUNT(*) AS call_count
      FROM request_logs
      WHERE created_at >= CURDATE()
        AND created_at < DATE_ADD(CURDATE(), INTERVAL 1 DAY)
      GROUP BY api_name
      ORDER BY call_count DESC
      `,
    );

    return rows.map((row) => ({
      apiName: row.api_name,
      callCount: Number(row.call_count) || 0,
    }));
  }

  async getRecentRequestHealth(minutes = 10): Promise<{
    windowMinutes: number;
    totalRequests: number;
    successRequests: number;
    failedRequests: number;
    lastRequestAt: string | null;
  }> {
    const safeMinutes = Math.max(1, Math.min(minutes, 1440));
    const rows = await this.db.query<RecentRequestHealthRow[]>(
      `
      SELECT
        COUNT(*) AS total_requests,
        SUM(CASE WHEN is_success = 1 THEN 1 ELSE 0 END) AS success_requests,
        SUM(CASE WHEN is_success = 0 THEN 1 ELSE 0 END) AS failed_requests,
        MAX(created_at) AS last_request_at
      FROM request_logs
      WHERE created_at >= DATE_SUB(NOW(), INTERVAL ? MINUTE)
      `,
      [safeMinutes],
    );

    const row = rows[0];
    return {
      windowMinutes: safeMinutes,
      totalRequests: Number(row?.total_requests ?? 0),
      successRequests: Number(row?.success_requests ?? 0),
      failedRequests: Number(row?.failed_requests ?? 0),
      lastRequestAt: row?.last_request_at ?? null,
    };
  }
}
