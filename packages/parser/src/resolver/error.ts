import { err } from '@usersatoshi/results';

export const enum ImportResolverErrorKind {
  InvalidOptions,
  ResolutionFailed,
}

export type ImportResolverError =
  | { kind: ImportResolverErrorKind.InvalidOptions; message: string }
  | {
      kind: ImportResolverErrorKind.ResolutionFailed;
      specifier: string;
      importerPath: string;
      cause: unknown;
    };

export function toImportResolverError<K extends ImportResolverError['kind']>(
  kind: K,
  details: Omit<Extract<ImportResolverError, { kind: K }>, 'kind'>,
): Extract<ImportResolverError, { kind: K }> {
  return { kind, ...details } as Extract<ImportResolverError, { kind: K }>;
}

export const toImportResolverErr = <
  K extends ImportResolverError['kind'],
  D extends Omit<Extract<ImportResolverError, { kind: K }>, 'kind'>,
>(
  kind: K,
  details: D,
) => err(toImportResolverError(kind, details));
