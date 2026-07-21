import type { Result } from '@usersatoshi/results';
import type { CoreDatabaseError } from '../db/error.js';
export interface SearchResult {
  id: string;
  label: string;
  kind: string;
  filePath: string;
  domain: string;
  rank: number;
}
export interface SearchServiceContract {
  ensureIndex(): Result<void, CoreDatabaseError>;
  populate(repoHash: string): Result<void, CoreDatabaseError>;
  search(
    repoHash: string,
    query: string,
  ): Result<SearchResult[], CoreDatabaseError>;
  clear(): Result<void, CoreDatabaseError>;
}
