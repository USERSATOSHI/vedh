import { afterEach, describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { ImportResolver } from './index.js';

const roots: string[] = [];
afterEach(() => {
  for (const root of roots.splice(0))
    rmSync(root, { recursive: true, force: true });
});

describe('ImportResolver', () => {
  test('resolves relative files, tsconfig aliases, workspaces, and Python modules', () => {
    const root = mkdtempSync(join(tmpdir(), 'vedh-resolver-'));
    roots.push(root);
    mkdirSync(join(root, 'src', 'lib'), { recursive: true });
    writeFileSync(join(root, 'src', 'main.ts'), '');
    writeFileSync(join(root, 'src', 'lib', 'value.ts'), '');
    writeFileSync(
      join(root, 'tsconfig.json'),
      JSON.stringify({
        compilerOptions: { baseUrl: '.', paths: { '@/*': ['src/*'] } },
      }),
    );
    mkdirSync(join(root, 'packages', 'pkg', 'src'), { recursive: true });
    writeFileSync(join(root, 'packages', 'pkg', 'src', 'index.ts'), '');
    mkdirSync(join(root, 'py', 'pkg'), { recursive: true });
    writeFileSync(join(root, 'py', 'main.py'), '');
    writeFileSync(join(root, 'py', 'pkg', '__init__.py'), '');
    const resolver = new ImportResolver({
      projectRoot: root,
      workspacePackages: { '@scope/pkg': join(root, 'packages', 'pkg') },
    });
    assert.equal(
      resolver.resolve({
        specifier: './lib/value',
        importerPath: join(root, 'src', 'main.ts'),
      }).value?.kind,
      'relative',
    );
    assert.equal(
      resolver.resolve({
        specifier: './lib/value.js',
        importerPath: join(root, 'src', 'main.ts'),
      }).value?.filePath,
      join(root, 'src', 'lib', 'value.ts'),
    );
    assert.equal(
      resolver.resolve({
        specifier: '@/lib/value',
        importerPath: join(root, 'src', 'main.ts'),
      }).value?.kind,
      'tsconfig-path',
    );
    assert.equal(
      resolver.resolve({
        specifier: '@scope/pkg',
        importerPath: join(root, 'src', 'main.ts'),
      }).value?.kind,
      'workspace',
    );
    assert.equal(
      resolver.resolve({
        specifier: 'pkg',
        importerPath: join(root, 'py', 'main.py'),
        projectRoot: join(root, 'py'),
      }).value?.kind,
      'python-module',
    );
  });
});
