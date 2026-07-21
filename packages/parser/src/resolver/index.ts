import { existsSync, readFileSync, statSync } from 'node:fs';
import { basename, dirname, extname, join, resolve } from 'node:path';
import { ok, safeCall } from '@usersatoshi/results';
import { ImportResolverErrorKind, toImportResolverError } from './error.js';
import type {
  ImportRequest,
  ImportResolverContract,
  ImportResolverOptions,
  ResolvedImport,
  ResolveSymbolRequest,
} from './type.js';

const DEFAULT_JS_EXTENSIONS = [
  '.ts',
  '.tsx',
  '.mts',
  '.cts',
  '.js',
  '.jsx',
  '.mjs',
  '.cjs',
] as const;

interface TsPaths {
  baseUrl: string;
  paths: Record<string, string[]>;
}

export class ImportResolver implements ImportResolverContract {
  readonly #options: ImportResolverOptions;
  readonly #tsconfigCache = new Map<string, TsPaths | null>();

  constructor(options: ImportResolverOptions = {}) {
    this.#options = options;
  }

  resolve(request: ImportRequest) {
    return safeCall(
      () => this.#resolve(request),
      (cause) =>
        toImportResolverError(ImportResolverErrorKind.ResolutionFailed, {
          specifier: request.specifier,
          importerPath: request.importerPath,
          cause,
        }),
    );
  }

  resolveToSymbol(request: ResolveSymbolRequest) {
    const resolved = this.resolve(request);
    if (resolved.isErr()) return resolved;
    if (!resolved.value) return ok(null);
    return ok({
      ...resolved.value,
      symbolName:
        request.importedName ??
        basename(resolved.value.filePath, extname(resolved.value.filePath)),
    });
  }

  clearCache(): void {
    this.#tsconfigCache.clear();
  }

  #resolve(request: ImportRequest): ResolvedImport | null {
    const specifier = request.specifier;
    const importer = resolve(request.importerPath);
    const root = request.projectRoot ?? this.#options.projectRoot;
    if (/\.py$/i.test(importer)) {
      const filePath = this.#python(specifier, importer, root);
      return filePath ? { filePath, kind: 'python-module' } : null;
    }
    if (/\.php[57]?$/i.test(importer)) {
      for (const base of [dirname(importer), root].filter(
        Boolean,
      ) as string[]) {
        const filePath = resolve(base, specifier);
        if (this.#isFile(filePath)) return { filePath, kind: 'php-include' };
      }
      return null;
    }
    if (specifier.startsWith('.')) {
      const base = resolve(dirname(importer), specifier);
      const extension = extname(base);
      const sourceStem = /^[.]?[cm]?jsx?$/.test(extension)
        ? base.slice(0, -extension.length)
        : base;
      const filePath = this.#probe(base) ?? this.#probe(sourceStem);
      return filePath ? { filePath, kind: 'relative' } : null;
    }
    const aliased = this.#tsPath(specifier, importer);
    if (aliased) return { filePath: aliased, kind: 'tsconfig-path' };
    const packages =
      request.workspacePackages ?? this.#options.workspacePackages;
    if (packages) {
      const match = Object.keys(packages)
        .filter(
          (name) => specifier === name || specifier.startsWith(`${name}/`),
        )
        .sort((a, b) => b.length - a.length)[0];
      if (match) {
        const packageRoot = packages[match]!;
        const subpath =
          specifier === match ? '' : specifier.slice(match.length + 1);
        const filePath = subpath
          ? (this.#probe(join(packageRoot, 'src', subpath)) ??
            this.#probe(join(packageRoot, subpath)))
          : this.#packageEntry(packageRoot);
        if (filePath) return { filePath, kind: 'workspace' };
      }
    }
    return null;
  }

  #probe(base: string): string | null {
    const extensions =
      this.#options.javascriptExtensions ?? DEFAULT_JS_EXTENSIONS;
    for (const candidate of [
      base,
      ...extensions.map((extension) => `${base}${extension}`),
      ...extensions.map((extension) => join(base, `index${extension}`)),
    ])
      if (this.#isFile(candidate)) return resolve(candidate);
    return null;
  }

  #packageEntry(root: string): string | null {
    const packageJson = join(root, 'package.json');
    if (existsSync(packageJson)) {
      try {
        const pkg = JSON.parse(readFileSync(packageJson, 'utf8')) as {
          main?: string;
          module?: string;
          exports?: string | Record<string, unknown>;
        };
        const rootExport =
          typeof pkg.exports === 'string' ? pkg.exports : pkg.exports?.['.'];
        const target =
          typeof rootExport === 'string'
            ? rootExport
            : rootExport && typeof rootExport === 'object'
              ? ((rootExport as Record<string, unknown>).import ??
                (rootExport as Record<string, unknown>).default)
              : (pkg.module ?? pkg.main);
        if (typeof target === 'string') {
          const exact = resolve(root, target);
          if (this.#isFile(exact)) return exact;
          const probed = this.#probe(exact.replace(/\.[^.]+$/, ''));
          if (probed) return probed;
        }
      } catch {
        /* convention fallbacks below */
      }
    }
    return (
      this.#probe(join(root, 'src', 'index')) ??
      this.#probe(join(root, 'index'))
    );
  }

  #python(specifier: string, importer: string, root?: string): string | null {
    const dots = specifier.match(/^\.+/)?.[0].length ?? 0;
    const parts = specifier.slice(dots).split('.').filter(Boolean);
    if (dots) {
      let base = dirname(importer);
      for (let index = 1; index < dots; index += 1) base = dirname(base);
      return this.#pythonProbe(join(base, ...parts));
    }
    let current = dirname(importer);
    while (true) {
      const found = this.#pythonProbe(join(current, ...parts));
      if (found) return found;
      if (root && resolve(current) === resolve(root)) break;
      const parent = dirname(current);
      if (parent === current) break;
      current = parent;
    }
    return null;
  }

