import Database from 'better-sqlite3';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';
import { err, ok, safeCall } from '@usersatoshi/results';
import { CoreDatabaseErrorKind, toCoreDatabaseError } from './error.js';
import type {
  CoreDatabaseContract,
  CoreDatabaseOptions,
  ProjectConfig,
} from './type.js';

export const DEFAULT_SOURCE_INLINE_MAX_LINES = 40;

export class CoreDatabase implements CoreDatabaseContract {
  readonly #database: Database.Database;
  readonly #databasePath: string;
  #closed = false;

  private constructor(database: Database.Database, databasePath: string) {
    this.#database = database;
    this.#databasePath = databasePath;
  }

  static open(options: CoreDatabaseOptions) {
    const opened = safeCall(
      () => {
        const databasePath = CoreDatabase.resolvePath(options);
        const database = new Database(databasePath);
        const connection = new CoreDatabase(database, databasePath);
        const schemaResult = connection.#ensureSchema();
        if (schemaResult.isErr()) {
          database.close();
          return schemaResult;
        }
        return ok(connection);
      },
      (cause) =>
        toCoreDatabaseError(CoreDatabaseErrorKind.OpenFailed, {
          databasePath: '<unresolved>',
          cause,
        }),
    );
    return opened.isErr() ? opened : opened.value;
  }

  static readProjectConfig(projectDir: string): ProjectConfig {
    const configPath = join(projectDir, '.vedh', 'config.json');
    if (!existsSync(configPath)) return {};
    const parsed = safeCall(
      () => JSON.parse(readFileSync(configPath, 'utf8')) as ProjectConfig,
      () =>
        toCoreDatabaseError(CoreDatabaseErrorKind.QueryFailed, {
          sql: 'read config',
          cause: undefined,
        }),
    );
    return parsed.isOk() ? parsed.value : {};
  }

