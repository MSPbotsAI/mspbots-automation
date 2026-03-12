import { useEffect, useState } from "react";
import { $fetch } from "@mspbots/fetch";
import {
  Alert,
  AlertDescription,
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  ScrollArea,
} from "@mspbots/ui";
import { BarChart3, Play, RefreshCw } from "lucide-react";

export const meta = {
  label: "Home",
  icon: "Home",
  order: 1,
  menu: true,
};

interface MonitorLatestRun {
  run_id: string;
  trigger_source: string;
  status: "running" | "success" | "failed";
  started_at: string;
  finished_at: string | null;
  tenant_count: number;
  tenant_success_count: number;
  tenant_failure_count: number;
  agent_request_count: number;
  agent_failure_count: number;
  error_summary: string | null;
}

interface MonitorAlert {
  run_id: string | null;
  alert_type: string;
  alert_subject: string;
  send_status: string;
  error_message: string | null;
  created_at: string;
}

interface MonitorStatusPayload {
  enabled: boolean;
  running: boolean;
  schedulerStarted: boolean;
  monitorIntervalSeconds: number;
  latestRun: MonitorLatestRun | null;
  recentAlerts: MonitorAlert[];
  todayApiCallCounts: Array<{
    apiName: string;
    callCount: number;
  }>;
  recentRequestHealth: {
    windowMinutes: number;
    totalRequests: number;
    successRequests: number;
    failedRequests: number;
    lastRequestAt: string | null;
  };
}

interface ApiCallTypeCount {
  key: string;
  label: string;
  value: number;
  color: string;
}

const pieColors = [
  "hsl(var(--primary))",
  "hsl(var(--secondary-foreground))",
  "hsl(var(--muted-foreground))",
  "hsl(var(--foreground))",
];

function getApiLabel(apiName: string): string {
  if (apiName === "tenants") {
    return "租户接口";
  }
  if (apiName === "agents") {
    return "Agent接口";
  }
  return apiName;
}

