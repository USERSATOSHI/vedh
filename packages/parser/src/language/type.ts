import type Parser from 'tree-sitter';
import type { EventCallDetectorContract } from '../event/type.js';
import type { LanguageId, Relation } from '../type.js';

export interface ExtractionContext {
  filePath: string;
  projectRoot?: string;
  language: LanguageId;
}

export interface RelationExtractionContext extends ExtractionContext {
  eventDetector: EventCallDetectorContract;
}

export interface LanguageDefinition {
  id: LanguageId;
  extensions: readonly string[];
  grammar: Parser.Language;
}

export interface LanguageAdapter {
  readonly definition: LanguageDefinition;
  /** True only for AST nodes that create semantic declarations. */
  isDeclaration(node: Parser.SyntaxNode): boolean;
  extractRelations(
    root: Parser.SyntaxNode,
    context: RelationExtractionContext,
  ): Relation[];
}

export interface LanguageRegistryContract {
  detect(filePath: string): LanguageId | null;
  get(language: LanguageId): LanguageAdapter | undefined;
  supports(language: string): language is LanguageId;
  extensions(): readonly string[];
  languages(): readonly LanguageId[];
}
