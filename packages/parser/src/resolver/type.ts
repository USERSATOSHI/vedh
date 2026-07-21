export type ImportResolutionKind =
  'relative' | 'tsconfig-path' | 'workspace' | 'python-module' | 'php-include';

export interface ImportResolverOptions {
  projectRoot?: string;
  /** Package name to absolute package directory. */
  workspacePackages?: Readonly<Record<string, string>>;
  javascriptExtensions?: readonly string[];
  tsconfigNames?: readonly string[];
}

export interface ImportRequest {
  specifier: string;
  importerPath: string;
  projectRoot?: string;
  workspacePackages?: Readonly<Record<string, string>>;
}

export interface ResolvedImport {
  filePath: string;
  kind: ImportResolutionKind;
}

export interface ResolveSymbolRequest extends ImportRequest {
  importedName?: string;
}

export interface ResolvedSymbol extends ResolvedImport {
  symbolName: string;
}

export interface ImportResolverContract {
  resolve(
    request: ImportRequest,
  ): Result<ResolvedImport | null, ImportResolverError>;
  resolveToSymbol(
    request: ResolveSymbolRequest,
  ): Result<ResolvedSymbol | null, ImportResolverError>;
  clearCache(): void;
}
import type { Result } from '@usersatoshi/results';
import type { ImportResolverError } from './error.js';
