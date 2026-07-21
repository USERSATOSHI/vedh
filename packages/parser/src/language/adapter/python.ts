import Python from 'tree-sitter-python';
import type Parser from 'tree-sitter';
import type { LanguageDefinition, RelationExtractionContext } from '../type.js';
import type { Relation } from '../../type.js';
import { BaseLanguageAdapter } from './base.js';
import { relationFile } from './helper.js';
import type { Node, NodeHandler } from './type.js';

export class PythonLanguageAdapter extends BaseLanguageAdapter {
  static override readonly declarationKinds: ReadonlySet<string> = new Set([
    'class_definition',
    'function_definition',
  ]);

  readonly definition: LanguageDefinition = {
    id: 'python',
    extensions: ['.py'],
    grammar: Python as unknown as Parser.Language,
  };

  protected get handlers(): Readonly<Record<string, NodeHandler>> {
    return {
      import_statement: this.#import.bind(this),
      import_from_statement: this.#importFrom.bind(this),
      call: this.callExpression.bind(this),
      class_definition: this.#classDefinition.bind(this),
    };
  }

  #import(
    node: Node,
    relations: Relation[],
    context: RelationExtractionContext,
  ): void {
    for (let index = 0; index < node.namedChildCount; index += 1) {
      const child = node.namedChild(index);
      const dotted =
        child?.type === 'aliased_import'
          ? child.childForFieldName('name')
          : child;
      if (dotted?.text)
        relations.push({
          kind: 'import',
          module: dotted.text,
          specifier: dotted.text.split('.').pop(),
          ...relationFile(node, context),
        });
    }
  }

  #importFrom(
    node: Node,
    relations: Relation[],
    context: RelationExtractionContext,
  ): void {
    const module = node.childForFieldName('module_name')?.text;
    if (!module) return;
    let emitted = false;
    for (let index = 0; index < node.namedChildCount; index += 1) {
      const child = node.namedChild(index);
      if (
        !child ||
        child === node.childForFieldName('module_name') ||
        child.type === 'wildcard_import'
      )
        continue;
      const imported =
        child.type === 'aliased_import'
          ? child.childForFieldName('name')?.text
          : child.text;
      if (imported) {
        relations.push({
          kind: 'import',
          module,
          specifier: imported.split('.').pop(),
          ...relationFile(node, context),
        });
        emitted = true;
      }
    }
    if (!emitted)
      relations.push({
        kind: 'import',
        module,
        ...relationFile(node, context),
      });
  }

  #classDefinition(
    node: Node,
    relations: Relation[],
    context: RelationExtractionContext,
  ): void {
    const superclasses = node.childForFieldName('superclasses');
    if (!superclasses) return;
    for (let index = 0; index < superclasses.namedChildCount; index += 1) {
      const base = superclasses.namedChild(index);
      if (!base || base.type === 'keyword_argument') continue;
      const name =
        base.type === 'attribute'
          ? base.childForFieldName('attribute')?.text
          : base.text;
      if (name)
        relations.push({
          kind: 'reference',
          target: name,
          role: 'extends',
          ...relationFile(base, context),
        });
    }
  }
}
