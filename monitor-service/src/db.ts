import mysql from "npm:mysql2/promise";
import type { Pool, ResultSetHeader, RowDataPacket } from "npm:mysql2/promise";

import type { MonitorConfig } from "./config.ts";

const SCHEMA_SQL_STATEMENTS = [
  `CREATE TABLE IF NOT EXISTS monitor_runs (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    run_id VARCHAR(64) NOT NULL,
    trigger_source VARCHAR(64) NOT NULL,
    started_at DATETIME NOT NULL,
    finished_at DATETIME NULL,
    status VARCHAR(16) NOT NULL,
    tenant_count INT NOT NULL DEFAULT 0,
    tenant_success_count INT NOT NULL DEFAULT 0,
    tenant_failure_count INT NOT NULL DEFAULT 0,
    agent_request_count INT NOT NULL DEFAULT 0,
    agent_failure_count INT NOT NULL DEFAULT 0,
    error_summary TEXT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uk_monitor_runs_run_id (run_id),
    KEY idx_monitor_runs_created_at (created_at)
  )`,
  `CREATE TABLE IF NOT EXISTS tenant_cache (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    tenant_id VARCHAR(64) NOT NULL,
    tenant_slug VARCHAR(255) NULL,
    tenant_name VARCHAR(255) NULL,
    tenant_domain VARCHAR(255) NULL,
    raw_json LONGTEXT NOT NULL,
    last_seen_at DATETIME NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uk_tenant_cache_tenant_id (tenant_id),
    KEY idx_tenant_cache_last_seen_at (last_seen_at)
  )`,
  `CREATE TABLE IF NOT EXISTS request_logs (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    run_id VARCHAR(64) NOT NULL,
    api_name VARCHAR(64) NOT NULL,
    tenant_id VARCHAR(64) NULL,
    tenant_name VARCHAR(255) NULL,
    request_url VARCHAR(1024) NOT NULL,
    request_method VARCHAR(16) NOT NULL,
    status_code INT NULL,
    is_success TINYINT(1) NOT NULL,
    duration_ms INT NOT NULL,
    request_payload LONGTEXT NULL,
    response_summary LONGTEXT NULL,
    error_message LONGTEXT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    KEY idx_request_logs_run_id (run_id),
    KEY idx_request_logs_created_at (created_at),
    KEY idx_request_logs_tenant_id (tenant_id),
    KEY idx_request_logs_api_name (api_name)
  )`,
  `CREATE TABLE IF NOT EXISTS alert_logs (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    run_id VARCHAR(64) NULL,
    alert_type VARCHAR(64) NOT NULL,
    alert_subject VARCHAR(255) NOT NULL,
    alert_body LONGTEXT NOT NULL,
    send_status VARCHAR(32) NOT NULL,
    error_message LONGTEXT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    KEY idx_alert_logs_created_at (created_at),
    KEY idx_alert_logs_run_id (run_id),
    KEY idx_alert_logs_alert_type (alert_type)
  )`,
] as const;

export class MonitorDatabase {
  private readonly pool: Pool;

  constructor(private readonly config: MonitorConfig["mysql"]) {
    this.pool = mysql.createPool({
      host: config.host,
      port: config.port,
      database: config.database,
      user: config.user,
      password: config.password,
      connectionLimit: config.connectionLimit,
      namedPlaceholders: false,
    });
  }

  async ping(): Promise<void> {
    await this.pool.query("SELECT 1");
  }

  async initSchema(): Promise<void> {
    for (const statement of SCHEMA_SQL_STATEMENTS) {
      await this.pool.query(statement);
    }
  }

  async execute(sql: string, params: Array<string | number | boolean | null> = []): Promise<ResultSetHeader> {
    const [result] = await this.pool.query(sql, params);
    return result as ResultSetHeader;
  }

  async query<T extends RowDataPacket[]>(
    sql: string,
    params: Array<string | number | boolean | null> = [],
  ): Promise<T> {
    const [result] = await this.pool.query(sql, params);
    return result as T;
  }

  async close(): Promise<void> {
    await this.pool.end();
  }
}
