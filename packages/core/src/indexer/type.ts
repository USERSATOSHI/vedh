import type { Result } from '@usersatoshi/results';
import type { ParseDiagnostic } from '@vedh/parser';
import type { CoreDatabaseError } from '../db/error.js';
export interface IndexProjectOptions {
  repoHash: string;
  projectDir: string;
  files: readonly string[];
  url?: string;
  name?: string;
  signal?: AbortSignal;
  fullRebuild?: boolean;
  schemaVersion?: string;
  commitHash?: string;
  workspacePackages?: Readonly<Record<string, string>>;
  sourceInlineMaxLines?: number;
  onProgress?: (progress: IndexProgress) => void;
}
export interface IndexProgress {
  stage: 'hashing' | 'parsing' | 'writing' | 'linking';
  message: string;
  completed?: number;
  total?: number;
}
export interface IndexProjectResult {
  indexedFiles: number;
  indexedNodes: number;
  indexedEdges: number;
  diagnostics: ParseDiagnostic[];
  changedFiles: number;
  deletedFiles: number;
  cachedFiles: number;
  fullRebuild: boolean;
}
export interface ProjectIndexerContract {
  index(
    options: IndexProjectOptions,
  ): Promise<Result<IndexProjectResult, IndexerError>>;
}
export const enum IndexerErrorKind {
  DatabaseFailed,
  ParserFailed,
  Aborted,
}
export type IndexerError =
  | { kind: IndexerErrorKind.DatabaseFailed; cause: CoreDatabaseError }
  | { kind: IndexerErrorKind.ParserFailed; filePath: string; cause: unknown }
  | { kind: IndexerErrorKind.Aborted };
