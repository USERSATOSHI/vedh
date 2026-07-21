import { afterEach, test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { ParserEngine } from './index.js';
import type { Declaration } from '../type.js';

const roots: string[] = [];
afterEach(() => {
  for (const root of roots.splice(0))
    rmSync(root, { recursive: true, force: true });
});

test('parallel parser uses workers and returns serializable results', async () => {
  const root = mkdtempSync(join(tmpdir(), 'vedh-workers-'));
  roots.push(root);
  const files = Array.from({ length: 6 }, (_, index) => {
    const file = join(root, `file-${index}.ts`);
    writeFileSync(
      file,
      `export function value${index}() { return ${index} }\n`,
    );
    return file;
  });
  const engine = new ParserEngine({
    parallelism: { minimumFiles: 2, maxWorkers: 2, batchSize: 2 },
  });
  const result = await engine.parseFiles(files, { projectRoot: root });
  assert.equal(result.isOk(), true);
  assert.equal(result.value!.results.size, files.length);
  assert.equal(
    [...result.value!.results.values()].every((parsed) =>
      parsed.declarations.some(
        (declaration: Declaration) =>
          declaration.kind === 'function_declaration',
      ),
    ),
    true,
  );
  engine.dispose();
});

test('TypeScript extraction records imports, normalized heritage, return types, and offsets', () => {
  const engine = new ParserEngine();
  const result = engine.parse({
    filePath: '/repo/src/service.ts',
    projectRoot: '/repo',
    source: [
      "import DefaultThing, { Helper as Alias } from './dependency.js';",
      "import * as Namespace from './namespace.js';",
      'interface Child extends Parent {}',
      'export class Service extends Base implements Runner, Disposable {',
      '  run(): Promise<Result> { return Alias(); }',
      '}',
    ].join('\n'),
  });
  assert.equal(result.isOk(), true);
  const parsed = result.value!;
  const imports = parsed.relations.filter(
    (relation) => relation.kind === 'import',
  );
  assert.deepEqual(
    imports.map((relation) => [relation.module, relation.specifier]),
    [
      ['./dependency.js', 'DefaultThing'],
      ['./dependency.js', 'Helper'],
      ['./namespace.js', 'Namespace'],
    ],
  );
  const references = parsed.relations.filter(
    (relation) => relation.kind === 'reference',
  );
  assert.equal(
    references.some(
      (relation) => relation.role === 'extends' && relation.target === 'Parent',
    ),
    true,
  );
  assert.equal(
    references.some(
      (relation) => relation.role === 'extends' && relation.target === 'Base',
    ),
    true,
  );
  assert.equal(
    references.some(
      (relation) =>
        relation.role === 'implements' && relation.target === 'Runner',
    ),
    true,
  );
  assert.equal(
    references.some(
      (relation) =>
        relation.role === 'return-type' && relation.target === 'Promise',
    ),
    true,
  );
  const service = parsed.declarations.find(
    (declaration) => declaration.name === 'Service',
  );
  assert.equal(service?.parentId, null);
  assert.equal(typeof service?.range.start.offset, 'number');
  assert.equal(typeof service?.range.end.offset, 'number');
  assert.equal(service!.range.end.offset! > service!.range.start.offset!, true);
  engine.dispose();
});
