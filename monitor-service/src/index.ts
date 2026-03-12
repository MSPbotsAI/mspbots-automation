import { describeConfigError, loadMonitorConfig } from "./config.ts";
import { MonitorDatabase } from "./db.ts";
import { PlatformClient } from "./clients/platformClient.ts";
import { AlertService } from "./services/alertService.ts";
import { MonitorRepository } from "./repositories/monitorRepository.ts";
import { MonitorJobRunner } from "./services/monitorJob.ts";

let runnerPromise: Promise<MonitorJobRunner> | null = null;

async function createRunner(): Promise<MonitorJobRunner> {
  const config = loadMonitorConfig();
  const database = new MonitorDatabase(config.mysql);
  await database.ping();
  await database.initSchema();

  const repository = new MonitorRepository(database);
  const platformClient = new PlatformClient(config);
  const alertService = new AlertService(config.smtp);

  return new MonitorJobRunner(config, repository, platformClient, alertService);
}

async function getRunner(): Promise<MonitorJobRunner> {
  if (!runnerPromise) {
    runnerPromise = createRunner();
  }
  return runnerPromise;
}

export async function startMonitorScheduler(): Promise<{ started: boolean; message: string }> {
  try {
    const runner = await getRunner();
    const started = runner.startScheduler();
    return {
      started,
      message: started ? "Monitor scheduler started" : "Monitor scheduler was already started or disabled",
    };
  } catch (error) {
    return {
      started: false,
      message: describeConfigError(error),
    };
  }
}

export async function triggerMonitorRun(triggerSource = "manual-api"): Promise<Record<string, unknown>> {
  const runner = await getRunner();
  return runner.runOnce(triggerSource);
}

export async function getMonitorStatus(): Promise<Record<string, unknown>> {
  const runner = await getRunner();
  return runner.getStatus();
}
