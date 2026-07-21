import { err } from '@usersatoshi/results';

export const enum ParserEngineErrorKind {
  UnsupportedLanguage,
  FileReadFailed,
  ParseFailed,
  Disposed,
}

export type ParserEngineError =
  | {
      kind: ParserEngineErrorKind.UnsupportedLanguage;
      filePath: string;
      language?: string;
    }
  | {
      kind: ParserEngineErrorKind.FileReadFailed;
      filePath: string;
      cause: unknown;
    }
  | {
      kind: ParserEngineErrorKind.ParseFailed;
      filePath: string;
      cause: unknown;
    }
  | { kind: ParserEngineErrorKind.Disposed };

export function toParserEngineError<K extends ParserEngineError['kind']>(
  kind: K,
  details: Omit<Extract<ParserEngineError, { kind: K }>, 'kind'>,
): Extract<ParserEngineError, { kind: K }> {
  return { kind, ...details } as Extract<ParserEngineError, { kind: K }>;
}

export const toParserEngineErr = <
  K extends ParserEngineError['kind'],
  D extends Omit<Extract<ParserEngineError, { kind: K }>, 'kind'>,
>(
  kind: K,
  details: D,
) => err(toParserEngineError(kind, details));
