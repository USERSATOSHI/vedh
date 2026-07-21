export {
  CoreDatabase,
  DEFAULT_SOURCE_INLINE_MAX_LINES,
  CoreDatabaseErrorKind,
  toCoreDatabaseErr,
  toCoreDatabaseError,
} from './db/index.js';
export type {
  CoreDatabaseContract,
  CoreDatabaseError,
  CoreDatabaseOptions,
  ProjectConfig,
  SqlRunResult,
} from './db/index.js';

export type {
  CentralityResult,
  CommunityInfo,
  CommunityReport,
  EdgeInfo,
  HierarchyLevel,
  NodeInfo,
  Relation,
  RepoInfo,
  Subgraph,
  WikiPage,
} from '@vedh/types';

export { GraphRepository } from './repository/index.js';
export type {
  GraphRepositoryContract,
  RepositorySnapshot,
} from './repository/index.js';

export { GraphService } from './graph/index.js';
export type {
  DependencyTree,
  DependencyTreeNode,
  GraphServiceContract,
  GraphWalkOptions,
} from './graph/index.js';
export { SearchService } from './search/index.js';
export type { SearchResult, SearchServiceContract } from './search/index.js';
export { AnalysisService } from './analysis/index.js';
export type {
  AnalysisServiceContract,
  CommunityMember,
  CrossCommunityEdge,
  DomainGroup,
} from './analysis/index.js';
export {
  ProjectIndexer,
  INDEX_SCHEMA_VERSION,
  IndexerErrorKind,
  toIndexerErr,
  toIndexerError,
} from './indexer/index.js';
export type {
  IndexerError,
  IndexProjectOptions,
  IndexProjectResult,
  ProjectIndexerContract,
} from './indexer/index.js';
export { WikiService } from './wiki/index.js';
export type { WikiServiceContract } from './wiki/index.js';
export { KnowledgeService } from './knowledge/index.js';
export type { EnrichmentOptions, KnowledgeAnswer } from './knowledge/index.js';
export { ProjectDiscovery } from './discovery/index.js';
export type {
  DiscoveryOptions,
  DiscoveryResult,
  WorkspaceInfo,
} from './discovery/index.js';
export { CallGraphService } from './callgraph/index.js';
export type {
  CallChain,
  CallChainNode,
  CallGraphServiceContract,
  CallSite,
  EntryNode,
  ExecutionFlow,
  ExecutionNode,
} from './callgraph/index.js';
