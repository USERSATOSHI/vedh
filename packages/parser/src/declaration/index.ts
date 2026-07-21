import * as path from 'node:path';
import { safeCall } from '@usersatoshi/results';
import type Parser from 'tree-sitter';
import type { Declaration } from '../type.js';
import type { ExtractionContext } from '../language/type.js';
import type { LanguageAdapter } from '../language/type.js';
import { DeclarationErrorKind, toDeclarationError } from './error.js';
import type { DeclarationExtractorContract } from './type.js';

const ALWAYS_KEEP = new Set(['export_statement', 'export_declaration']);

const OVERLOADABLE = new Set([
  'function_declaration',
  'function_signature',
  'method_declaration',
  'constructor_declaration',
  'function_definition',
]);

const EXPORT_KINDS = new Set(['export_statement', 'export_declaration']);

export class DeclarationExtractor implements DeclarationExtractorContract {
  extract(
    root: Parser.SyntaxNode,
    context: ExtractionContext,
    adapter: LanguageAdapter,
  ) {
    return safeCall(
      () => {
        const declarations = this.#visit(root, context, adapter, 0, null);
        const deduplicated = this.#deduplicateOverloads(declarations);
        return this.#finalize(deduplicated, root, context);
      },
      (cause) =>
        toDeclarationError(DeclarationErrorKind.ExtractionFailed, {
          filePath: context.filePath,
          cause,
        }),
    );
  }

  #visit(
    node: Parser.SyntaxNode,
    context: ExtractionContext,
    adapter: LanguageAdapter,
    depth: number,
    parentId: string | null,
  ): Declaration[] {
    const declarations: Declaration[] = [];
    let current: Declaration | null = null;

    if (depth > 0 && node.isNamed) {
      const extracted = this.#extractName(node);
      if (adapter.isDeclaration(node) || ALWAYS_KEEP.has(node.type)) {
        current = this.#createDeclaration(
          node,
          context,
          depth,
          parentId,
          extracted.name,
        );
        declarations.push(current);
      }
    }

    for (let index = 0; index < node.namedChildCount; index += 1) {
      const child = node.namedChild(index);
      if (child) {
        declarations.push(
          ...this.#visit(
            child,
            context,
            adapter,
            depth + 1,
            current?.id ?? parentId,
          ),
        );
      }
    }
    return declarations;
  }

  #extractName(node: Parser.SyntaxNode): {
    name: string;
    isDeclaration: boolean;
  } {
    const name = node.childForFieldName('name');
    return name
      ? { name: name.text || name.type, isDeclaration: true }
      : { name: node.type, isDeclaration: false };
  }

  #relativeFilePath(context: ExtractionContext): string {
    return context.projectRoot
      ? path.relative(context.projectRoot, context.filePath)
      : path.basename(context.filePath);
  }

  #createDeclaration(
    node: Parser.SyntaxNode,
    context: ExtractionContext,
    depth: number,
    parentId: string | null,
    name: string,
  ): Declaration {
    const relativePath = this.#relativeFilePath(context);
    return {
      id: `${relativePath}:${node.startPosition.row + 1}:${node.startPosition.column}`,
      name,
      kind: node.type,
      filePath: context.filePath,
      range: {
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
      },
      parentId,
      depth,
      metadata: node.namedChildCount
        ? { namedChildren: node.namedChildCount }
        : {},
    };
  }

  #deduplicateOverloads(declarations: Declaration[]): Declaration[] {
    const lastIndex = new Map<string, number>();
    for (let index = 0; index < declarations.length; index += 1) {
      const declaration = declarations[index]!;
      if (OVERLOADABLE.has(declaration.kind)) {
        lastIndex.set(`${declaration.filePath}\0${declaration.name}`, index);
      }
    }
    return declarations.filter((declaration, index) => {
      if (!OVERLOADABLE.has(declaration.kind)) return true;
      return (
        lastIndex.get(`${declaration.filePath}\0${declaration.name}`) === index
      );
    });
  }

  #finalize(
    declarations: Declaration[],
    root: Parser.SyntaxNode,
    context: ExtractionContext,
  ): Declaration[] {
    const exports = declarations.filter((item) => EXPORT_KINDS.has(item.kind));
    const exportIds = new Set(exports.map((item) => item.id));
    const result = declarations
      .filter((item) => !EXPORT_KINDS.has(item.kind))
      .map((item) =>
        item.parentId && exportIds.has(item.parentId)
          ? { ...item, parentId: null }
          : item,
      );
    const relativePath = this.#relativeFilePath(context);

    if (exports.length > 0) {
      const first = exports[0]!;
      const last = exports[exports.length - 1]!;
      result.push({
        id: `${relativePath}:exports`,
        name: `${relativePath}-exports`,
        kind: 'export_statement',
        filePath: context.filePath,
        range: { start: first.range.start, end: last.range.end },
        parentId: null,
        depth: 0,
        metadata: { namedChildren: exports.length },
      });
    }

    result.push({
      id: `${relativePath}:module`,
      name: relativePath,
      kind: 'module',
      filePath: context.filePath,
      range: {
        start: { line: 1, column: 0, offset: 0 },
        end: {
          line: root.endPosition.row + 1,
          column: root.endPosition.column,
          offset: root.endIndex,
        },
      },
      parentId: null,
      depth: 0,
      metadata: {},
    });

    return result;
  }
}

export type { DeclarationExtractorContract } from './type.js';
export {
  DeclarationErrorKind,
  toDeclarationErr,
  toDeclarationError,
  type DeclarationError,
} from './error.js';
