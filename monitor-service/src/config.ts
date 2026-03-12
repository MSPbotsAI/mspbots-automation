import { toErrorMessage } from "./types.ts";

export interface MonitorConfig {
  enabled: boolean;
  monitorIntervalMs: number;
  runImmediatelyOnStart: boolean;
  requestTimeoutMs: number;
  requestRetryCount: number;
  tenantPageSize: number;
  criticalTenantMatchers: string[];
  tenantApiUrl: string;
  tenantApiToken: string;
  tenantCookieTenantId: string;
  agentApiUrl: string;
  agentApiToken: string;
  agentCookieHost: string;
  mysql: {
    host: string;
    port: number;
    database: string;
    user: string;
    password: string;
    connectionLimit: number;
  };
  smtp: {
    host: string;
    port: number;
    secure: boolean;
    user: string;
    pass: string;
    from: string;
    to: string;
    retryCount: number;
  };
}

function readBoolean(name: string, defaultValue: boolean): boolean {
  const value = Deno.env.get(name);
  if (!value) {
    return defaultValue;
  }
  return ["1", "true", "yes", "on"].includes(value.toLowerCase());
}

function readNumber(name: string, defaultValue: number): number {
  const rawValue = Deno.env.get(name);
  if (!rawValue) {
    return defaultValue;
  }
  const parsed = Number(rawValue);
  if (Number.isNaN(parsed)) {
    throw new Error(`${name} must be a valid number, got: ${rawValue}`);
  }
  return parsed;
}

function readString(name: string, defaultValue?: string): string {
  const value = Deno.env.get(name);
  if (!value || value.trim().length === 0) {
    if (defaultValue !== undefined) {
      return defaultValue;
    }
    throw new Error(`${name} is required`);
  }
  return value.trim();
}

export function loadMonitorConfig(): MonitorConfig {
  const enabled = readBoolean("MONITOR_ENABLED", true);

  const tenantApiUrl = readString(
    "MONITOR_TENANT_API_URL",
    "https://agent.mspbots.ai/apps/mb-platform-user/api/tenants",
  );
  const agentApiUrl = readString(
    "MONITOR_AGENT_API_URL",
    "https://agent.mspbots.ai/apps/mb-platform-agent/api/agents",
  );

  const tenantApiToken = readString("MONITOR_TENANT_API_TOKEN", "");
  const agentApiToken = readString("MONITOR_AGENT_API_TOKEN", "");
  const tenantCookieTenantId = readString("MONITOR_TENANT_COOKIE_TENANT_ID", "");

  if (enabled && (!tenantApiToken || !agentApiToken || !tenantCookieTenantId)) {
    throw new Error(
      "MONITOR_TENANT_API_TOKEN, MONITOR_AGENT_API_TOKEN and MONITOR_TENANT_COOKIE_TENANT_ID are required when MONITOR_ENABLED=true",
    );
  }

  const smtpUser = readString("MONITOR_SMTP_USER", "");
  const smtpPass = readString("MONITOR_SMTP_PASS", "");
  if (enabled && (!smtpUser || !smtpPass)) {
    throw new Error("MONITOR_SMTP_USER and MONITOR_SMTP_PASS are required when MONITOR_ENABLED=true");
  }

  return {
    enabled,
    monitorIntervalMs: readNumber("MONITOR_INTERVAL_SECONDS", 300) * 1000,
    runImmediatelyOnStart: readBoolean("MONITOR_RUN_ON_START", true),
    requestTimeoutMs: readNumber("MONITOR_REQUEST_TIMEOUT_MS", 15000),
    requestRetryCount: readNumber("MONITOR_REQUEST_RETRY", 1),
    tenantPageSize: readNumber("MONITOR_TENANT_PAGE_SIZE", 50),
    criticalTenantMatchers: readString("MONITOR_CRITICAL_TENANTS", "mspbots.ai,mspbots")
      .split(",")
      .map((item) => item.trim().toLowerCase())
      .filter(Boolean),
    tenantApiUrl,
    tenantApiToken,
    tenantCookieTenantId,
    agentApiUrl,
    agentApiToken,
    agentCookieHost: readString("MONITOR_AGENT_COOKIE_HOST", "agent.mspbots.ai"),
    mysql: {
      host: readString("MONITOR_DB_HOST", "localhost"),
      port: readNumber("MONITOR_DB_PORT", 3306),
      database: readString("MONITOR_DB_NAME", "mb_agent"),
      user: readString("MONITOR_DB_USER", "root"),
      password: readString("MONITOR_DB_PASSWORD", "123456"),
      connectionLimit: readNumber("MONITOR_DB_POOL_SIZE", 10),
    },
    smtp: {
      host: readString("MONITOR_SMTP_HOST", "smtp.163.com"),
      port: readNumber("MONITOR_SMTP_PORT", 465),
      secure: readBoolean("MONITOR_SMTP_SECURE", true),
      user: smtpUser,
      pass: smtpPass,
      from: readString("MONITOR_EMAIL_FROM", smtpUser || "m18091286648@163.com"),
      to: readString("MONITOR_EMAIL_TO", "m18091286648@163.com"),
      retryCount: readNumber("MONITOR_ALERT_RETRY", 2),
    },
  };
}

export function describeConfigError(error: unknown): string {
  return `Monitor configuration error: ${toErrorMessage(error)}`;
}
