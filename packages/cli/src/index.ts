#!/usr/bin/env node
import { existsSync } from 'node:fs';
import { cp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { basename, join, resolve } from 'node:path';
import { createRequire } from 'node:module';
import { pathToFileURL } from 'node:url';
import { createHash } from 'node:crypto';
import { clearLine, cursorTo, moveCursor } from 'node:readline';
import { createInterface as createPrompt } from 'node:readline/promises';
import { stdin, stdout } from 'node:process';
import { Command } from 'commander';
import { err, fromAsync, ok, safeCall } from '@usersatoshi/results';
import type { VedhExtension } from '@vedh/extension-api';
import jsTsExtension from '@vedh/extension-js-ts';
import phpExtension from '@vedh/extension-php';
import pythonExtension from '@vedh/extension-python';
import {
  AnalysisService,
  CoreDatabase,
  GraphRepository,
  GraphService,
  KnowledgeService,
  ProjectDiscovery,
  ProjectIndexer,
  SearchService,
  WikiService,
} from '@vedh/core';
import { CliErrorKind, toCliError, type CliError } from './error.js';
import type { CliOptions, VedhCliContract } from './type.js';
import { ExploreCommand, type ExploreOptions } from './explore.js';

export class VedhCli implements VedhCliContract {
  readonly #cwd: string;
  readonly #dataDir: string | undefined;
  readonly #stdout: (line: string) => void;
  constructor(options: CliOptions = {}) {
    this.#cwd = options.cwd ?? process.cwd();
    this.#dataDir = options.dataDir;
    this.#stdout = options.stdout ?? console.log;
  }
  async run(argv: readonly string[]) {
    const normalizedArgv =
      argv.at(-1) === 'help' ? [...argv.slice(0, -1), '--help'] : argv;
    const program = new Command()
      .name('vedh')
      .description('Build and query a codebase knowledge graph.')
      .version('0.1.0')
      .showHelpAfterError()
      .addHelpText(
        'after',
        `\nExamples:\n  vedh init .\n  vedh index .\n  vedh search "ParserEngine"\n  vedh extensions add @acme/vedh-extension-go`,
      );

    program
      .command('init [directory]')
      .description('Initialize .vedh configuration in a project.')
      .action(async (directory) => {
        const result = await this.#init(directory ? [directory] : []);
        if (result.isErr()) this.#printError(result.error);
      });
    program
      .command('index [directory]')
      .description('Parse source files and build the project graph.')
      .option('--full', 'Force a clean rebuild and ignore the parse cache.')
      .option(
        '--llm',
        'Generate optional LLM summaries after deterministic indexing.',
      )
      .option(
        '--generate-missing-docs',
        'Generate missing documentation metadata; implies --llm.',
      )
      .option(
        '--imports-exports-only',
        'Limit LLM enrichment to module/import/export structure.',
      )
      .action(async (directory, options) => {
        const result = await this.#index(
          directory ? [directory] : [],
          options as {
            full?: boolean;
            llm?: boolean;
            generateMissingDocs?: boolean;
            importsExportsOnly?: boolean;
          },
        );
        if (result.isErr()) this.#printError(result.error);
      });
    program
      .command('search <query>')
      .description('Search indexed declarations and file paths.')
      .action(async (query) => {
        const result = await this.#search([query]);
        if (result.isErr()) this.#printError(result.error);
      });
    program
      .command('graph <node-id>')
      .description('Print the connected graph for a node.')
      .action(async (nodeId) => {
        const result = await this.#graph([nodeId]);
        if (result.isErr()) this.#printError(result.error);
      });
    program
      .command('hierarchy')
      .description('Calculate hierarchy and print high-impact nodes.')
      .action(async () => {
        const result = await this.#hierarchy();
        if (result.isErr()) this.#printError(result.error);
      });
    program
      .command('explore <directory> <operation> [args...]')
      .description('Query the graph as structured JSON for people and agents.')
      .option('--scope <globs>', 'Comma-separated file globs to include.')
      .option('--exclude <globs>', 'Comma-separated file globs to exclude.')
      .option('--tier <name>', 'Named scope from .vedh/tiers.json.')
      .option('--limit <number>', 'Maximum returned records.', '100')
      .addHelpText(
        'after',
        `\nOperations:
  search <query>                 Lexical symbol/path search
  node|source|wiki <id>          Inspect a symbol and its generated docs
  callers|callees|chain <id>     Traverse executable relations
  flow [depth]                   Discover entry points and execution flow
  path <from-id> <to-id>         Find a shortest graph path
  neighbors <id>                 List adjacent edges
  bfs <id> [depth] [bfs|dfs] [limit] [edge-types]
  deps <id> [both|in|out] [depth]
  god|nodes|communities|community|cross-community
  hooks [pattern]|calls <name>   Inspect event hooks and call sites
  snapshot|query <question>      Check freshness or query deterministically`,
      )
      .action(async (directory, operation, args, options) => {
        const result = await this.#explore(
          directory,
          operation,
          args,
          options as ExploreOptions,
        );
        if (result.isErr()) this.#printError(result.error);
      });
    program
      .command('query <directory> <question...>')
      .description(
        'Ask a question using lexical retrieval and optional LLM synthesis.',
      )
      .action(async (directory, question) => {
        const result = await this.#explore(directory, 'query', question, {});
        if (result.isErr()) this.#printError(result.error);
      });
    program
      .command('snapshot [directory]')
      .description('Compare the indexed commit with the current checkout.')
      .action(async (directory) => {
        const result = await this.#explore(
          directory ?? this.#cwd,
          'snapshot',
          [],
          {},
        );
        if (result.isErr()) this.#printError(result.error);
      });
    program
      .command('wiki-generate [directory]')
      .description('Generate deterministic per-symbol wiki pages.')
      .action(async (directory) => {
        const projectDir = resolve(directory ?? this.#cwd);
        const db = this.#open(projectDir);
        if (db.isErr()) return this.#printError(db.error);
        const generated = new WikiService(db.value).generate(
          this.#hash(projectDir),
        );
        db.value.close();
        if (generated.isErr())
          this.#printError(
            toCliError(CliErrorKind.CoreFailed, { cause: generated.error }),
          );
        else this.#stdout(`Generated ${generated.value} wiki pages.`);
      });
    program
      .command('mcp [directory]')
      .description('Start the stdio MCP server for an indexed project.')
      .action(async (directory) => {
        const { startMcpServer } = await import('@vedh/mcp');
        startMcpServer(resolve(directory ?? this.#cwd), this.#dataDir);
      });
    const skill = program
      .command('skill')
      .description('Install the Vedh agent skill.');
    skill
      .command('install')
      .description('Install the Vedh skill for a project, user, or globally.')
      .option(
        '--agent <agent>',
        'Target agent: claude, codex, opencode, pi, or all.',
      )
      .option(
        '--scope <scope>',
        'Installation scope: project, user, or global.',
      )
      .action(async (options) => {
        const result = await this.#installSkill(
          options as { agent?: string; scope?: string },
        );
        if (result.isErr()) this.#printError(result.error);
      });
    program
      .command('viz [directory]')
      .description('Start the interactive graph visualizer and HTTP API.')
      .option('--port <number>', 'HTTP port.', '3001')
      .option('--host <host>', 'Bind address.', '0.0.0.0')
      .action(async (directory, options) => {
        const { startVizServer } = await import('@vedh/viz');
        const values = options as { port?: string; host?: string };
        startVizServer(resolve(directory ?? this.#cwd), {
          dataDir: this.#dataDir,
          port: Number(values.port) || 3001,
          host: values.host,
        });
      });
    program
      .command('wiki-import <markdown-file>')
      .description('Store a Markdown file in the project wiki.')
      .action(async (filePath) => {
        const result = await this.#wikiImport([filePath]);
        if (result.isErr()) this.#printError(result.error);
      });

    const extensions = program
      .command('extensions')
      .description('Manage project extension packages.');
    extensions
      .command('add <package>')
      .description('Register an installed extension package.')
      .action(async (specifier) => {
        const result = await this.#extensions(['add', specifier]);
        if (result.isErr()) this.#printError(result.error);
      });
    extensions
      .command('list')
      .description('List registered project extension packages.')
      .action(async () => {
        const result = await this.#extensions(['list']);
        if (result.isErr()) this.#printError(result.error);
      });

    program.action(() => program.outputHelp());
    await program.parseAsync(['node', 'vedh', ...normalizedArgv]);
    return ok(undefined);
  }
  async #init(args: readonly string[]) {
    const projectDir = resolve(args[0] ?? this.#cwd);
    if (!existsSync(projectDir))
      return err(toCliError(CliErrorKind.ProjectNotFound, { projectDir }));
    return fromAsync(
      async () => {
        await mkdir(join(projectDir, '.vedh'), { recursive: true });
        const configPath = join(projectDir, '.vedh', 'config.json');
        if (!existsSync(configPath))
          await writeFile(
            configPath,
            JSON.stringify({ local: true }, null, 2) + '\n',
          );
        this.#stdout(`Initialized ${configPath}`);
      },
      (cause) => toCliError(CliErrorKind.IoFailed, { path: projectDir, cause }),
    );
  }

  async #installSkill(options: { agent?: string; scope?: string }) {
    let agent = options.agent?.toLowerCase();
    let scope = options.scope?.toLowerCase();
    if (!agent) {
      agent = await this.#select('Install the skill for which agent?', [
        ['all', 'All supported agents (.agents/skills)'],
        ['claude', 'Claude Code (.claude/skills)'],
        ['codex', 'Codex (.agents/skills)'],
        ['opencode', 'OpenCode (.opencode/skills)'],
        ['pi', 'Pi (.pi/skills)'],
      ]);
      if (!agent) {
        this.#stdout('Skill installation cancelled.');
        return ok(undefined);
      }
    }
    if (
      agent !== 'claude' &&
      agent !== 'codex' &&
      agent !== 'opencode' &&
      agent !== 'pi' &&
      agent !== 'all'
    )
      return err(
        toCliError(CliErrorKind.InvalidArguments, {
          message: 'Agent must be claude, codex, opencode, pi, or all.',
        }),
      );
    if (!scope) {
      scope = await this.#select('Where should the skill be installed?', [
        ['project', 'Project (current repository)'],
        ['user', 'User (your home directory)'],
        ['global', 'Global (shared user skill directory)'],
      ]);
      if (!scope) {
        this.#stdout('Skill installation cancelled.');
        return ok(undefined);
      }
    }
    if (scope !== 'project' && scope !== 'user' && scope !== 'global')
      return err(
        toCliError(CliErrorKind.InvalidArguments, {
          message: 'Skill scope must be project, user, or global.',
        }),
      );

    const home = process.env.HOME ?? process.env.USERPROFILE;
    if (!home)
      return err(
        toCliError(CliErrorKind.IoFailed, {
          path: 'HOME',
          cause: new Error('Unable to determine the home directory.'),
        }),
      );
    const targets =
      agent === 'all'
        ? [join(this.#skillBase('shared', scope, home), 'vedh')]
        : [join(this.#skillBase(agent, scope, home), 'vedh')];
    return fromAsync(
      async () => {
        const source = this.#skillDirectory();
        for (const target of targets) {
          await mkdir(resolve(target, '..'), { recursive: true });
          for (const obsolete of [
            join('agents', 'openai.yaml'),
            join('references', 'architecture.md'),
            join('references', 'integrations.md'),
          ])
            await rm(join(target, obsolete), { force: true });
          await cp(source, target, { recursive: true, force: true });
          this.#stdout(
            `Installed Vedh skill (${agent}, ${scope}) at ${target}`,
          );
        }
      },
      (cause) =>
        toCliError(CliErrorKind.IoFailed, { path: targets.join(', '), cause }),
    );
  }

  async #select(
    question: string,
    options: readonly [string, string][],
  ): Promise<string | undefined> {
    if (!stdin.isTTY || !stdout.isTTY) {
      const prompt = createPrompt({ input: stdin, output: stdout });
      const answer = await prompt.question(`${question} `);
      prompt.close();
      const selected = options.find(
        ([value]) => value === answer.trim().toLowerCase(),
      );
      if (selected) return selected[0];
      throw new Error(
        `Choose one of: ${options.map(([value]) => value).join(', ')}`,
      );
    }
    let selected = 0;
    const draw = () => {
      stdout.write(`${question}\n`);
      for (let index = 0; index < options.length; index += 1)
        stdout.write(
          `${index === selected ? '❯' : ' '} ${options[index]![1]}\n`,
        );
    };
    draw();
    stdin.setRawMode(true);
    stdin.resume();
    return new Promise((resolve) => {
      const cleanup = () => {
        stdin.off('data', onData);
        stdin.setRawMode(false);
        stdin.pause();
        clearLine(stdout, 0);
        cursorTo(stdout, 0);
      };
      const onData = (chunk: Buffer) => {
        const key = chunk.toString();
        if (key === '\u0003' || key === '\u001b' || key === 'q') {
          cleanup();
          resolve(undefined);
          return;
        }
        if (key === '\u001b[A' || key === 'k')
          selected = (selected + options.length - 1) % options.length;
        else if (key === '\u001b[B' || key === 'j')
          selected = (selected + 1) % options.length;
        else if (key === '\r' || key === '\n') {
          cleanup();
          resolve(options[selected]![0]);
          return;
        } else return;
        moveCursor(stdout, 0, -(options.length + 1));
        draw();
      };
      stdin.on('data', onData);
    });
  }

  #skillBase(agent: string, scope: string, home: string) {
    if (agent === 'shared') {
      return scope === 'project'
        ? join(this.#cwd, '.agents', 'skills')
        : join(home, '.agents', 'skills');
    }
    if (scope === 'project') {
      return join(
        this.#cwd,
        agent === 'claude'
          ? '.claude'
          : agent === 'codex'
            ? '.agents'
            : agent === 'opencode'
              ? '.opencode'
              : '.pi',
        'skills',
      );
    }
    if (agent === 'claude') return join(home, '.claude', 'skills');
    if (agent === 'codex')
      return join(process.env.CODEX_HOME ?? join(home, '.codex'), 'skills');
    return join(
      agent === 'opencode'
        ? (process.env.XDG_CONFIG_HOME ?? join(home, '.config'))
        : join(home, '.pi', 'agent'),
      ...(agent === 'opencode' ? ['opencode'] : []),
      'skills',
    );
  }

  #skillDirectory() {
    const candidates = [
      join(import.meta.dirname, 'skill'),
      join(resolve(import.meta.dirname, '..'), 'skill'),
    ];
    const candidate = candidates.find((path) =>
      existsSync(join(path, 'SKILL.md')),
    );
    if (candidate) return candidate;
    throw new Error('Bundled Vedh skill was not found.');
  }
  async #index(
    args: readonly string[],
    flags: {
      full?: boolean;
      llm?: boolean;
      generateMissingDocs?: boolean;
      importsExportsOnly?: boolean;
    } = {},
  ) {
    const projectDir = resolve(args[0] ?? this.#cwd);
    const config = CoreDatabase.readProjectConfig(projectDir);
    const database = this.#open(projectDir);
    if (database.isErr()) return database;
    const repoHash = this.#hash(projectDir);
    const extensions = await this.#loadExtensions(projectDir);
    if (extensions.isErr()) return extensions;
    const parser = await fromAsync(
      async () => {
        const { ParserEngine } = await import('@vedh/parser');
        return new ParserEngine({
          languageAdapters: extensions.value.flatMap(
            (extension) => extension.languageAdapters ?? [],
          ),
          eventCalls: this.#eventCalls(extensions.value),
        });
      },
      (cause) => toCliError(CliErrorKind.CoreFailed, { cause }),
    );
    if (parser.isErr()) return parser;
    const discovery = new ProjectDiscovery();
    const discovered = discovery.discover(projectDir, {
      extensions: parser.value.supportedExtensions(),
    });
    if (discovered.workspaces.length > 0)
      this.#stdout(
        `◇  Monorepo detected: ${discovered.workspaces.length} workspace package(s).`,
      );
    this.#stdout(
      `◇  Indexing ${discovered.files.length} supported source file(s).`,
    );
    const indexer = new ProjectIndexer(
      new GraphRepository(database.value),
      parser.value,
    );
    const result = await indexer.index({
      repoHash,
      projectDir,
      files: discovered.files,
      url: projectDir,
      name: basename(projectDir),
      fullRebuild: flags.full,
      sourceInlineMaxLines: this.#sourceInlineMaxLines(config),
      workspacePackages: discovered.workspacePackages,
    });
    if (result.isErr())
      return err(toCliError(CliErrorKind.CoreFailed, { cause: result.error }));
    this.#stdout(
      `◆  ${result.value.fullRebuild ? 'Full rebuild' : 'Incremental update'}: parsed ${result.value.indexedFiles}, cached ${result.value.cachedFiles}, deleted ${result.value.deletedFiles}.`,
    );
    this.#stdout(
      `◇  Wrote ${result.value.indexedNodes} nodes and ${result.value.indexedEdges} dependency edges.`,
    );
    this.#stdout('◇  Assigned hierarchy levels based on centrality...');
    const analysis = new AnalysisService(database.value);
    const hierarchy = analysis.detectHierarchy();
    if (hierarchy.isErr()) {
      database.value.close();
      return err(
        toCliError(CliErrorKind.CoreFailed, { cause: hierarchy.error }),
      );
    }
    const godNodes = analysis.godNodes(repoHash);
    if (godNodes.isErr()) {
      database.value.close();
      return err(
        toCliError(CliErrorKind.CoreFailed, { cause: godNodes.error }),
      );
    }
    const communities = analysis.detectCommunities(repoHash);
    if (communities.isErr()) {
      database.value.close();
      return err(
        toCliError(CliErrorKind.CoreFailed, { cause: communities.error }),
      );
    }
    const domains = analysis.detectDomains(repoHash, config.domains);
    if (domains.isErr()) {
      database.value.close();
      return err(toCliError(CliErrorKind.CoreFailed, { cause: domains.error }));
    }
    let enriched = 0;
    if (flags.llm || flags.generateMissingDocs)
      enriched = await new KnowledgeService(database.value).enrich(repoHash, {
        generateMissingDocs: flags.generateMissingDocs,
        importsExportsOnly: flags.importsExportsOnly,
      });
    const wiki = new WikiService(database.value).generate(repoHash);
    if (wiki.isErr()) {
      database.value.close();
      return err(toCliError(CliErrorKind.CoreFailed, { cause: wiki.error }));
    }
    const search = new SearchService(database.value).populate(repoHash);
    database.value.close();
    if (search.isErr())
      return err(toCliError(CliErrorKind.CoreFailed, { cause: search.error }));
    this.#stdout(
      `●  Found ${godNodes.value.length} "god" nodes (highly connected).`,
    );
    this.#stdout(
      `◇  Detected ${domains.value.length} domains and ${communities.value.length} communities; generated ${wiki.value} wiki pages.`,
    );
    if (flags.llm || flags.generateMissingDocs)
      this.#stdout(`◇  Added optional LLM enrichment to ${enriched} symbols.`);
    return ok(undefined);
  }
  async #search(args: readonly string[]) {
    const query = args.join(' ');
    if (!query)
      return err(
        toCliError(CliErrorKind.InvalidArguments, {
          message: 'Usage: vedh search <query>',
        }),
      );
    const projectDir = this.#cwd;
    const db = this.#open(projectDir);
    if (db.isErr()) return db;
    const result = new SearchService(db.value).search(
      this.#hash(projectDir),
      query,
    );
    db.value.close();
    if (result.isErr())
      return err(toCliError(CliErrorKind.CoreFailed, { cause: result.error }));
    for (const item of result.value)
      this.#stdout(`${item.id}\t${item.kind}\t${item.filePath}\t${item.label}`);
    return ok(undefined);
  }
  async #graph(args: readonly string[]) {
    const id = args[0];
    if (!id)
      return err(
        toCliError(CliErrorKind.InvalidArguments, {
          message: 'Usage: vedh graph <node-id>',
        }),
      );
    const db = this.#open(this.#cwd);
    if (db.isErr()) return db;
    const graph = new GraphService(db.value).walk(id);
    db.value.close();
    if (graph.isErr())
      return err(toCliError(CliErrorKind.CoreFailed, { cause: graph.error }));
    this.#stdout(JSON.stringify(graph.value, null, 2));
    return ok(undefined);
  }
  async #hierarchy() {
    const db = this.#open(this.#cwd);
    if (db.isErr()) return db;
    const analysis = new AnalysisService(db.value);
    const detected = analysis.detectHierarchy();
    const gods = detected.isOk()
      ? analysis.godNodes(this.#hash(this.#cwd))
      : detected;
    db.value.close();
    if (gods.isErr())
      return err(toCliError(CliErrorKind.CoreFailed, { cause: gods.error }));
    this.#stdout(gods.value.join('\n'));
    return ok(undefined);
  }
  async #wikiImport(args: readonly string[]) {
    const filePath = resolve(args[0] ?? '');
    if (!args[0])
      return err(
        toCliError(CliErrorKind.InvalidArguments, {
          message: 'Usage: vedh wiki-import <markdown-file>',
        }),
      );
    const content = await fromAsync(
      () => readFile(filePath, 'utf8'),
      (cause) => toCliError(CliErrorKind.IoFailed, { path: filePath, cause }),
    );
    if (content.isErr()) return content;
    const db = this.#open(this.#cwd);
    if (db.isErr()) return db;
    const saved = new WikiService(db.value).save({
      path: basename(filePath),
      title: basename(filePath).replace(/\.md$/, ''),
      summary: '',
      content: content.value,
    });
    db.value.close();
    if (saved.isErr())
      return err(toCliError(CliErrorKind.CoreFailed, { cause: saved.error }));
    this.#stdout(`Imported ${filePath}`);
    return ok(undefined);
  }
  async #explore(
    directory: string,
    operation: string,
    args: readonly string[],
    options: ExploreOptions,
  ) {
    return new ExploreCommand(this.#dataDir, this.#stdout).run(
      directory,
      operation,
      args,
      options,
    );
  }
  async #extensions(args: readonly string[]) {
    const [action, specifier] = args;
    const configPath = join(this.#cwd, '.vedh', 'extensions.json');
    if (action === 'list') {
      const configured = await this.#configuredExtensions(configPath);
      if (configured.isErr()) return configured;
      for (const extension of configured.value) this.#stdout(extension);
      return ok(undefined);
    }
    if (action !== 'add' || !specifier)
      return err(
        toCliError(CliErrorKind.InvalidArguments, {
          message: 'Usage: vedh extensions <add <package>|list>',
        }),
      );
    const configured = await this.#configuredExtensions(configPath);
    if (configured.isErr()) return configured;
    const extensions = [...new Set([...configured.value, specifier])];
    const written = await fromAsync(
      async () => {
        await mkdir(join(this.#cwd, '.vedh'), { recursive: true });
        await writeFile(
          configPath,
          JSON.stringify({ extensions }, null, 2) + '\n',
        );
      },
      (cause) => toCliError(CliErrorKind.IoFailed, { path: configPath, cause }),
    );
    if (written.isErr()) return written;
    this.#stdout(`Registered extension ${specifier}`);
    return ok(undefined);
  }
  async #configuredExtensions(configPath: string) {
    if (!existsSync(configPath)) return ok([] as string[]);
    const content = await fromAsync(
      () => readFile(configPath, 'utf8'),
      (cause) => toCliError(CliErrorKind.IoFailed, { path: configPath, cause }),
    );
    if (content.isErr()) return content;
    return safeCall(
      () => {
        const value = JSON.parse(content.value) as { extensions?: unknown };
        return Array.isArray(value.extensions)
          ? value.extensions.filter(
              (item): item is string => typeof item === 'string',
            )
          : [];
      },
      (cause) => toCliError(CliErrorKind.IoFailed, { path: configPath, cause }),
    );
  }
  async #loadExtensions(projectDir: string) {
    const configPath = join(projectDir, '.vedh', 'extensions.json');
    const configured = await this.#configuredExtensions(configPath);
    if (configured.isErr()) return configured;
    const extensions: VedhExtension[] = [
      jsTsExtension,
      pythonExtension,
      phpExtension,
    ];
    const projectRequire = createRequire(join(projectDir, 'package.json'));
    for (const specifier of configured.value) {
      const loaded = await fromAsync(
        async () => {
          let importTarget = specifier;
          try {
            importTarget = pathToFileURL(
              projectRequire.resolve(specifier),
            ).href;
          } catch {
            // Let the runtime report the original extension specifier error.
          }
          return (await import(importTarget)) as { default?: VedhExtension };
        },
        (cause) =>
          toCliError(CliErrorKind.ExtensionLoadFailed, { specifier, cause }),
      );
      if (loaded.isErr()) return loaded;
      if (!loaded.value.default)
        return err(
          toCliError(CliErrorKind.ExtensionLoadFailed, {
            specifier,
            cause: 'Extension has no default export',
          }),
        );
      extensions.push(loaded.value.default);
    }
    return ok(extensions);
  }
  #sourceInlineMaxLines(config: {
    sourceInlineMaxLines?: number;
  }): number | undefined {
    const configured = process.env.VEDH_SOURCE_INLINE_MAX_LINES;
    const value =
      configured === undefined
        ? config.sourceInlineMaxLines
        : Number(configured);
    return typeof value === 'number' && Number.isFinite(value) && value >= 0
      ? Math.floor(value)
      : undefined;
  }
  #eventCalls(extensions: readonly VedhExtension[]) {
    return extensions.reduce(
      (merged, extension) => ({
        fires: { ...merged.fires, ...extension.eventCalls?.fires },
        listens: { ...merged.listens, ...extension.eventCalls?.listens },
      }),
      { fires: {}, listens: {} },
    );
  }
  #open(projectDir: string) {
    const result = CoreDatabase.open({
      repoHash: this.#hash(projectDir),
      projectDir,
      dataDir: this.#dataDir,
    });
    return result.isErr()
      ? err(toCliError(CliErrorKind.CoreFailed, { cause: result.error }))
      : result;
  }
  #hash(value: string): string {
    return createHash('sha256').update(value).digest('hex').slice(0, 16);
  }
  #printError(error: CliError): void {
    const message =
      error.kind === CliErrorKind.InvalidArguments
        ? error.message
        : error.kind === CliErrorKind.ProjectNotFound
          ? `Project directory does not exist: ${error.projectDir}`
          : error.kind === CliErrorKind.IoFailed
            ? `Unable to access ${error.path}`
            : error.kind === CliErrorKind.ExtensionLoadFailed
              ? `Unable to load extension: ${error.specifier}`
              : 'Vedh could not complete the command.';
    const cause =
      error.kind === CliErrorKind.CoreFailed ||
      error.kind === CliErrorKind.ExtensionLoadFailed
        ? `\n${this.#describeCause(error.cause)}`
        : '';
    console.error(`Error: ${message}${cause}`);
    process.exitCode = 1;
  }
  #describeCause(cause: unknown): string {
    if (cause instanceof Error) return cause.message;
    if (!cause || typeof cause !== 'object') return String(cause);
    if ('filePath' in cause && typeof cause.filePath === 'string') {
      const nested =
        'cause' in cause ? `\n${this.#describeCause(cause.cause)}` : '';
      return `Failed while processing ${cause.filePath}.${nested}`;
    }
    if ('databasePath' in cause && typeof cause.databasePath === 'string') {
      const nested =
        'cause' in cause ? `\n${this.#describeCause(cause.cause)}` : '';
      return `Database failure at ${cause.databasePath}.${nested}`;
    }
    if ('sql' in cause && typeof cause.sql === 'string') {
      const nested =
        'cause' in cause ? `\n${this.#describeCause(cause.cause)}` : '';
      return `Database query failed: ${cause.sql}.${nested}`;
    }
    return 'An internal Vedh operation failed.';
  }
}
export { CliErrorKind, toCliErr, toCliError } from './error.js';
export type { CliError } from './error.js';
export type { CliOptions, VedhCliContract } from './type.js';
