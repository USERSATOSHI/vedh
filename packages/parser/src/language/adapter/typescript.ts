import JavaScript from 'tree-sitter-javascript';
import TypeScript from 'tree-sitter-typescript';
import type Parser from 'tree-sitter';
import type { LanguageDefinition } from '../type.js';
import { BaseLanguageAdapter } from './base.js';
import type { NodeHandler } from './type.js';

export class TypeScriptLanguageAdapter extends BaseLanguageAdapter {
  static override readonly declarationKinds: ReadonlySet<string> = new Set([
    'class_declaration',
    'function_declaration',
    'method_definition',
    'interface_declaration',
    'enum_declaration',
    'type_alias_declaration',
    'variable_declarator',
  ]);

  readonly definition: LanguageDefinition;

  constructor(id: 'typescript' | 'tsx' | 'javascript' | 'jsx') {
    super();
    const grammar =
      id === 'typescript'
        ? TypeScript.typescript
        : id === 'tsx'
          ? TypeScript.tsx
          : JavaScript;
    this.definition = {
      id,
      extensions:
        id === 'typescript'
          ? ['.ts']
          : id === 'tsx'
            ? ['.tsx']
            : id === 'javascript'
              ? ['.js', '.mjs', '.cjs']
              : ['.jsx'],
      grammar: grammar as unknown as Parser.Language,
    };
  }

  protected get handlers(): Readonly<Record<string, NodeHandler>> {
    return {
      import_statement: this.importDeclaration.bind(this),
      import_declaration: this.importDeclaration.bind(this),
      call_expression: this.callExpression.bind(this),
      new_expression: this.constructorCall.bind(this),
      export_statement: this.exportDeclaration.bind(this),
      export_declaration: this.exportDeclaration.bind(this),
      class_declaration: this.classDeclaration.bind(this),
      interface_declaration: this.classDeclaration.bind(this),
      function_declaration: this.functionDeclaration.bind(this),
      function_signature: this.functionDeclaration.bind(this),
      method_definition: this.functionDeclaration.bind(this),
      method_signature: this.functionDeclaration.bind(this),
    };
  }
}
