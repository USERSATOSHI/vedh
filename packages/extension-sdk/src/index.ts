import type { VedhExtension } from '@vedh/extension-api';
import type {
  EventCallConfig,
  EventRelation,
  ExportRelation,
  ImportRelation,
  LanguageAdapter,
  LanguageDefinition,
  Node,
  ReferenceRelation,
  Relation,
  RelationExtractionContext,
  SourceRange,
} from '@vedh/parser';

export { BaseLanguageAdapter } from '@vedh/parser';
export type {
  EventCallConfig,
  EventFireRule,
  EventListenRule,
  LanguageAdapter,
  LanguageDefinition,
  Node,
  Relation,
  RelationExtractionContext,
  SourceRange,
} from '@vedh/parser';
export type { VedhExtension } from '@vedh/extension-api';

export interface ExtensionDefinition extends VedhExtension {
  id: `${string}.${string}`;
}

export type RelationHandler = (
  node: Node,
  context: RelationExtractionContext,
) => Relation | readonly Relation[] | undefined;

export interface LanguageAdapterDefinition extends LanguageDefinition {
  /** AST node kinds that create declarations. */
  declarations?: Iterable<string>;
  /** Relation extractors keyed by Tree-sitter node type. */
  relations?: Readonly<Record<string, RelationHandler>>;
}

export interface LanguageExtensionDefinition {
  id: `${string}.${string}`;
  name: string;
  version: string;
  /** Preferred SDK-first form. */
  languages?: readonly LanguageAdapter[];
  /** Existing custom adapters remain supported. */
  adapters?: readonly LanguageAdapter[];
  eventCalls?: EventCallConfig;
}

export interface EventExtensionDefinition {
  id: `${string}.${string}`;
  name: string;
  version: string;
  eventCalls: EventCallConfig;
}

/** Define and validate the extension manifest exported by an npm package. */
export function defineExtension(extension: ExtensionDefinition): VedhExtension {
  assertManifest(extension);
  return extension;
}

/**
 * Build a language adapter from declarations and small relation handlers.
 * Most extensions should use this instead of subclassing BaseLanguageAdapter.
 */
export function language(
  definition: LanguageAdapterDefinition,
): LanguageAdapter {
  const declarations = new Set(definition.declarations ?? []);
  const handlers = definition.relations ?? {};
  return {
    definition: {
      id: definition.id,
      extensions: definition.extensions,
      grammar: definition.grammar,
    },
    isDeclaration: (node) => declarations.has(node.type),
    extractRelations: (root, context) => {
      const relations: Relation[] = [];
      walk(root, (node) => {
        const extracted = handlers[node.type]?.(node, context);
        if (!extracted) return;
        if (Array.isArray(extracted))
          relations.push(...(extracted as readonly Relation[]));
        else relations.push(extracted as Relation);
      });
      return relations;
    },
  };
}

export function defineLanguageExtension(
  definition: LanguageExtensionDefinition,
): VedhExtension {
  const languageAdapters = [
    ...(definition.adapters ?? []),
    ...(definition.languages ?? []),
  ];
  if (!languageAdapters.length)
    throw new Error(
      'A language extension must provide at least one language or adapter.',
    );
  return defineExtension({
    id: definition.id,
    name: definition.name,
    version: definition.version,
    languageAdapters,
    eventCalls: definition.eventCalls,
  });
}

export function defineEventExtension(
  definition: EventExtensionDefinition,
): VedhExtension {
  return defineExtension(definition);
}

/** Visit a node and all descendants in source order. */
export function walk(node: Node, visit: (node: Node) => void): void {
  visit(node);
  for (let index = 0; index < node.childCount; index += 1) {
    const child = node.child(index);
    if (child) walk(child, visit);
  }
}

export function field(node: Node, name: string): Node | undefined {
  return node.childForFieldName(name) ?? undefined;
}

export function namedChildren(node: Node): Node[] {
  const children: Node[] = [];
  for (let index = 0; index < node.namedChildCount; index += 1) {
    const child = node.namedChild(index);
    if (child) children.push(child);
  }
  return children;
}

export function sourceRange(node: Node): SourceRange {
  return {
    start: {
      line: node.startPosition.row + 1,
      column: node.startPosition.column,
      offset: node.startIndex,
    },
    end: {
      line: node.endPosition.row + 1,
      column: node.endPosition.column,
      offset: node.endIndex,
    },
  };
}

export function unquote(value: string): string {
  return value.replace(/^['"`]|['"`]$/g, '');
}

export function importRelation(
  context: RelationExtractionContext,
  node: Node,
  relation: Omit<ImportRelation, 'kind' | 'filePath' | 'range'>,
): ImportRelation {
  return { kind: 'import', ...relation, ...located(context, node) };
}

export function exportRelation(
  context: RelationExtractionContext,
  node: Node,
  relation: Omit<ExportRelation, 'kind' | 'filePath' | 'range'>,
): ExportRelation {
  return { kind: 'export', ...relation, ...located(context, node) };
}

export function referenceRelation(
  context: RelationExtractionContext,
  node: Node,
  relation: Omit<ReferenceRelation, 'kind' | 'filePath' | 'range'>,
): ReferenceRelation {
  return { kind: 'reference', ...relation, ...located(context, node) };
}

export function eventRelation(
  context: RelationExtractionContext,
  node: Node,
  relation: Omit<EventRelation, 'kind' | 'filePath' | 'range'>,
): EventRelation {
  return { kind: 'event', ...relation, ...located(context, node) };
}

function located(context: RelationExtractionContext, node: Node) {
  return { filePath: context.filePath, range: sourceRange(node) };
}

function assertManifest(extension: ExtensionDefinition): void {
  if (!/^[a-z0-9]+(?:[._-][a-z0-9]+)+$/i.test(extension.id))
    throw new Error(
      `Extension id must be namespaced (for example, acme.go): ${extension.id}`,
    );
  if (!extension.name.trim()) throw new Error('Extension name is required.');
  if (!extension.version.trim())
    throw new Error('Extension version is required.');
}