  #pythonProbe(base: string): string | null {
    for (const candidate of [`${base}.py`, join(base, '__init__.py')])
      if (this.#isFile(candidate)) return resolve(candidate);
    return null;
  }

  #tsPath(specifier: string, importer: string): string | null {
    const config = this.#nearestTsconfig(dirname(importer));
    if (!config) return null;
    for (const pattern of Object.keys(config.paths).sort(
      (a, b) => b.length - a.length,
    )) {
      const star = pattern.indexOf('*');
      const match =
        star < 0
          ? specifier === pattern
            ? ''
            : null
          : specifier.startsWith(pattern.slice(0, star)) &&
              specifier.endsWith(pattern.slice(star + 1))
            ? specifier.slice(
                pattern.slice(0, star).length,
                specifier.length - pattern.slice(star + 1).length,
              )
            : null;
      if (match === null) continue;
      for (const target of config.paths[pattern] ?? []) {
        const filePath = this.#probe(
          resolve(config.baseUrl, target.replace('*', match)),
        );
        if (filePath) return filePath;
      }
    }
    return null;
  }

  #nearestTsconfig(start: string): TsPaths | null {
    if (this.#tsconfigCache.has(start)) return this.#tsconfigCache.get(start)!;
    let current = start;
    const visited: string[] = [];
    let found: TsPaths | null = null;
    while (true) {
      visited.push(current);
      for (const name of this.#options.tsconfigNames ?? [
        'tsconfig.json',
        'jsconfig.json',
      ]) {
        const file = join(current, name);
        if (!existsSync(file)) continue;
        try {
          const raw = readFileSync(file, 'utf8')
            .replace(/\/\*[\s\S]*?\*\//g, '')
            .replace(/^\s*\/\/.*$/gm, '')
            .replace(/,\s*([}\]])/g, '$1');
          const parsed = JSON.parse(raw) as {
            compilerOptions?: {
              baseUrl?: string;
              paths?: Record<string, string[]>;
            };
          };
          const paths = parsed.compilerOptions?.paths;
          if (paths) {
            found = {
              baseUrl: resolve(current, parsed.compilerOptions?.baseUrl ?? '.'),
              paths,
            };
            break;
          }
        } catch {
          /* continue walking */
        }
      }
      if (found) break;
      const parent = dirname(current);
      if (parent === current) break;
      current = parent;
    }
    for (const directory of visited) this.#tsconfigCache.set(directory, found);
    return found;
  }

  #isFile(path: string): boolean {
    return existsSync(path) && statSync(path).isFile();
  }
}

export type {
  ImportRequest,
  ImportResolutionKind,
  ImportResolverContract,
  ImportResolverOptions,
  ResolvedImport,
  ResolvedSymbol,
  ResolveSymbolRequest,
} from './type.js';

export {
  ImportResolverErrorKind,
  toImportResolverErr,
  toImportResolverError,
} from './error.js';
export type { ImportResolverError } from './error.js';
