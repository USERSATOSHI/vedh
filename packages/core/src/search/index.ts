import { ok, safeCall } from '@usersatoshi/results';
import { CoreDatabase } from '../db/index.js';
import type { SearchServiceContract } from './type.js';

export class SearchService implements SearchServiceContract {
  readonly #db: CoreDatabase;
  constructor(database: CoreDatabase) {
    this.#db = database;
  }
  ensureIndex() {
    const columns = this.#db.all<{ name: string }>(
      'PRAGMA table_info(node_search)',
    );
    if (columns.isErr()) return columns;
    if (
      columns.value.length &&
      !columns.value.some((column) => column.name === 'source')
    ) {
      const dropped = this.#db.run('DROP TABLE node_search');
      if (dropped.isErr()) return dropped;
    }
    const result = this.#db.run(
      "CREATE VIRTUAL TABLE IF NOT EXISTS node_search USING fts5(node_id UNINDEXED, name, kind UNINDEXED, file_path, domain, summary, doc, source, tokenize='porter unicode61')",
    );
    return result.isErr() ? result : ok(undefined);
  }
  populate(repoHash: string) {
    const ready = this.ensureIndex();
    if (ready.isErr()) return ready;
    const cleared = this.#db.run(
      'DELETE FROM node_search WHERE node_id IN (SELECT id FROM nodes WHERE repo_hash = ?)',
      [repoHash],
    );
    if (cleared.isErr()) return cleared;
    const inserted = this.#db.run(
      "INSERT INTO node_search (node_id, name, kind, file_path, domain, summary, doc, source) SELECT id, name, kind, file_path, COALESCE(json_extract(metadata_json, '$.domain'), ''), COALESCE(json_extract(metadata_json, '$.summary'), ''), COALESCE(json_extract(metadata_json, '$.doc'), ''), COALESCE(json_extract(metadata_json, '$.source_code'), '') FROM nodes WHERE repo_hash = ?",
      [repoHash],
    );
    return inserted.isErr() ? inserted : ok(undefined);
  }
  search(repoHash: string, query: string) {
    const clean = query.trim().replace(/["']/g, '').replace(/\s+/g, ' ');
    if (!clean) return ok([]);
    const stopWords = new Set([
      'a',
      'an',
      'and',
      'are',
      'does',
      'for',
      'from',
      'how',
      'in',
      'is',
      'me',
      'of',
      'show',
      'the',
      'to',
      'what',
      'where',
      'which',
      'who',
    ]);
    const terms = (clean.match(/[\p{L}\p{N}_$.-]+/gu) ?? [])
      .map((term) => term.replace(/[.-]+/g, ' ').trim())
      .flatMap((term) => term.split(/\s+/))
      .filter((term) => term.length > 1 && !stopWords.has(term.toLowerCase()));
    const ftsQuery = (terms.length ? terms : [clean])
      .map((term) => `"${term.replaceAll('"', '""')}"*`)
      .join(' OR ');
    const fts = this.#db.all<FtsRow>(
      'SELECT node_id, name, kind, file_path, domain, rank FROM node_search WHERE node_search MATCH ? AND node_id IN (SELECT id FROM nodes WHERE repo_hash = ?) ORDER BY rank LIMIT 50',
      [ftsQuery, repoHash],
    );
    if (fts.isOk())
      return ok(
        fts.value.map((row) => ({
          id: row.node_id,
          label: row.name,
          kind: row.kind,
          filePath: row.file_path,
          domain: row.domain ?? '',
          rank: row.rank ?? 0,
        })),
      );
    const fallback = this.#db.all<FallbackRow>(
      'SELECT id, name, kind, file_path, metadata_json FROM nodes WHERE repo_hash = ? AND (name LIKE ? OR file_path LIKE ? OR metadata_json LIKE ?) LIMIT 50',
      [repoHash, `%${clean}%`, `%${clean}%`, `%${clean}%`],
    );
    if (fallback.isErr()) return fallback;
    return ok(
      fallback.value.map((row) => ({
        id: row.id,
        label: row.name,
        kind: row.kind,
        filePath: row.file_path,
        domain: this.#domain(row.metadata_json),
        rank: 0,
      })),
    );
  }
  clear() {
    const result = this.#db.run('DROP TABLE IF EXISTS node_search');
    return result.isErr() ? result : ok(undefined);
  }
  #domain(raw: string): string {
    const parsed = safeCall(
      () => JSON.parse(raw) as { domain?: unknown },
      () => ({ kind: -1 as const }),
    );
    return parsed.isOk() && typeof parsed.value.domain === 'string'
      ? parsed.value.domain
      : '';
  }
}
interface FtsRow {
  node_id: string;
  name: string;
  kind: string;
  file_path: string;
  domain: string | null;
  rank: number | null;
}
interface FallbackRow {
  id: string;
  name: string;
  kind: string;
  file_path: string;
  metadata_json: string;
}
export type { SearchResult, SearchServiceContract } from './type.js';
