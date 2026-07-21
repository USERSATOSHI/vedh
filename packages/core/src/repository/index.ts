import { ok, safeCall } from '@usersatoshi/results';
import type { EdgeInfo, NodeInfo, RepoInfo } from '@vedh/types';
import { CoreDatabase } from '../db/index.js';
import type { GraphRepositoryContract, RepositorySnapshot } from './type.js';

export class GraphRepository implements GraphRepositoryContract {
  readonly #db: CoreDatabase;
  constructor(database: CoreDatabase) {
    this.#db = database;
  }

  get database(): CoreDatabase {
    return this.#db;
  }

  initRepo(repoHash: string, url = '', name = '') {
    const result = this.#db.run(
      "INSERT OR IGNORE INTO repos (repo_hash, url, name, languages, indexed_at, status) VALUES (?, ?, ?, '[]', CURRENT_TIMESTAMP, 'indexed')",
      [repoHash, url, name],
    );
    return result.isErr() ? result : ok(undefined);
  }

  getRepo(repoHash: string) {
    return this.#db.get<RepoInfo>(
      'SELECT * FROM repos WHERE repo_hash = ? LIMIT 1',
      [repoHash],
    );
  }

  updateSnapshot(repoHash: string, snapshot: RepositorySnapshot) {
    const result = this.#db.run(
      'UPDATE repos SET commit_hash = COALESCE(?, commit_hash), node_count = ?, file_count = ?, schema_version = COALESCE(?, schema_version), indexed_at = CURRENT_TIMESTAMP WHERE repo_hash = ?',
      [
        snapshot.commitHash ?? null,
        snapshot.nodeCount ?? 0,
        snapshot.fileCount ?? 0,
        snapshot.schemaVersion ?? null,
        repoHash,
      ],
    );
    return result.isErr() ? result : ok(undefined);
  }

  createNode(node: NodeInfo) {
    const result = this.#db.run(
      'INSERT OR REPLACE INTO nodes (id,name,kind,file_path,line_start,line_end,column_start,column_end,offset_start,offset_end,repo_hash,parent_id,hierarchy_level,metadata_json) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)',
      [
        node.id,
        node.name,
        node.kind,
        node.file_path,
        node.line_start,
        node.line_end,
        node.column_start ?? null,
        node.column_end ?? null,
        node.offset_start ?? null,
        node.offset_end ?? null,
        node.repo_hash,
        node.parent_id,
        node.hierarchy_level,
        JSON.stringify(node.metadata),
      ],
    );
    if (result.isErr()) return result;
    if (!node.parent_id) return ok(undefined);
    return this.createEdge({
      source: node.parent_id,
      target: node.id,
      type: 'contains',
      weight: 1,
    });
  }

  getNode(id: string) {
    const result = this.#db.get<NodeRow>(
      'SELECT * FROM nodes WHERE id = ? LIMIT 1',
      [id],
    );
    return result.isErr()
      ? result
      : ok(result.value ? this.#toNode(result.value) : null);
  }

  getNodes(repoHash: string) {
    const result = this.#db.all<NodeRow>(
      'SELECT * FROM nodes WHERE repo_hash = ?',
      [repoHash],
    );
    return result.isErr()
      ? result
      : ok(result.value.map((node) => this.#toNode(node)));
  }

  createEdge(edge: EdgeInfo) {
    const result = this.#db.run(
      'INSERT OR REPLACE INTO edges (source,target,type,weight,metadata_json) VALUES (?,?,?,?,?)',
      [
        edge.source,
        edge.target,
        edge.type,
        edge.weight,
        edge.metadata_json ?? '{}',
      ],
    );
    return result.isErr() ? result : ok(undefined);
  }

  getEdges(nodeId: string) {
    return this.#db.all<EdgeInfo>(
      'SELECT * FROM edges WHERE source = ? OR target = ?',
      [nodeId, nodeId],
    );
  }

  #toNode(row: NodeRow): NodeInfo {
    const parsed = safeCall(
      () => JSON.parse(row.metadata_json) as Record<string, unknown>,
      () => ({ kind: -1 as const }),
    );
    return { ...row, metadata: parsed.isOk() ? parsed.value : {} };
  }
}

interface NodeRow extends Omit<NodeInfo, 'metadata'> {
  metadata_json: string;
}

export type { GraphRepositoryContract, RepositorySnapshot } from './type.js';
