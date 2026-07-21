import { readFile } from 'node:fs/promises';
import { err, fromAsync, ok, safeCall } from '@usersatoshi/results';
import Parser from 'tree-sitter';
import { DeclarationExtractor } from '../declaration/index.js';
import { EventCallDetector } from '../event/index.js';
import { LanguageRegistry } from '../language/index.js';
import { ParallelFileParser } from '../parallel/index.js';
import type {
  ParseBatchResult,
  ParseDiagnostic,
  ParseResult,
  SourceFile,
} from '../type.js';
import { ParserEngineErrorKind, toParserEngineError } from './error.js';
import type {
  ParseFileOptions,
  ParseFilesOptions,
  ParseOptions,
  ParserEngineContract,
  ParserEngineOptions,
} from './type.js';

export class ParserEngine implements ParserEngineContract {
  readonly #parser = new Parser();
  readonly #registry: LanguageRegistry;
  readonly #declarations = new DeclarationExtractor();
  readonly #eventCalls;
  readonly #onDiagnostic;
  readonly #parallelism;
  readonly #workerSafe;
  #disposed = false;

  constructor(options: ParserEngineOptions = {}) {
    this.#registry = new LanguageRegistry([
      ...LanguageRegistry.builtins(),
      ...(options.languageAdapters ?? []),
    ]);
    this.#eventCalls = options.eventCalls;
    this.#onDiagnostic = options.onDiagnostic;
    this.#parallelism = options.parallelism;
    const builtinIds = new Set([
      'typescript',
      'tsx',
      'javascript',
      'jsx',
      'python',
      'php',
    ]);
    this.#workerSafe = this.#registry
      .languages()
      .every((id) => builtinIds.has(id));
  }

  supportedExtensions(): readonly string[] {
    return this.#registry.extensions();
  }

  parse(file: SourceFile, options: ParseOptions = {}) {
    if (this.#disposed) {
      return err(toParserEngineError(ParserEngineErrorKind.Disposed, {}));
    }

    const language = file.language ?? this.#registry.detect(file.filePath);
    if (!language) {
      return err(
        toParserEngineError(ParserEngineErrorKind.UnsupportedLanguage, {
          filePath: file.filePath,
        }),
      );
    }

    const adapter = this.#registry.get(language);
    if (!adapter) {
      return err(
        toParserEngineError(ParserEngineErrorKind.UnsupportedLanguage, {
          filePath: file.filePath,
          language,
        }),
      );
    }

    const detectorResult = EventCallDetector.create(
      options.eventCalls ?? this.#eventCalls,
    );
    if (detectorResult.isErr()) {
      return err(
        toParserEngineError(ParserEngineErrorKind.ParseFailed, {
          filePath: file.filePath,
          cause: detectorResult.error,
        }),
      );
    }

    const parsedTree = safeCall(
      () => {
        this.#parser.setLanguage(adapter.definition.grammar);
        return this.#parser.parse(file.source);
      },
      (cause) =>
        toParserEngineError(ParserEngineErrorKind.ParseFailed, {
          filePath: file.filePath,
          cause,
        }),
    );
    if (parsedTree.isErr()) return parsedTree;
    const tree = parsedTree.value;
    const context = {
      filePath: file.filePath,
      projectRoot: file.projectRoot,
      language,
    };
    const declarationResult = this.#declarations.extract(
      tree.rootNode,
      context,
      adapter,
    );
    if (declarationResult.isErr())
      return err(
        toParserEngineError(ParserEngineErrorKind.ParseFailed, {
          filePath: file.filePath,
          cause: declarationResult.error,
        }),
      );
    const diagnostics: ParseDiagnostic[] = tree.rootNode.hasError
      ? [
          {
            code: 'syntax-error',
            severity: 'warning',
            message: 'Tree-sitter recovered from one or more syntax errors',
            filePath: file.filePath,
          },
        ]
      : [];
    for (const diagnostic of diagnostics) this.#onDiagnostic?.(diagnostic);
    return ok({
      filePath: file.filePath,
      language,
      declarations: declarationResult.value,
      relations: adapter.extractRelations(tree.rootNode, {
        ...context,
        eventDetector: detectorResult.value,
      }),
      diagnostics,
      hasSyntaxErrors: tree.rootNode.hasError,
    });
  }

  async parseFile(filePath: string, options: ParseFileOptions = {}) {
    return fromAsync(
      async () => {
        const source = await readFile(filePath, 'utf8');
        return this.parse(
          {
            filePath,
            source,
            language: options.language,
            projectRoot: options.projectRoot,
          },
          options,
        );
      },
      (cause) =>
        toParserEngineError(ParserEngineErrorKind.FileReadFailed, {
          filePath,
          cause,
        }),
    ).then((result) => (result.isErr() ? result : result.value));
  }

  async parseFiles(
    filePaths: readonly string[],
    options: ParseFilesOptions = {},
  ) {
    const parallelism = options.parallelism ?? this.#parallelism;
    const threshold =
      parallelism && parallelism.minimumFiles !== undefined
        ? parallelism.minimumFiles
        : 64;
    if (
      parallelism !== false &&
      this.#workerSafe &&
      filePaths.length >= threshold
    ) {
      const parser = new ParallelFileParser(parallelism || {});
      const parsed = await parser.parse(
        filePaths.map((filePath) => ({
          filePath,
          projectRoot:
            options.projectRootForFile?.(filePath) ?? options.projectRoot,
          language: this.#registry.detect(filePath) ?? undefined,
          eventCalls: options.eventCalls ?? this.#eventCalls,
        })),
        options.signal,
      );
      await parser.dispose();
      if (parsed.isOk()) return parsed;
      if (options.continueOnError === false)
        return err(
          toParserEngineError(ParserEngineErrorKind.ParseFailed, {
            filePath: '<workers>',
            cause: parsed.error,
          }),
        );
    }
    const results = new Map<string, ParseResult>();
    const diagnostics: ParseDiagnostic[] = [];

    for (const filePath of filePaths) {
      if (options.signal?.aborted) {
        diagnostics.push({
          code: 'aborted',
          severity: 'warning',
          message: 'Parsing was aborted',
          filePath,
        });
        break;
      }

      const result = await this.parseFile(filePath, {
        projectRoot:
          options.projectRootForFile?.(filePath) ?? options.projectRoot,
        eventCalls: options.eventCalls,
      });
      if (result.isErr()) {
        if (options.continueOnError === false) return result;
        const diagnostic: ParseDiagnostic = {
          code:
            result.error.kind === ParserEngineErrorKind.FileReadFailed
              ? 'file-read-failed'
              : result.error.kind === ParserEngineErrorKind.UnsupportedLanguage
                ? 'unsupported-language'
                : 'parse-failed',
          severity: 'error',
          message: 'Failed to parse file',
          filePath,
        };
        diagnostics.push(diagnostic);
        this.#onDiagnostic?.(diagnostic);
        continue;
      }
      results.set(filePath, result.value);
      diagnostics.push(...result.value.diagnostics);
    }

    const batch: ParseBatchResult = { results, diagnostics };
    return ok(batch);
  }

  dispose(): void {
    this.#disposed = true;
  }
}

export type {
  ParseFileOptions,
  ParseFilesOptions,
  ParseOptions,
  ParserEngineContract,
  ParserEngineOptions,
} from './type.js';
export {
  ParserEngineErrorKind,
  toParserEngineErr,
  toParserEngineError,
  type ParserEngineError,
} from './error.js';
