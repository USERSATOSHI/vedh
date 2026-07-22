import { afterEach, describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
import { ProjectDiscovery } from './index.js';

const roots: string[] = [];
afterEach(() => {
  for (const root of roots.splice(0))
    rmSync(root, { recursive: true, force: true });
});

describe('ProjectDiscovery', () => {
  test('combines Git and Vedh ignore rules', () => {
    const root = mkdtempSync(join(tmpdir(), 'vedh-discovery-'));
    roots.push(root);
    assert.equal(spawnSync('git', ['init', '--quiet', root]).status, 0);
    writeFileSync(join(root, '.gitignore'), 'git-ignored.py\n');
    writeFileSync(join(root, '.vedhignore'), 'vedh-ignored.py\n');
    writeFileSync(join(root, 'included.py'), 'def included(): pass\n');
    writeFileSync(join(root, 'git-ignored.py'), 'def ignored(): pass\n');
    writeFileSync(join(root, 'vedh-ignored.py'), 'def ignored(): pass\n');

    const result = new ProjectDiscovery().discover(root, {
      extensions: ['.py'],
    });
    assert.deepEqual(result.files, [join(root, 'included.py')]);
  });
});
