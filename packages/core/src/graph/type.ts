import type { Result } from '@usersatoshi/results';
import type { EdgeInfo, NodeInfo, Subgraph } from '@vedh/types';
import type { CoreDatabaseError } from '../db/error.js';

export interface GraphWalkOptions {
  maxDepth?: number;
  edgeTypes?: readonly string[];
}
export interface DependencyTreeNode {
  id: string;
  edgeType: string;
  node: NodeInfo;
  children: DependencyTreeNode[];
  callSites?: Array<Record<string, unknown>>;
  subKind?: string;
}
export interface DependencyTree {
  tree: DependencyTreeNode[];
  truncated: boolean;
}
export interface GraphServiceContract {
  walk(
    startNodeId: string,
    options?: GraphWalkOptions,
  ): Result<Subgraph, CoreDatabaseError>;
  impact(
    startNodeId: string,
    options?: GraphWalkOptions,
  ): Result<Subgraph, CoreDatabaseError>;
  shortestPath(
    fromId: string,
    toId: string,
    maxDepth?: number,
  ): Result<string[], CoreDatabaseError>;
  neighbors(nodeId: string): Result<EdgeInfo[], CoreDatabaseError>;
  subgraph(repoHash: string): Result<Subgraph, CoreDatabaseError>;
  dependencyTree(
    nodeId: string,
    direction: 'in' | 'out',
    maxDepth?: number,
    budget?: number,
  ): Result<DependencyTree, CoreDatabaseError>;
}
