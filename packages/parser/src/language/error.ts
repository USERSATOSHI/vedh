import { err } from '@usersatoshi/results';

export const enum LanguageErrorKind {
  NotRegistered,
  DuplicateRegistration,
  GrammarConfigurationFailed,
}

export type LanguageError =
  | { kind: LanguageErrorKind.NotRegistered; language: string }
  | { kind: LanguageErrorKind.DuplicateRegistration; language: string }
  | {
      kind: LanguageErrorKind.GrammarConfigurationFailed;
      language: string;
      cause: unknown;
    };

export function toLanguageError<K extends LanguageError['kind']>(
  kind: K,
  details: Omit<Extract<LanguageError, { kind: K }>, 'kind'>,
): Extract<LanguageError, { kind: K }> {
  return { kind, ...details } as Extract<LanguageError, { kind: K }>;
}

export const toLanguageErr = <
  K extends LanguageError['kind'],
  D extends Omit<Extract<LanguageError, { kind: K }>, 'kind'>,
>(
  kind: K,
  details: D,
) => err(toLanguageError(kind, details));