  static resolvePath(options: CoreDatabaseOptions): string {
    const dataDir =
      options.dataDir ?? process.env.VEDH_DATA_DIR ?? join(homedir(), '.vedh');
    const config = options.projectDir
      ? CoreDatabase.readProjectConfig(options.projectDir)
      : {};
    if (options.projectDir && config.local) {
      const directory = join(options.projectDir, config.dbPath ?? '.vedh');
      mkdirSync(directory, { recursive: true });
      CoreDatabase.#writeProjectPointer(
        dataDir,
        options.repoHash,
        options.projectDir,
      );
      return join(directory, 'kb.sqlite');
    }
    const directory = join(dataDir, options.repoHash);
    mkdirSync(directory, { recursive: true });
    return join(directory, 'kb.sqlite');
  }

  static #writeProjectPointer(
    dataDir: string,
    repoHash: string,
    projectDir: string,
  ): void {
    const pointer = safeCall(
      () => {
        const directory = join(dataDir, repoHash);
        mkdirSync(directory, { recursive: true });
        writeFileSync(join(directory, 'local-path'), projectDir, 'utf8');
      },
      () =>
        toCoreDatabaseError(CoreDatabaseErrorKind.QueryFailed, {
          sql: 'write local pointer',
          cause: undefined,
        }),
    );
    void pointer;
  }

  run(sql: string, parameters: readonly unknown[] = []) {
    if (this.#closed)
      return err(toCoreDatabaseError(CoreDatabaseErrorKind.Closed, {}));
    return safeCall(
      () => {
        const result = this.#database.prepare(sql).run(...parameters);
        return {
          changes: result.changes,
          lastInsertRowid: result.lastInsertRowid,
        };
      },
      (cause) =>
        toCoreDatabaseError(CoreDatabaseErrorKind.QueryFailed, { sql, cause }),
    );
  }

  get<T>(sql: string, parameters: readonly unknown[] = []) {
    if (this.#closed)
      return err(toCoreDatabaseError(CoreDatabaseErrorKind.Closed, {}));
    return safeCall(
      () =>
        (this.#database.prepare(sql).get(...parameters) as T | undefined) ??
        null,
      (cause) =>
        toCoreDatabaseError(CoreDatabaseErrorKind.QueryFailed, { sql, cause }),
    );
  }

  all<T>(sql: string, parameters: readonly unknown[] = []) {
    if (this.#closed)
      return err(toCoreDatabaseError(CoreDatabaseErrorKind.Closed, {}));
    return safeCall(
      () => this.#database.prepare(sql).all(...parameters) as T[],
      (cause) =>
        toCoreDatabaseError(CoreDatabaseErrorKind.QueryFailed, { sql, cause }),
    );
  }

  close() {
    if (this.#closed) return ok(undefined);
    const closed = safeCall(
      () => {
        this.#database.close();
        this.#closed = true;
      },
      (cause) =>
        toCoreDatabaseError(CoreDatabaseErrorKind.QueryFailed, {
          sql: 'close',
          cause,
        }),
    );
    return closed;
  }

  #ensureSchema() {
    return safeCall(
      () => {
        this.#database.exec(`
				PRAGMA journal_mode = WAL;
				PRAGMA synchronous = NORMAL;
				PRAGMA foreign_keys = ON;
				CREATE TABLE IF NOT EXISTS repos (
					repo_hash TEXT PRIMARY KEY, url TEXT DEFAULT '', name TEXT DEFAULT '',
					languages TEXT DEFAULT '[]', indexed_at TEXT DEFAULT CURRENT_TIMESTAMP,
					status TEXT DEFAULT 'indexed', commit_hash TEXT DEFAULT '', node_count INTEGER DEFAULT 0,
					file_count INTEGER DEFAULT 0, schema_version TEXT DEFAULT ''
				);
				CREATE TABLE IF NOT EXISTS nodes (
					id TEXT PRIMARY KEY, name TEXT NOT NULL, kind TEXT NOT NULL, file_path TEXT NOT NULL,
					line_start INTEGER NOT NULL, line_end INTEGER NOT NULL,
					column_start INTEGER, column_end INTEGER, offset_start INTEGER, offset_end INTEGER,
					repo_hash TEXT NOT NULL,
					parent_id TEXT, hierarchy_level TEXT DEFAULT 'low', metadata_json TEXT DEFAULT '{}'
				);
				CREATE TABLE IF NOT EXISTS edges (
					source TEXT NOT NULL, target TEXT NOT NULL, type TEXT NOT NULL, weight REAL DEFAULT 1.0,
					metadata_json TEXT DEFAULT '{}', PRIMARY KEY (source, target, type)
				);
				CREATE TABLE IF NOT EXISTS wiki_pages (path TEXT PRIMARY KEY, content TEXT NOT NULL, updated_at TEXT DEFAULT CURRENT_TIMESTAMP);
				CREATE TABLE IF NOT EXISTS file_manifest (file_path TEXT NOT NULL, repo_hash TEXT NOT NULL, content_hash TEXT NOT NULL, mtime INTEGER NOT NULL, PRIMARY KEY (file_path, repo_hash));
				CREATE TABLE IF NOT EXISTS parse_cache (file_path TEXT NOT NULL, repo_hash TEXT NOT NULL, content_hash TEXT NOT NULL, data TEXT NOT NULL, PRIMARY KEY (file_path, repo_hash));
				CREATE INDEX IF NOT EXISTS idx_nodes_repo ON nodes(repo_hash);
				CREATE INDEX IF NOT EXISTS idx_edges_source ON edges(source);
				CREATE INDEX IF NOT EXISTS idx_edges_target ON edges(target);
			`);
        const columns = new Set(
          (
            this.#database.prepare('PRAGMA table_info(nodes)').all() as Array<{
              name: string;
            }>
          ).map((column) => column.name),
        );
        for (const [name, type] of [
          ['column_start', 'INTEGER'],
          ['column_end', 'INTEGER'],
          ['offset_start', 'INTEGER'],
          ['offset_end', 'INTEGER'],
        ] as const)
          if (!columns.has(name))
            this.#database.exec(`ALTER TABLE nodes ADD COLUMN ${name} ${type}`);
      },
      (cause) =>
        toCoreDatabaseError(CoreDatabaseErrorKind.SchemaFailed, {
          databasePath: this.#databasePath,
          cause,
        }),
    );
  }
}

export type {
  CoreDatabaseContract,
  CoreDatabaseOptions,
  ProjectConfig,
  SqlRunResult,
} from './type.js';
export {
  CoreDatabaseErrorKind,
  toCoreDatabaseErr,
  toCoreDatabaseError,
  type CoreDatabaseError,
} from './error.js';
