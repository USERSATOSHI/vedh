import type { Result } from '@usersatoshi/results';
import type { CoreDatabaseError } from '../db/error.js';
import type { EdgeInfo, NodeInfo, RepoInfo } from '@vedh/types';

export interface RepositorySnapshot {
  commitHash?: string;
  nodeCount?: number;
  fileCount?: number;
  schemaVersion?: string;
}

export interface GraphRepositoryContract {
  initRepo(
    repoHash: string,
    url?: string,
    name?: string,
  ): Result<void, CoreDatabaseError>;
  getRepo(repoHash: string): Result<RepoInfo | null, CoreDatabaseError>;
  createNode(node: NodeInfo): Result<void, CoreDatabaseError>;
  createNodes(nodes: readonly NodeInfo[]): Result<void, CoreDatabaseError>;
  getNode(id: string): Result<NodeInfo | null, CoreDatabaseError>;
  getNodes(repoHash: string): Result<NodeInfo[], CoreDatabaseError>;
  createEdge(edge: EdgeInfo): Result<void, CoreDatabaseError>;
  createEdges(edges: readonly EdgeInfo[]): Result<void, CoreDatabaseError>;
  getEdges(nodeId: string): Result<EdgeInfo[], CoreDatabaseError>;
}
