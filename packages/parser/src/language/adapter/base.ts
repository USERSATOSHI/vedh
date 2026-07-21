import type { Relation } from '../../type.js';
import type {
  LanguageAdapter,
  LanguageDefinition,
  RelationExtractionContext,
} from '../type.js';
import { relationFile, stripQuotes } from './helper.js';
import type { Node, NodeHandler } from './type.js';

export abstract class BaseLanguageAdapter implements LanguageAdapter {
  static readonly declarationKinds: ReadonlySet<string> = new Set();

  abstract readonly definition: LanguageDefinition;

  isDeclaration(node: Node): boolean {
    const constructor = this.constructor as typeof BaseLanguageAdapter;
    return constructor.declarationKinds.has(node.type);
  }

  extractRelations(root: Node, context: RelationExtractionContext): Relation[] {
    const relations: Relation[] = [];
    this.#walk(root, relations, context);
    return relations;
  }

  protected abstract get handlers(): Readonly<Record<string, NodeHandler>>;

  #walk(
    node: Node,
    relations: Relation[],
    context: RelationExtractionContext,
  ): void {
    this.handlers[node.type]?.(node, relations, context);
    for (let index = 0; index < node.childCount; index += 1) {
      const child = node.child(index);
      if (child) this.#walk(child, relations, context);
    }
  }

  protected importDeclaration(
    node: Node,
    relations: Relation[],
    context: RelationExtractionContext,
  ): void {
    const source = node.childForFieldName('source');
    if (!source) return;
    const module = stripQuotes(source.text);
    const specifiers = new Set<string>();
    for (let index = 0; index < node.namedChildCount; index += 1) {
      const clause = node.namedChild(index);
      if (clause?.type !== 'import_clause') continue;
      this.#collectImportSpecifiers(clause, specifiers);
    }
    if (!specifiers.size)
      relations.push({
        kind: 'import',
        module,
        ...relationFile(node, context),
      });
    else
      for (const specifier of specifiers)
        relations.push({
          kind: 'import',
          module,
          specifier,
          ...relationFile(node, context),
        });
  }

  protected callExpression(
    node: Node,
    relations: Relation[],
    context: RelationExtractionContext,
  ): void {
    const functionNode = node.childForFieldName('function');
    if (!functionNode || functionNode.type === 'super') return;
    if (functionNode.text === 'require' || functionNode.text === 'import') {
      const argument = node.childForFieldName('arguments')?.namedChild(0);
      if (argument)
        relations.push({
          kind: 'import',
          module: stripQuotes(argument.text),
          ...relationFile(node, context),
        });
      return;
    }
    if (functionNode.type === 'identifier') {
      relations.push({
        kind: 'reference',
        target: functionNode.text,
        role: 'call',
        ...relationFile(functionNode, context),
      });
      return;
    }
    if (
      functionNode.type === 'member_expression' ||
      functionNode.type === 'attribute'
    ) {
      const property =
        functionNode.childForFieldName('property') ??
        functionNode.childForFieldName('attribute');
      const object = functionNode.childForFieldName('object');
      if (property?.text && object)
        relations.push({
          kind: 'reference',
          target: property.text,
          role: 'call',
          receiver: object.text,
          ...relationFile(functionNode, context),
        });
    }
  }

  protected constructorCall(
    node: Node,
    relations: Relation[],
    context: RelationExtractionContext,
  ): void {
    const constructor = node.childForFieldName('constructor');
    if (!constructor) return;
    const name =
      constructor.type === 'member_expression'
        ? constructor.childForFieldName('property')?.text
        : constructor.text;
    if (name)
      relations.push({
        kind: 'reference',
        target: name,
        role: 'constructor',
        ...relationFile(constructor, context),
      });
  }

  protected exportDeclaration(
    node: Node,
    relations: Relation[],
    context: RelationExtractionContext,
  ): void {
    const source = node.childForFieldName('source');
    if (source) {
      relations.push({
        kind: 'export',
        target: stripQuotes(source.text),
        ...relationFile(node, context),
      });
      return;
    }
    const value =
      node.childForFieldName('value') ?? node.childForFieldName('declaration');
    if (value)
      relations.push({
        kind: 'export',
        target: value.childForFieldName('name')?.text ?? value.text,
        ...relationFile(node, context),
      });
  }

  protected classDeclaration(
    node: Node,
    relations: Relation[],
    context: RelationExtractionContext,
  ): void {
    const visit = (clause: Node): void => {
      const role = clause.type.includes('extends')
        ? 'extends'
        : clause.type.includes('implements')
          ? 'implements'
          : null;
      if (role) {
        for (let index = 0; index < clause.namedChildCount; index += 1) {
          const type = clause.namedChild(index);
          if (!type) continue;
          const target = this.#typeName(type.text);
          if (target)
            relations.push({
              kind: 'reference',
              target,
              role,
              ...relationFile(type, context),
            });
        }
        return;
      }
      if (clause.type === 'class_heritage' || clause.type === 'heritage_clause')
        for (let index = 0; index < clause.namedChildCount; index += 1) {
          const child = clause.namedChild(index);
          if (child) visit(child);
        }
    };
    for (let index = 0; index < node.namedChildCount; index += 1) {
      const child = node.namedChild(index);
      if (child) visit(child);
    }
  }

  protected functionDeclaration(
    node: Node,
    relations: Relation[],
    context: RelationExtractionContext,
  ): void {
    const returnType = node.childForFieldName('return_type');
    const target = returnType ? this.#typeName(returnType.text) : null;
    if (returnType && target)
      relations.push({
        kind: 'reference',
        target,
        role: 'return-type',
        ...relationFile(returnType, context),
      });
  }

  #collectImportSpecifiers(node: Node, specifiers: Set<string>): void {
    if (node.type === 'import_specifier') {
      const name = node.childForFieldName('name')?.text;
      if (name) specifiers.add(name);
      return;
    }
    if (node.type === 'identifier') {
      specifiers.add(node.text);
      return;
    }
    for (let index = 0; index < node.namedChildCount; index += 1) {
      const child = node.namedChild(index);
      if (child) this.#collectImportSpecifiers(child, specifiers);
    }
  }

  #typeName(text: string): string | null {
    const normalized = text
      .trim()
      .replace(/^:\s*/, '')
      .replace(/^(?:extends|implements)\s+/, '')
      .replace(/^readonly\s+/, '');
    const primary = normalized.match(
      /[A-Za-z_$][\w$]*(?:[.\\][A-Za-z_$][\w$]*)*/,
    )?.[0];
    return primary?.split(/[.\\]/).pop() ?? null;
  }
}
