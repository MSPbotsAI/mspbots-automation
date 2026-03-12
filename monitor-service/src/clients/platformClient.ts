import type { MonitorConfig } from "../config.ts";
import type { AgentsResponse, RequestExecutionResult, TenantsResponse } from "../types.ts";
import { safeStringify, toErrorMessage, truncateText } from "../types.ts";

interface RequestOptions {
  url: string;
  method?: string;
  headers?: Record<string, string>;
  body?: unknown;
}

export class PlatformClient {
  constructor(private readonly config: MonitorConfig) {}

  async fetchTenantsPage(page: number, pageSize: number): Promise<RequestExecutionResult<TenantsResponse>> {
    const url = new URL(this.config.tenantApiUrl);
    url.searchParams.set("page", String(page));
    url.searchParams.set("pageSize", String(pageSize));
    const host = url.host;

    return this.requestJson<TenantsResponse>({
      url: url.toString(),
      method: "GET",
      headers: this.buildPlatformHeaders(this.config.tenantApiToken, host, this.config.tenantCookieTenantId),
    });
  }

  async fetchAgentsByTenant(tenantId: string): Promise<RequestExecutionResult<AgentsResponse>> {
    const host = new URL(this.config.agentApiUrl).host;
    return this.requestJson<AgentsResponse>({
      url: this.config.agentApiUrl,
      method: "GET",
      headers: this.buildPlatformHeaders(this.config.agentApiToken, host, tenantId),
    });
  }

  private buildPlatformHeaders(token: string, host: string, tenantId: string): Record<string, string> {
    return {
      accept: "*/*",
      "accept-language": "en",
      authorization: `Bearer ${token}`,
      cookie: `Host=${this.config.agentCookieHost}; X_Tenant_ID=${tenantId}`,
      "x-host": host,
      "x-hostname": host,
      "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36",
    };
  }

  private async requestJson<T>(options: RequestOptions): Promise<RequestExecutionResult<T>> {
    const retryCount = Math.max(0, this.config.requestRetryCount);
    const method = options.method ?? "GET";
    const requestPayload = options.body ? safeStringify(options.body, 2000) : null;

    let lastErrorMessage = "Unknown request failure";
    let finalStatusCode: number | null = null;
    let finalDurationMs = 0;

    for (let attempt = 0; attempt <= retryCount; attempt += 1) {
      const controller = new AbortController();
      const timeoutHandle = setTimeout(() => controller.abort(), this.config.requestTimeoutMs);
      const start = Date.now();

      try {
        const response = await fetch(options.url, {
          method,
          headers: {
            ...(options.body ? { "content-type": "application/json" } : {}),
            ...(options.headers ?? {}),
          },
          body: options.body ? JSON.stringify(options.body) : undefined,
          signal: controller.signal,
        });

        finalDurationMs = Date.now() - start;
        finalStatusCode = response.status;

        const text = await response.text();
        const responseSummary = truncateText(text, 4000) ?? null;
        let parsedBody: T | null = null;

        if (text.length > 0) {
          try {
            parsedBody = JSON.parse(text) as T;
          } catch {
            if (response.ok) {
              lastErrorMessage = "Response body is not valid JSON";
              if (attempt < retryCount) {
                continue;
              }
              return {
                success: false,
                statusCode: finalStatusCode,
                durationMs: finalDurationMs,
                data: null,
                requestUrl: options.url,
                method,
                requestPayload: requestPayload ?? undefined,
                responseSummary,
                errorMessage: lastErrorMessage,
              };
            }
          }
        }

        if (!response.ok) {
          lastErrorMessage = `HTTP ${response.status}`;
          if (attempt < retryCount) {
            continue;
          }
          return {
            success: false,
            statusCode: finalStatusCode,
            durationMs: finalDurationMs,
            data: parsedBody,
            requestUrl: options.url,
            method,
            requestPayload: requestPayload ?? undefined,
            responseSummary,
            errorMessage: lastErrorMessage,
          };
        }

        return {
          success: true,
          statusCode: finalStatusCode,
          durationMs: finalDurationMs,
          data: parsedBody,
          requestUrl: options.url,
          method,
          requestPayload: requestPayload ?? undefined,
          responseSummary,
        };
      } catch (error) {
        finalDurationMs = Date.now() - start;
        lastErrorMessage = toErrorMessage(error);
        if (attempt < retryCount) {
          continue;
        }
      } finally {
        clearTimeout(timeoutHandle);
      }
    }

    return {
      success: false,
      statusCode: finalStatusCode,
      durationMs: finalDurationMs,
      data: null,
      requestUrl: options.url,
      method,
      requestPayload: requestPayload ?? undefined,
      errorMessage: lastErrorMessage,
    };
  }
}
