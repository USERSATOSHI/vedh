import type {
  LanguageId,
  ParseBatchResult,
  ParseDiagnostic,
  ParseResult,
} from '../type.js';
import type { Result } from '@usersatoshi/results';
import type { EventCallConfig } from '../event/type.js';
import type { ParallelParserError } from './error.js';

export interface ParallelismOptions {
  /** Defaults to automatic CPU-based selection. */
  workers?: number | 'auto';
  /** Upper bound for automatic worker selection. Defaults to 8. */
  maxWorkers?: number;
  /** Files sent to a worker per message. Defaults to 32. */
  batchSize?: number;
  /** Stay serial below this count. Defaults to 64. */
  minimumFiles?: number;
}

export interface ParseWorkerJob {
  filePath: string;
  projectRoot?: string;
  language?: LanguageId;
  eventCalls?: EventCallConfig;
}

export type ParseWorkerResponse =
  | {
      filePath: string;
      result: ParseResult;
      diagnostic?: never;
    }
  | {
      filePath: string;
      result?: never;
      diagnostic: ParseDiagnostic;
    };

export interface ParallelFileParserContract {
  parse(
    jobs: readonly ParseWorkerJob[],
    signal?: AbortSignal,
  ): Promise<Result<ParseBatchResult, ParallelParserError>>;
  dispose(): Promise<void>;
}
