import type Parser from 'tree-sitter';
import type { Result } from '@usersatoshi/results';
import type { Declaration } from '../type.js';
import type { ExtractionContext } from '../language/type.js';
import type { LanguageAdapter } from '../language/type.js';
import type { DeclarationError } from './error.js';

export interface DeclarationExtractorContract {
  extract(
    root: Parser.SyntaxNode,
    context: ExtractionContext,
    adapter: LanguageAdapter,
  ): Result<Declaration[], DeclarationError>;
}
