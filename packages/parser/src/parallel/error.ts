import { err } from '@usersatoshi/results';

export const enum ParallelParserErrorKind {
  InvalidOptions,
  WorkerFailed,
  Aborted,
}

export type ParallelParserError =
  | { kind: ParallelParserErrorKind.InvalidOptions; message: string }
  | {
      kind: ParallelParserErrorKind.WorkerFailed;
      message: string;
      cause?: unknown;
    }
  | { kind: ParallelParserErrorKind.Aborted };

export function toParallelParserError<K extends ParallelParserError['kind']>(
  kind: K,
  details: Omit<Extract<ParallelParserError, { kind: K }>, 'kind'>,
): Extract<ParallelParserError, { kind: K }> {
  return { kind, ...details } as Extract<ParallelParserError, { kind: K }>;
}

export const toParallelParserErr = <
  K extends ParallelParserError['kind'],
  D extends Omit<Extract<ParallelParserError, { kind: K }>, 'kind'>,
>(
  kind: K,
  details: D,
) => err(toParallelParserError(kind, details));
