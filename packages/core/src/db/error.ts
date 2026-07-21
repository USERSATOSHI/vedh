import { err } from '@usersatoshi/results';

export const enum CoreDatabaseErrorKind {
  OpenFailed,
  SchemaFailed,
  QueryFailed,
  Closed,
}

export type CoreDatabaseError =
  | {
      kind: CoreDatabaseErrorKind.OpenFailed;
      databasePath: string;
      cause: unknown;
    }
  | {
      kind: CoreDatabaseErrorKind.SchemaFailed;
      databasePath: string;
      cause: unknown;
    }
  | { kind: CoreDatabaseErrorKind.QueryFailed; sql: string; cause: unknown }
  | { kind: CoreDatabaseErrorKind.Closed };

export function toCoreDatabaseError<K extends CoreDatabaseError['kind']>(
  kind: K,
  details: Omit<Extract<CoreDatabaseError, { kind: K }>, 'kind'>,
): Extract<CoreDatabaseError, { kind: K }> {
  return { kind, ...details } as Extract<CoreDatabaseError, { kind: K }>;
}

export const toCoreDatabaseErr = <
  K extends CoreDatabaseError['kind'],
  D extends Omit<Extract<CoreDatabaseError, { kind: K }>, 'kind'>,
>(
  kind: K,
  details: D,
) => err(toCoreDatabaseError(kind, details));
