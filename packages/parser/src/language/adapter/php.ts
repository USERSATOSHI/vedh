import Php from 'tree-sitter-php';
import type Parser from 'tree-sitter';
import type { Relation } from '../../type.js';
import type { RelationExtractionContext, LanguageDefinition } from '../type.js';
import { BaseLanguageAdapter } from './base.js';
import { range, relationFile, stripQuotes } from './helper.js';
import type { NormalizedCallArgument } from '../../event/type.js';
import type { Node, NodeHandler } from './type.js';

export class PhpLanguageAdapter extends BaseLanguageAdapter {
  static override readonly declarationKinds: ReadonlySet<string> = new Set([
    'class_declaration',
    'interface_declaration',
    'trait_declaration',
    'function_definition',
    'method_declaration',
  ]);

  readonly definition: LanguageDefinition = {
    id: 'php',
    extensions: ['.php', '.php5', '.php7'],
    grammar: Php.php_only as unknown as Parser.Language,
  };

  protected get handlers(): Readonly<Record<string, NodeHandler>> {
    return {
      namespace_use_declaration: this.#namespaceUse.bind(this),
      function_call_expression: this.#functionCall.bind(this),
      member_call_expression: this.#memberCall.bind(this),
      scoped_call_expression: this.#memberCall.bind(this),
      nullsafe_member_call_expression: this.#memberCall.bind(this),
      object_creation_expression: this.#objectCreation.bind(this),
      require_expression: this.#include.bind(this),
      require_once_expression: this.#include.bind(this),
      include_expression: this.#include.bind(this),
      include_once_expression: this.#include.bind(this),
    };
  }

  #namespaceUse(
    node: Node,
    relations: Relation[],
    context: RelationExtractionContext,
  ): void {
    for (let index = 0; index < node.namedChildCount; index += 1) {
      const clause = node.namedChild(index);
      if (!clause) continue;
      const target = clause.text.replace(/\s+as\s+\w+$/i, '');
      relations.push({
        kind: 'import',
        module: target,
        specifier: target.split('\\').pop(),
        ...relationFile(node, context),
      });
    }
  }

  #functionCall(
    node: Node,
    relations: Relation[],
    context: RelationExtractionContext,
  ): void {
    const functionNode =
      node.childForFieldName('function') ?? node.namedChild(0);
    const functionName = functionNode?.text
      .split('\\')
      .pop()
      ?.split('::')
      .pop();
    if (!functionName || functionName.startsWith('$')) return;
    if (context.eventDetector.matches(functionName)) {
      const event = context.eventDetector.detect({
        functionName,
        arguments: this.#arguments(node),
        filePath: context.filePath,
        range: range(node),
      });
      if (event) relations.push(event);
      return;
    }
    relations.push({
      kind: 'reference',
      target: functionName,
      role: 'call',
      ...relationFile(functionNode!, context),
    });
  }

  #memberCall(
    node: Node,
    relations: Relation[],
    context: RelationExtractionContext,
  ): void {
    const name = node.childForFieldName('name');
    const receiver =
      node.childForFieldName('object') ?? node.childForFieldName('scope');
    if (name?.text && receiver)
      relations.push({
        kind: 'reference',
        target: name.text,
        receiver: receiver.text,
        role: 'call',
        ...relationFile(name, context),
      });
  }

  #objectCreation(
    node: Node,
    relations: Relation[],
    context: RelationExtractionContext,
  ): void {
    const name = node.namedChild(0);
    if (name?.text)
      relations.push({
        kind: 'reference',
        target: name.text.split('\\').pop()!,
        role: 'constructor',
        ...relationFile(name, context),
      });
  }

  #include(
    node: Node,
    relations: Relation[],
    context: RelationExtractionContext,
  ): void {
    const argument = node.namedChild(0);
    if (argument?.type === 'string')
      relations.push({
        kind: 'import',
        module: stripQuotes(argument.text),
        ...relationFile(node, context),
      });
  }

  #arguments(node: Node): NormalizedCallArgument[] {
    const args = node.childForFieldName('arguments');
    if (!args) return [];
    return Array.from({ length: args.namedChildCount }, (_, index) =>
      this.#argument(args.namedChild(index)),
    );
  }

  #argument(node: Node | null): NormalizedCallArgument {
    const value =
      node?.type === 'argument'
        ? node.namedChild(node.namedChildCount - 1)
        : node;
    if (!value)
      return {
        text: '',
        stringLiteral: false,
        integerLiteral: false,
        closure: false,
      };
    if (value.type === 'string')
      return {
        text: stripQuotes(value.text),
        stringLiteral: true,
        integerLiteral: false,
        closure: false,
      };
    if (value.type === 'integer')
      return {
        text: value.text,
        stringLiteral: false,
        integerLiteral: true,
        closure: false,
      };
    if (value.type === 'anonymous_function' || value.type === 'arrow_function')
      return {
        text: '',
        stringLiteral: false,
        integerLiteral: false,
        closure: true,
      };
    return {
      text: value.text,
      stringLiteral: false,
      integerLiteral: false,
      closure: false,
    };
  }
}
