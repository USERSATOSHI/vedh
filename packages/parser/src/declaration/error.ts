import { err } from '@usersatoshi/results';

export const enum DeclarationErrorKind {
  ExtractionFailed,
}

export type DeclarationError = {
  kind: DeclarationErrorKind.ExtractionFailed;
  filePath: string;
  cause: unknown;
};

export function toDeclarationError<K extends DeclarationError['kind']>(
  kind: K,
  details: Omit<Extract<DeclarationError, { kind: K }>, 'kind'>,
): Extract<DeclarationError, { kind: K }> {
  return { kind, ...details } as Extract<DeclarationError, { kind: K }>;
}

export const toDeclarationErr = <
  K extends DeclarationError['kind'],
  D extends Omit<Extract<DeclarationError, { kind: K }>, 'kind'>,
>(
  kind: K,
  details: D,
) => err(toDeclarationError(kind, details));
