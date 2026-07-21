import type { Result } from '@usersatoshi/results';
import type { WikiPage } from '@vedh/types';
import type { CoreDatabaseError } from '../db/error.js';
export interface WikiServiceContract {
  save(page: WikiPage): Result<void, CoreDatabaseError>;
  get(path: string): Result<WikiPage | null, CoreDatabaseError>;
  list(): Result<WikiPage[], CoreDatabaseError>;
  remove(path: string): Result<void, CoreDatabaseError>;
  render(markdown: string): string;
  source(nodeId: string): Result<string | null, CoreDatabaseError>;
  generate(repoHash: string): Result<number, CoreDatabaseError>;
}
