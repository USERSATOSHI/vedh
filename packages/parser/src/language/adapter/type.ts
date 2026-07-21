import type Parser from 'tree-sitter';
import type { Relation } from '../../type.js';
import type { RelationExtractionContext } from '../type.js';

export type Node = Parser.SyntaxNode;

export type NodeHandler = (
  node: Node,
  relations: Relation[],
  context: RelationExtractionContext,
) => void;
