import type { Result } from '@usersatoshi/results';
import type { CliError } from './error.js';
export interface CliOptions {
  cwd?: string;
  dataDir?: string;
  stdout?: (line: string) => void;
  stderr?: (line: string) => void;
}
export interface VedhCliContract {
  run(argv: readonly string[]): Promise<Result<void, CliError>>;
}
