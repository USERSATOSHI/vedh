import { err } from '@usersatoshi/results';
export const enum CliErrorKind {
  InvalidArguments,
  ProjectNotFound,
  CoreFailed,
  IoFailed,
  ExtensionLoadFailed,
}
export type CliError =
  | { kind: CliErrorKind.InvalidArguments; message: string }
  | { kind: CliErrorKind.ProjectNotFound; projectDir: string }
  | { kind: CliErrorKind.CoreFailed; cause: unknown }
  | { kind: CliErrorKind.IoFailed; path: string; cause: unknown }
  | {
      kind: CliErrorKind.ExtensionLoadFailed;
      specifier: string;
      cause: unknown;
    };
export function toCliError<K extends CliError['kind']>(
  kind: K,
  details: Omit<Extract<CliError, { kind: K }>, 'kind'>,
): Extract<CliError, { kind: K }> {
  return { kind, ...details } as Extract<CliError, { kind: K }>;
}
export const toCliErr = <
  K extends CliError['kind'],
  D extends Omit<Extract<CliError, { kind: K }>, 'kind'>,
>(
  kind: K,
  details: D,
) => err(toCliError(kind, details));
