import type { Result } from '@usersatoshi/results';
import type { CoreDatabaseError } from './error.js';

export interface CoreDatabaseOptions {
  /** Repository hash used to isolate the graph database. */
  repoHash: string;
  /** Project root; enables project-local `.vedh/config.json` storage. */
  projectDir?: string;
  /** Overrides the default global `~/.vedh` data directory. */
  dataDir?: string;
}

export interface ProjectConfig {
  local?: boolean;
  dbPath?: string;
  /** Optional named path globs used by deterministic domain detection. */
  domains?: Record<string, string[]>;
}

export interface SqlRunResult {
  changes: number;
  lastInsertRowid: number | bigint;
}

export interface CoreDatabaseContract {
  run(
    sql: string,
    parameters?: readonly unknown[],
  ): Result<SqlRunResult, CoreDatabaseError>;
  get<T>(
    sql: string,
    parameters?: readonly unknown[],
  ): Result<T | null, CoreDatabaseError>;
  all<T>(
    sql: string,
    parameters?: readonly unknown[],
  ): Result<T[], CoreDatabaseError>;
  close(): Result<void, CoreDatabaseError>;
}
