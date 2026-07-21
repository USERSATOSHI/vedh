import type { Result } from '@usersatoshi/results';
import type { CentralityResult, CommunityInfo } from '@vedh/types';
import type { CoreDatabaseError } from '../db/error.js';
export interface DomainGroup {
  name: string;
  patterns: string[];
  nodeIds: string[];
}
export interface CommunityMember {
  id: string;
  name: string;
  kind: string;
  filePath: string;
  hierarchyLevel: string;
}
export interface CrossCommunityEdge {
  source: string;
  target: string;
  type: string;
  sourceName: string;
  targetName: string;
}
export interface AnalysisServiceContract {
  centrality(): Result<Map<string, CentralityResult>, CoreDatabaseError>;
  detectHierarchy(): Result<void, CoreDatabaseError>;
  godNodes(repoHash?: string): Result<string[], CoreDatabaseError>;
  detectDomains(
    repoHash: string,
    configuredDomains?: Record<string, string[]>,
  ): Result<DomainGroup[], CoreDatabaseError>;
  detectCommunities(
    repoHash: string,
  ): Result<CommunityInfo[], CoreDatabaseError>;
  communities(
    repoHash: string,
    limit?: number,
  ): Result<CommunityInfo[], CoreDatabaseError>;
  communityMembers(
    repoHash: string,
    communityId: number,
    limit?: number,
  ): Result<CommunityMember[], CoreDatabaseError>;
  crossCommunityEdges(
    repoHash: string,
    communityA: number,
    communityB: number,
    limit?: number,
  ): Result<CrossCommunityEdge[], CoreDatabaseError>;
}
