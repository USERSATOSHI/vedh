import { cp, mkdir, rm } from 'node:fs/promises';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const output = resolve(root, 'dist');
const external = [
  'better-sqlite3',
  'tree-sitter',
  'tree-sitter-javascript',
  'tree-sitter-php',
  'tree-sitter-python',
  'tree-sitter-typescript',
];

await rm(output, { recursive: true, force: true });
await mkdir(resolve(output, 'viz'), { recursive: true });

const builds = await Promise.all([
  Bun.build({
    entrypoints: [resolve(root, 'packages/cli/src/bin.ts')],
    outdir: output,
    target: 'node',
    external,
    sourcemap: 'external',
  }),
  Bun.build({
    entrypoints: [resolve(root, 'packages/parser/src/parallel/worker.ts')],
    outdir: output,
    target: 'node',
    external,
    sourcemap: 'external',
    naming: 'worker.js',
  }),
]);

for (const build of builds) {
  if (!build.success) {
    for (const log of build.logs) console.error(log);
    process.exitCode = 1;
    throw new Error('Failed to build the Vedh distribution.');
  }
}

await Promise.all([
  cp(resolve(root, 'packages/cli/skill'), resolve(output, 'skill'), {
    recursive: true,
  }),
  cp(
    resolve(root, 'packages/viz/public/index.html'),
    resolve(output, 'viz/index.html'),
  ),
  cp(
    resolve(root, 'packages/viz/public/styles.css'),
    resolve(output, 'viz/styles.css'),
  ),
  cp(
    resolve(root, 'packages/viz/src/client/main.js'),
    resolve(output, 'viz/main.js'),
  ),
]);
