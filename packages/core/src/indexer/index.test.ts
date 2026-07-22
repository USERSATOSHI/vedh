import { afterEach, describe, test } from 'node:test';
import assert from 'node:assert/strict';
import {
  mkdtempSync,
  mkdirSync,
  rmSync,
  unlinkSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { ParserEngine } from '@vedh/parser';
import { CoreDatabase } from '../db/index.js';
import { GraphRepository } from '../repository/index.js';
import { GraphService } from '../graph/index.js';
import { CallGraphService } from '../callgraph/index.js';
import { WikiService } from '../wiki/index.js';
import { AnalysisService } from '../analysis/index.js';
import { ProjectIndexer } from './index.js';

const roots: string[] = [];
afterEach(() => {
  for (const root of roots.splice(0))
    rmSync(root, { recursive: true, force: true });
});

describe('ProjectIndexer', () => {
  test('writes declarations across bulk-insert chunk boundaries', async () => {
    const root = mkdtempSync(join(tmpdir(), 'vedh-bulk-index-'));
    roots.push(root);
    const file = join(root, 'many.ts');
    writeFileSync(
      file,
      Array.from(
        { length: 450 },
        (_, index) => `export function declaration${index}() {}`,
      ).join('\n'),
    );
    const repoHash = 'bulk-repo';
    const opened = CoreDatabase.open({
      repoHash,
      projectDir: root,
      dataDir: join(root, 'data'),
    });
    assert.equal(opened.isOk(), true);
    const db = opened.value!;
    const parser = new ParserEngine({ parallelism: false });
    const indexed = await new ProjectIndexer(
      new GraphRepository(db),
      parser,
    ).index({ repoHash, projectDir: root, files: [file] });
    assert.equal(indexed.isOk(), true);
    assert.equal(
      db.get<{ count: number }>(
        'SELECT COUNT(*) AS count FROM nodes WHERE repo_hash=?',
        [repoHash],
      ).value!.count > 400,
      true,
    );
    db.close();
    parser.dispose();
  });

  test('increments deterministically, links calls, and removes deleted files', async () => {
    const root = mkdtempSync(join(tmpdir(), 'vedh-index-'));
    roots.push(root);
    const source = join(root, 'src');
    mkdirSync(source);
    const a = join(source, 'a.ts');
    const b = join(source, 'b.ts');
    writeFileSync(
      join(root, 'package.json'),
      JSON.stringify({ main: './src/b.ts' }),
    );
    writeFileSync(
      a,
      "/** Identifies the fixture. */\nconst marker = '🙂'\n/** Returns the stable target value. */\nexport function target() { return 1 }\n",
    );
    writeFileSync(
      b,
      [
        "import { target } from './a'",
        'export function caller() { return target() }',
        'export class Box {',
        '  #value = 1',
        '  constructor() {}',
        '}',
      ].join('\n'),
    );
    const repoHash = 'test-repo';
    const opened = CoreDatabase.open({
      repoHash,
      projectDir: root,
      dataDir: join(root, 'data'),
    });
    assert.equal(opened.isOk(), true);
    const db = opened.value!;
    const repository = new GraphRepository(db);
    const parser = new ParserEngine({ parallelism: false });
    const indexer = new ProjectIndexer(repository, parser);
    const first = await indexer.index({
      repoHash,
      projectDir: root,
      files: [a, b],
      url: root,
      name: 'fixture',
      workspacePackages: {},
      sourceInlineMaxLines: 0,
    });
    assert.equal(first.isOk(), true);
    assert.equal(first.value!.fullRebuild, true);
    const caller = db.get<{ id: string }>(
      "SELECT id FROM nodes WHERE name='caller'",
    );
    const target = db.get<{ id: string }>(
      "SELECT id FROM nodes WHERE name='target'",
    );
    assert.notEqual(caller.value, null);
    assert.notEqual(target.value, null);
    const wikiService = new WikiService(db);
    const exactSource = wikiService.source(target.value!.id);
    assert.equal(exactSource.isOk(), true);
    assert.equal(exactSource.value, 'function target() { return 1 }');
    const generatedWiki = wikiService.generate(repoHash);
    assert.equal(generatedWiki.isOk(), true);
    assert.equal(generatedWiki.value, 2);
    assert.equal(
      wikiService.get(target.value!.id).value?.content,
      '# target\n\nReturns the stable target value.',
    );
    assert.equal(wikiService.get(caller.value!.id).value, null);
    const constructor = db.get<{ metadata_json: string }>(
      "SELECT metadata_json FROM nodes WHERE name='constructor'",
    ).value!;
    assert.equal(
      (JSON.parse(constructor.metadata_json) as { doc?: string }).doc,
      '',
    );
    const persistedRange = db.get<{
      column_start: number;
      column_end: number;
      offset_start: number;
      offset_end: number;
    }>(
      'SELECT column_start,column_end,offset_start,offset_end FROM nodes WHERE id=?',
      [caller.value!.id],
    ).value!;
    assert.equal(typeof persistedRange.column_start, 'number');
    assert.equal(typeof persistedRange.column_end, 'number');
    assert.equal(typeof persistedRange.offset_start, 'number');
    assert.equal(persistedRange.offset_end > persistedRange.offset_start, true);
    assert.equal(
      db.get<{ count: number }>(
        "SELECT COUNT(*) AS count FROM edges WHERE source=? AND target=? AND type='calls'",
        [caller.value!.id, target.value!.id],
      ).value?.count,
      1,
    );
    const moduleNode = db.get<{ id: string }>(
      "SELECT id FROM nodes WHERE file_path=? AND kind='module'",
      [b],
    ).value!;
    const importTraversal = new GraphService(db).impact(moduleNode.id, {
      maxDepth: 1,
      edgeTypes: ['imports'],
    });
    assert.equal(importTraversal.isOk(), true);
    assert.equal(
      importTraversal.value!.edges.some((edge) => edge.type === 'import'),
      true,
    );
    const entries = new CallGraphService(db).entryNodes(repoHash);
    assert.equal(entries.isOk(), true);
    assert.equal(
      entries.value!.some(
        (entry) =>
          entry.node.name === 'caller' && entry.reason === 'package-entry',
      ),
      true,
    );
    const communities = new AnalysisService(db).detectCommunities(repoHash);
    assert.equal(communities.isOk(), true);
    const fileCommunities = db.all<{ cid: number }>(
      "SELECT DISTINCT json_extract(metadata_json,'$.community_id') AS cid FROM nodes WHERE file_path=?",
      [b],
    );
    assert.equal(fileCommunities.isOk(), true);
    assert.equal(fileCommunities.value!.length, 1);
    assert.equal(
      db.get<{ count: number }>(
        "SELECT COUNT(*) AS count FROM nodes WHERE json_extract(metadata_json,'$.community_id') IS NULL",
      ).value?.count,
      0,
    );
    const second = await indexer.index({
      repoHash,
      projectDir: root,
      files: [a, b],
    });
    assert.equal(second.value!.indexedFiles, 0);
    assert.equal(second.value!.cachedFiles, 2);
    unlinkSync(a);
    const third = await indexer.index({
      repoHash,
      projectDir: root,
      files: [b],
    });
    assert.equal(third.value!.deletedFiles, 1);
    assert.equal(
      db.get<{ count: number }>(
        'SELECT COUNT(*) AS count FROM nodes WHERE file_path=?',
        [a],
      ).value?.count,
      0,
    );
    db.close();
    parser.dispose();
  });

  test('materializes configured events and call graph chains', async () => {
    const root = mkdtempSync(join(tmpdir(), 'vedh-event-'));
    roots.push(root);
    const file = join(root, 'hooks.php');
    writeFileSync(
      file,
      [
        '<?php',
        'function listener() {}',
        'function boot() {',
        "  add_action('ready', 'listener', 20, 1);",
        "  do_action('ready');",
        '}',
      ].join('\n'),
    );
    const repoHash = 'event-repo';
    const opened = CoreDatabase.open({
      repoHash,
      projectDir: root,
      dataDir: join(root, 'data'),
    });
    const db = opened.value!;
    const parser = new ParserEngine({
      parallelism: false,
      eventCalls: {
        fires: { do_action: { eventArgument: 0, eventKind: 'action' } },
        listens: {
          add_action: {
            eventArgument: 0,
            callbackArgument: 1,
            priorityArgument: 2,
            acceptedArgumentsArgument: 3,
            eventKind: 'action',
          },
        },
      },
    });
    const indexed = await new ProjectIndexer(
      new GraphRepository(db),
      parser,
    ).index({ repoHash, projectDir: root, files: [file] });
    assert.equal(indexed.isOk(), true);
    assert.equal(
      db.get<{ count: number }>(
        "SELECT COUNT(*) AS count FROM nodes WHERE kind='event' AND name='ready'",
      ).value?.count,
      1,
    );
    const boot = db.get<{ id: string }>(
      "SELECT id FROM nodes WHERE name='boot'",
    ).value!;
    assert.equal(new CallGraphService(db).chain(boot.id).isOk(), true);
    const chain = new CallGraphService(db).chain(boot.id).value!;
    assert.equal(
      chain.callees.some((entry) => entry.node.name === 'ready'),
      true,
    );
    assert.equal(
      chain.callees.some((entry) => entry.node.name === 'listener'),
      true,
    );
    writeFileSync(file, '<?php\nfunction listener() {}\nfunction boot() {}');
    const refreshed = await new ProjectIndexer(
      new GraphRepository(db),
      parser,
    ).index({ repoHash, projectDir: root, files: [file] });
    assert.equal(refreshed.isOk(), true);
    assert.equal(
      db.get<{ count: number }>(
        "SELECT COUNT(*) AS count FROM nodes WHERE kind='event'",
      ).value?.count,
      0,
    );
    db.close();
    parser.dispose();
  });

  test('keeps node ids unique across monorepo packages with matching layouts', async () => {
    const root = mkdtempSync(join(tmpdir(), 'vedh-monorepo-'));
    roots.push(root);
    const first = join(root, 'packages', 'first', 'src', 'index.ts');
    const second = join(root, 'packages', 'second', 'src', 'index.ts');
    mkdirSync(join(root, 'packages', 'first', 'src'), { recursive: true });
    mkdirSync(join(root, 'packages', 'second', 'src'), { recursive: true });
    writeFileSync(first, 'export function start() { return 1 }\n');
    writeFileSync(second, 'export function start() { return 2 }\n');
    const repoHash = 'monorepo';
    const opened = CoreDatabase.open({
      repoHash,
      projectDir: root,
      dataDir: join(root, 'data'),
    });
    const db = opened.value!;
    const parser = new ParserEngine({ parallelism: false });
    const indexed = await new ProjectIndexer(
      new GraphRepository(db),
      parser,
    ).index({ repoHash, projectDir: root, files: [first, second] });
    assert.equal(indexed.isOk(), true);
    const starts = db.all<{ id: string; file_path: string }>(
      "SELECT id,file_path FROM nodes WHERE name='start' ORDER BY file_path",
    );
    assert.equal(starts.isOk(), true);
    assert.equal(starts.value!.length, 2);
    assert.notEqual(starts.value![0]!.id, starts.value![1]!.id);
    assert.match(starts.value![0]!.id, /^packages\/first\/src\/index\.ts:/);
    assert.match(starts.value![1]!.id, /^packages\/second\/src\/index\.ts:/);
    db.close();
    parser.dispose();
  });
});