function formatDateTime(value: string | null | undefined): string {
  if (!value) {
    return "-";
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  return date.toLocaleString();
}

function buildApiCallTypeCounts(todayApiCallCounts: MonitorStatusPayload["todayApiCallCounts"]): ApiCallTypeCount[] {
  return todayApiCallCounts.map((item, index) => ({
    key: item.apiName,
    label: getApiLabel(item.apiName),
    value: item.callCount,
    color: pieColors[index % pieColors.length],
  }));
}

function ApiCallPieChart({ todayApiCallCounts }: { todayApiCallCounts: MonitorStatusPayload["todayApiCallCounts"] }) {
  const items = buildApiCallTypeCounts(todayApiCallCounts ?? []);
  const total = items.reduce((sum, item) => sum + item.value, 0);

  let currentPercent = 0;
  const segments = items.map((item) => {
    const start = currentPercent;
    const percent = total > 0 ? (item.value / total) * 100 : 0;
    currentPercent += percent;
    return {
      ...item,
      start,
      end: currentPercent,
      percent,
    };
  });

  const pieBackground =
    total > 0
      ? `conic-gradient(${segments
          .map((segment) => `${segment.color} ${segment.start}% ${segment.end}%`)
          .join(", ")})`
      : "conic-gradient(hsl(var(--muted)) 0% 100%)";

  return (
    <div className="grid gap-4 md:grid-cols-[220px_1fr] items-center">
      <div className="relative h-[220px] w-[220px] mx-auto">
        <div className="h-full w-full rounded-full border" style={{ background: pieBackground }} />
        <div className="absolute inset-[28%] rounded-full bg-background border flex flex-col items-center justify-center">
          <div className="text-xs text-muted-foreground">总调用</div>
          <div className="text-xl font-semibold">{total}</div>
        </div>
      </div>

      <div className="space-y-2">
        {segments.map((segment) => (
          <div key={segment.key} className="flex items-center justify-between rounded-md border px-3 py-2 text-sm">
            <div className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-full" style={{ backgroundColor: segment.color }} />
              <span>{segment.label}</span>
            </div>
            <div className="font-medium">
              {segment.value} 次
              <span className="ml-2 text-xs text-muted-foreground">({total > 0 ? segment.percent.toFixed(1) : "0.0"}%)</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function MonitorReport() {
  const [status, setStatus] = useState<MonitorStatusPayload | null>(null);
  const [loading, setLoading] = useState(false);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastRefreshAt, setLastRefreshAt] = useState<string | null>(null);

  const loadStatus = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await $fetch("/api/monitor/status", { method: "GET" });
      const payload = await response.json() as {
        success: boolean;
        data?: MonitorStatusPayload;
        message?: string;
      };
      if (!response.ok || !payload.success || !payload.data) {
        throw new Error(payload.message || "Failed to load monitor status");
      }
      setStatus(payload.data);
      setLastRefreshAt(new Date().toISOString());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load monitor status");
    } finally {
      setLoading(false);
    }
  };

  const runMonitorOnce = async () => {
    setRunning(true);
    setError(null);
    try {
      const response = await $fetch("/api/monitor/run", { method: "POST" });
      const payload = await response.json() as {
        success: boolean;
        message?: string;
      };
      if (!response.ok || !payload.success) {
        throw new Error(payload.message || "Failed to trigger monitor run");
      }
      await loadStatus();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to trigger monitor run");
    } finally {
      setRunning(false);
    }
  };

  useEffect(() => {
    void loadStatus();
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      void loadStatus();
    }, 60 * 1000);
    return () => clearInterval(timer);
  }, []);

  const latestRun = status?.latestRun;
  const hasAlerts = (status?.recentAlerts.length || 0) > 0;
  const recentHealth = status?.recentRequestHealth;

  const condition1 = (recentHealth?.successRequests ?? 0) > 0;
  const condition2 = (recentHealth?.totalRequests ?? 0) > 0 && (recentHealth?.failedRequests ?? 0) === 0;
  const systemHealthy = condition1 && condition2;

  return (
    <Card>
      <CardHeader>
        <CardTitle>最近一次监控报表</CardTitle>
        <CardDescription>展示最近一次监控任务的执行结果与关键指标</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <Button size="sm" variant="outline" onClick={() => void loadStatus()} disabled={loading || running}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
          <Button size="sm" onClick={() => void runMonitorOnce()} disabled={running || loading}>
            <Play className="mr-2 h-4 w-4" />
            Run Now
          </Button>
          <Badge variant={status?.enabled ? "default" : "secondary"}>
            enabled: {status?.enabled ? "true" : "false"}
          </Badge>
          <Badge variant={status?.schedulerStarted ? "default" : "secondary"}>
            scheduler: {status?.schedulerStarted ? "started" : "stopped"}
          </Badge>
          <Badge variant={status?.running ? "default" : "secondary"}>
            running: {status?.running ? "yes" : "no"}
          </Badge>
        </div>

        {lastRefreshAt && (
          <div className="text-xs text-muted-foreground">
            Last refresh: {formatDateTime(lastRefreshAt)} · Interval: {status?.monitorIntervalSeconds ?? "-"}s
          </div>
        )}

        {error && (
          <Alert>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">系统监控健康状态</CardTitle>
            <CardDescription>判定窗口：最近 {recentHealth?.windowMinutes ?? 10} 分钟</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-[220px_1fr] items-center">
              <div
                className={`flex items-center justify-center rounded-lg py-8 px-6 ${
                  systemHealthy
                    ? "bg-primary text-primary-foreground"
                    : "bg-destructive text-destructive-foreground"
                }`}
              >
                <div className="mr-5 h-24 w-24 rounded-full bg-background/90 ring-4 ring-white/30 flex items-center justify-center">
                  <div className={`h-14 w-14 rounded-full ${systemHealthy ? "bg-green-500" : "bg-red-500"}`} />
                </div>
                <div className="w-full px-5 py-4 text-center">
                  <div className="text-3xl font-bold leading-tight">{systemHealthy ? "系统正常" : "系统异常"}</div>
                  <div className="mt-2 text-lg opacity-90">{systemHealthy ? "绿色=正常" : "红色=有问题"}</div>
                </div>
              </div>

              <div className="space-y-2 text-sm">
                <div className="rounded-md border px-3 py-2">
                  规则1：最近10分钟有正常请求（成功请求数 &gt; 0）
                  <span className="ml-2">{condition1 ? "✅" : "❌"}</span>
                </div>
                <div className="rounded-md border px-3 py-2">
                  规则2：最近10分钟所有请求都成功（失败请求数 = 0）
                  <span className="ml-2">{condition2 ? "✅" : "❌"}</span>
                </div>
                <div className="rounded-md border px-3 py-2 text-muted-foreground">
                  请求统计：总请求 {recentHealth?.totalRequests ?? 0} / 成功 {recentHealth?.successRequests ?? 0} / 失败 {recentHealth?.failedRequests ?? 0}
                </div>
                <div className="rounded-md border px-3 py-2 text-muted-foreground">
                  最近请求时间：{formatDateTime(recentHealth?.lastRequestAt)}
                </div>
                <div className="text-xs text-muted-foreground">页面已启用自动刷新：每 1 分钟刷新一次</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">最近一次监控结果</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 md:grid-cols-2 text-sm">
              <div>
                执行状态：
                <Badge className="ml-2" variant={latestRun?.status === "success" ? "default" : latestRun?.status === "failed" ? "destructive" : "secondary"}>
                  {latestRun?.status || "-"}
                </Badge>
              </div>
              <div>触发来源：{latestRun?.trigger_source || "-"}</div>
              <div>开始时间：{formatDateTime(latestRun?.started_at)}</div>
              <div>结束时间：{formatDateTime(latestRun?.finished_at)}</div>
              <div>租户总数：{latestRun?.tenant_count ?? 0}</div>
              <div>租户成功：{latestRun?.tenant_success_count ?? 0}</div>
              <div>租户失败：{latestRun?.tenant_failure_count ?? 0}</div>
              <div>Agent请求总数：{latestRun?.agent_request_count ?? 0}</div>
              <div>Agent失败数：{latestRun?.agent_failure_count ?? 0}</div>
              <div className="md:col-span-2">Run ID：<span className="font-mono text-xs break-all">{latestRun?.run_id || "-"}</span></div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">接口类型调用次数占比</CardTitle>
            <CardDescription>基于当天累计请求统计</CardDescription>
          </CardHeader>
          <CardContent>
            <ApiCallPieChart todayApiCallCounts={status?.todayApiCallCounts ?? []} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Recent Alerts</CardTitle>
          </CardHeader>
          <CardContent>
            {hasAlerts ? (
              <ScrollArea className="h-56 w-full rounded-md border">
                <div className="min-w-[760px]">
                  <div className="grid grid-cols-5 gap-2 border-b bg-muted/40 px-3 py-2 text-xs font-medium">
                    <div>Time</div>
                    <div>Type</div>
                    <div>Subject</div>
                    <div>Status</div>
                    <div>Run ID</div>
                  </div>
                  {status?.recentAlerts.map((alert, index) => (
                    <div key={`${alert.created_at}-${index}`} className="grid grid-cols-5 gap-2 border-b px-3 py-2 text-xs">
                      <div>{formatDateTime(alert.created_at)}</div>
                      <div>{alert.alert_type}</div>
                      <div className="break-all">{alert.alert_subject}</div>
                      <div>
                        <Badge variant={alert.send_status === "sent" ? "default" : "destructive"}>{alert.send_status}</Badge>
                      </div>
                      <div className="font-mono break-all">{alert.run_id || "-"}</div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            ) : (
              <div className="text-sm text-muted-foreground">No alert records yet.</div>
            )}
          </CardContent>
        </Card>

        {latestRun?.error_summary && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Latest Error Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xs font-mono whitespace-pre-wrap break-all rounded bg-muted p-3">
                {latestRun.error_summary}
              </div>
            </CardContent>
          </Card>
        )}
      </CardContent>
    </Card>
  );
}

export default function Home() {
  return (
    <div className="mx-auto max-w-7xl p-6 space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary shadow-sm ring-1 ring-primary/10">
          <BarChart3 className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-3xl font-bold">Monitor Dashboard</h1>
          <p className="text-muted-foreground">Backend monitoring result report</p>
        </div>
      </div>

      <MonitorReport />
    </div>
  );
}
