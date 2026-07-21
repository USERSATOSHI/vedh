import type { SourceRange } from '../../type.js';
import type { RelationExtractionContext } from '../type.js';
import type { Node } from './type.js';

/** Shared by BaseLanguageAdapter and language-specific adapter classes. */
export function range(node: Node): SourceRange {
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

/** Shared because JS/TS import handling and PHP include handling both need it. */
export function stripQuotes(text: string): string {
  return text.replace(/^["'`]|["'`]$/g, '');
}

/** Shared relation location mapping used by every adapter. */
export function relationFile(node: Node, context: RelationExtractionContext) {
  return { filePath: context.filePath, range: range(node) };
}
