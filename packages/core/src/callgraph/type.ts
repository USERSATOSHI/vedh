import type { Result } from '@usersatoshi/results';
import type { EdgeInfo, NodeInfo } from '@vedh/types';
import type { CoreDatabaseError } from '../db/error.js';

export interface CallSite {
  file?: string;
  line?: number;
  column?: number;
  columnStart?: number;
  columnEnd?: number;
  offsetStart?: number;
  offsetEnd?: number;
  receiver?: string;
}
export interface CallChainNode {
  node: NodeInfo;
  depth: number;
  direction: 'caller' | 'callee';
  callSites: CallSite[];
}
export interface CallChain {
  root: NodeInfo | null;
  callers: CallChainNode[];
  callees: CallChainNode[];
  edges: EdgeInfo[];
}
export interface EntryNode {
  node: NodeInfo;
  reason: string;
}
export interface ExecutionNode {
  node: NodeInfo;
  depth: number;
  parentId?: string;
  callSites: CallSite[];
}
export interface ExecutionFlow {
  entries: EntryNode[];
  flow: ExecutionNode[];
  edges: EdgeInfo[];
}
export interface CallGraphServiceContract {
  chain(
    nodeId: string,
    maxDepth?: number,
  ): Result<CallChain, CoreDatabaseError>;
  entryNodes(repoHash: string): Result<EntryNode[], CoreDatabaseError>;
  flow(
    repoHash: string,
    maxDepth?: number,
  ): Result<ExecutionFlow, CoreDatabaseError>;
}
