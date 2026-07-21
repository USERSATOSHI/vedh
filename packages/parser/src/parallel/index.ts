import { cpus } from 'node:os';
import { Worker } from 'node:worker_threads';
import { err, ok } from '@usersatoshi/results';
import type {
  ParseBatchResult,
  ParseDiagnostic,
  ParseResult,
} from '../type.js';
import { ParallelParserErrorKind, toParallelParserError } from './error.js';
import type {
  ParallelFileParserContract,
  ParallelismOptions,
  ParseWorkerJob,
  ParseWorkerResponse,
} from './type.js';

export class ParallelFileParser implements ParallelFileParserContract {
  readonly #options: Required<ParallelismOptions>;
  readonly #workers = new Set<Worker>();
  constructor(options: ParallelismOptions = {}) {
    this.#options = {
      workers: options.workers ?? 'auto',
      maxWorkers: Math.max(1, options.maxWorkers ?? 8),
      batchSize: Math.max(1, options.batchSize ?? 32),
      minimumFiles: Math.max(1, options.minimumFiles ?? 64),
    };
  }
  async parse(jobs: readonly ParseWorkerJob[], signal?: AbortSignal) {
    if (signal?.aborted)
      return err(toParallelParserError(ParallelParserErrorKind.Aborted, {}));
    if (!jobs.length) return ok({ results: new Map(), diagnostics: [] });
    const requested =
      this.#options.workers === 'auto'
        ? Math.max(1, cpus().length - 1)
        : Math.max(1, this.#options.workers);
    const count = Math.min(
      this.#options.maxWorkers,
      requested,
      Math.ceil(jobs.length / this.#options.batchSize),
    );
    const batches = Array.from({ length: count }, () => [] as ParseWorkerJob[]);
    jobs.forEach((job, index) => batches[index % count]!.push(job));
    try {
      const responses = (
        await Promise.all(
          batches
            .filter(Boolean)
            .filter((batch) => batch.length)
            .map((batch) => this.#run(batch, signal)),
        )
      ).flat();
      const results = new Map<string, ParseResult>();
      const diagnostics: ParseDiagnostic[] = [];
      for (const response of responses) {
        if (response.result) {
          results.set(response.filePath, response.result);
          diagnostics.push(...response.result.diagnostics);
        } else if (response.diagnostic) diagnostics.push(response.diagnostic);
      }
      return ok({ results, diagnostics } satisfies ParseBatchResult);
    } catch (cause) {
      if (signal?.aborted)
        return err(toParallelParserError(ParallelParserErrorKind.Aborted, {}));
      return err(
        toParallelParserError(ParallelParserErrorKind.WorkerFailed, {
          message: 'A parser worker failed',
          cause,
        }),
      );
    }
  }
  async dispose(): Promise<void> {
    await Promise.all([...this.#workers].map((worker) => worker.terminate()));
    this.#workers.clear();
  }
  #run(
    jobs: ParseWorkerJob[],
    signal?: AbortSignal,
  ): Promise<ParseWorkerResponse[]> {
    return new Promise((resolve, reject) => {
      const worker = new Worker(new URL('./worker.js', import.meta.url), {
        workerData: { jobs },
      });
      this.#workers.add(worker);
      const abort = () => void worker.terminate();
      signal?.addEventListener('abort', abort, { once: true });
      worker.once('message', (responses: ParseWorkerResponse[]) =>
        resolve(responses),
      );
      worker.once('error', reject);
      worker.once('exit', (code) => {
        this.#workers.delete(worker);
        signal?.removeEventListener('abort', abort);
        if (code !== 0 && !signal?.aborted)
          reject(new Error(`Parser worker exited with code ${code}`));
      });
    });
  }
}

export type {
  ParallelFileParserContract,
  ParallelismOptions,
  ParseWorkerJob,
  ParseWorkerResponse,
} from './type.js';
export {
  ParallelParserErrorKind,
  toParallelParserErr,
  toParallelParserError,
  type ParallelParserError,
} from './error.js';
