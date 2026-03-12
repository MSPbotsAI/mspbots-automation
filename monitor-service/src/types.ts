export type MonitorRunStatus = "running" | "success" | "failed";

export interface TenantRecord {
  id: string;
  name?: string;
  slug?: string;
  agentDomain?: string;
  [key: string]: unknown;
}

export interface TenantsResponse {
  code?: number;
  data?: {
    tenants?: TenantRecord[];
    total?: number;
    page?: number;
    pageSize?: number;
    totalPages?: number;
  };
}

export interface AgentsResponse {
  success?: boolean;
  data?: Array<Record<string, unknown>>;
  count?: number;
}

export interface RequestExecutionResult<T> {
  success: boolean;
  statusCode: number | null;
  durationMs: number;
  data: T | null;
  requestUrl: string;
  method: string;
  requestPayload?: string;
  responseSummary?: string | null;
  errorMessage?: string;
}

export interface RequestLogInput {
  runId: string;
  apiName: string;
  tenantId?: string | null;
  tenantName?: string | null;
  requestUrl: string;
  requestMethod: string;
  statusCode?: number | null;
  isSuccess: boolean;
  durationMs: number;
  requestPayload?: string | null;
  responseSummary?: string | null;
  errorMessage?: string | null;
}

export interface AlertLogInput {
  runId?: string | null;
  alertType: string;
  alertSubject: string;
  alertBody: string;
  sendStatus: "sent" | "failed";
  errorMessage?: string | null;
}

export interface RunFinalizeInput {
  status: MonitorRunStatus;
  tenantCount: number;
  tenantSuccessCount: number;
  tenantFailureCount: number;
  agentRequestCount: number;
  agentFailureCount: number;
  errorSummary?: string | null;
}

export function truncateText(value: string | undefined | null, maxLength = 2000): string | null {
  if (!value) {
    return null;
  }
  if (value.length <= maxLength) {
    return value;
  }
  return `${value.slice(0, maxLength)}...[TRUNCATED]`;
}

export function safeStringify(value: unknown, maxLength = 2000): string | null {
  try {
    return truncateText(JSON.stringify(value), maxLength);
  } catch {
    return null;
  }
}

export function toErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  return String(error);
}
