import type {
  LanguageId,
  ParseBatchResult,
  ParseDiagnostic,
  ParseResult,
  SourceFile,
} from '../type.js';
import type { Result } from '@usersatoshi/results';
import type { EventCallConfig } from '../event/type.js';
import type { LanguageAdapter } from '../language/type.js';
import type { ParallelismOptions } from '../parallel/type.js';
import type { ParserEngineError } from './error.js';

export interface ParserEngineOptions {
  /** Language adapters supplied by extensions. Built-ins are used when omitted. */
  languageAdapters?: readonly LanguageAdapter[];
  /** All built-in languages are enabled when omitted. */
  languages?: readonly LanguageId[];
  /** Default named-event rules used by every parse. */
  eventCalls?: EventCallConfig;
  /** false forces serial parsing. */
  parallelism?: false | ParallelismOptions;
  /** Called on the main thread; never transferred to a worker. */
  onDiagnostic?: (diagnostic: ParseDiagnostic) => void;
}

export interface ParseOptions {
  /** Overrides the engine-level event configuration for this operation. */
  eventCalls?: EventCallConfig;
}

export interface ParseFileOptions extends ParseOptions {
  language?: LanguageId;
  projectRoot?: string;
}

export interface ParseFilesOptions extends ParseOptions {
  /** Project root shared by every file in the batch. */
  projectRoot?: string;
  /** Supports monorepos with different roots per file. */
  projectRootForFile?: (filePath: string) => string | undefined;
  /** Overrides engine-level parallelism for this batch. */
  parallelism?: false | ParallelismOptions;
  /** Continue after per-file failures. Defaults to true. */
  continueOnError?: boolean;
  signal?: AbortSignal;
}

export interface ParserEngineContract {
  supportedExtensions(): readonly string[];
  parse(
    file: SourceFile,
    options?: ParseOptions,
  ): Result<ParseResult, ParserEngineError>;
  parseFile(
    filePath: string,
    options?: ParseFileOptions,
  ): Promise<Result<ParseResult, ParserEngineError>>;
  parseFiles(
    filePaths: readonly string[],
    options?: ParseFilesOptions,
  ): Promise<Result<ParseBatchResult, ParserEngineError>>;
  dispose(): void;
}
