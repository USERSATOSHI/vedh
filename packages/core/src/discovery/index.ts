import {
  existsSync,
  readFileSync,
  realpathSync,
  readdirSync,
  statSync,
} from 'node:fs';
import { spawnSync } from 'node:child_process';
import { join, relative, resolve, sep } from 'node:path';

export interface WorkspaceInfo {
  name: string;
  directory: string;
}

export interface DiscoveryResult {
  files: string[];
  workspaces: WorkspaceInfo[];
  workspacePackages: Record<string, string>;
}

export interface DiscoveryOptions {
  extensions: readonly string[];
  excludedDirectories?: readonly string[];
}

export class ProjectDiscovery {
  discover(projectRoot: string, options: DiscoveryOptions): DiscoveryResult {
    const root = resolve(projectRoot);
    const extensions = new Set(
      options.extensions.map((extension) => extension.toLowerCase()),
    );
    const excludes = new Set(
      options.excludedDirectories ?? [
        '.git',
        '.vedh',
        '.michi',
        'node_modules',
        'dist',
        'build',
        'coverage',
        '.next',
        '.cache',
      ],
    );
    const patterns = this.#ignorePatterns(root);
    const visited = new Set<string>();
    const files: string[] = [];
    const visit = (directory: string): void => {
      let real: string;
      try {
        real = realpathSync(directory);
      } catch {
        return;
      }
      if (visited.has(real)) return;
      visited.add(real);
      for (const entry of readdirSync(directory, { withFileTypes: true })) {
        if (excludes.has(entry.name)) continue;
        const child = join(directory, entry.name);
        const rel = relative(root, child).split(sep).join('/');
        if (this.#ignored(rel, entry.isDirectory(), patterns)) continue;
        if (entry.isSymbolicLink()) {
          try {
            const stat = statSync(child);
            if (stat.isDirectory()) visit(child);
          } catch {
            /* broken link */
          }
        } else if (entry.isDirectory()) visit(child);
        else if (extensions.has(this.#extension(entry.name)))
          files.push(resolve(child));
      }
    };
    visit(root);
    const gitIgnored = this.#gitIgnored(root, files);
    const workspaces = this.#workspaces(root);
    return {
      files: files.filter((file) => !gitIgnored.has(file)).sort(),
      workspaces,
      workspacePackages: Object.fromEntries(
        workspaces.map((workspace) => [workspace.name, workspace.directory]),
      ),
    };
  }

  #gitIgnored(root: string, files: readonly string[]): Set<string> {
    if (!existsSync(join(root, '.git')) || !files.length) return new Set();
    const relativeFiles = files.map((file) =>
      relative(root, file).split(sep).join('/'),
    );
    const result = spawnSync(
      'git',
      ['-C', root, 'check-ignore', '--stdin', '-z'],
      { input: `${relativeFiles.join('\0')}\0`, encoding: 'utf8' },
    );
    if (result.status !== 0 && result.status !== 1) return new Set();
    return new Set(
      result.stdout
        .split('\0')
        .filter(Boolean)
        .map((file) => resolve(root, file)),
    );
  }

  projectRootForFile(
    filePath: string,
    result: DiscoveryResult,
    fallback: string,
  ): string {
    return (
      result.workspaces
        .filter(
          (workspace) =>
            filePath === workspace.directory ||
            filePath.startsWith(`${workspace.directory}${sep}`),
        )
        .sort((a, b) => b.directory.length - a.directory.length)[0]
        ?.directory ?? fallback
    );
  }

  #extension(name: string): string {
    const index = name.lastIndexOf('.');
    return index < 0 ? '' : name.slice(index).toLowerCase();
  }

  #ignorePatterns(root: string): string[] {
    const patterns: string[] = [];
    for (const file of ['.gitignore', '.vedhignore', '.michiignore']) {
      const path = join(root, file);
      if (!existsSync(path)) continue;
      patterns.push(
        ...readFileSync(path, 'utf8')
          .split(/\r?\n/)
          .map((line) => line.trim())
          .filter((line) => line && !line.startsWith('#')),
      );
    }
    return patterns;
  }

  #ignored(
    path: string,
    directory: boolean,
    patterns: readonly string[],
  ): boolean {
    let ignored = false;
    for (const raw of patterns) {
      const negated = raw.startsWith('!');
      const pattern = negated ? raw.slice(1) : raw;
      if (!pattern) continue;
      const directoryOnly = pattern.endsWith('/');
      if (directoryOnly && !directory) continue;
      const clean = pattern.replace(/^\//, '').replace(/\/$/, '');
      const regex = new RegExp(
        `^(?:.*/)?${clean
          .replace(/[.+^${}()|[\]\\]/g, '\\$&')
          .replace(/\*\*/g, '§§')
          .replace(/\*/g, '[^/]*')
          .replace(/§§/g, '.*')}(?:/.*)?$`,
      );
      if (regex.test(path)) ignored = !negated;
    }
    return ignored;
  }

  #workspaces(root: string): WorkspaceInfo[] {
    const packageJson = join(root, 'package.json');
    if (!existsSync(packageJson)) return [];
    try {
      const parsed = JSON.parse(readFileSync(packageJson, 'utf8')) as {
        workspaces?: string[] | { packages?: string[] };
      };
      const patterns = Array.isArray(parsed.workspaces)
        ? parsed.workspaces
        : (parsed.workspaces?.packages ?? []);
      const directories = new Set<string>();
      for (const pattern of patterns) {
        const star = pattern.indexOf('*');
        if (star < 0) directories.add(resolve(root, pattern));
        else {
          const parent = resolve(
            root,
            pattern.slice(0, star).replace(/\/$/, ''),
          );
          if (!existsSync(parent)) continue;
          for (const entry of readdirSync(parent, { withFileTypes: true }))
            if (entry.isDirectory())
              directories.add(
                join(parent, entry.name, pattern.slice(star + 1)),
              );
        }
      }
      return [...directories].flatMap((directory) => {
        const manifest = join(directory, 'package.json');
        if (!existsSync(manifest)) return [];
        try {
          const value = JSON.parse(readFileSync(manifest, 'utf8')) as {
            name?: string;
          };
          return value.name
            ? [{ name: value.name, directory: resolve(directory) }]
            : [];
        } catch {
          return [];
        }
      });
    } catch {
      return [];
    }
  }
}
