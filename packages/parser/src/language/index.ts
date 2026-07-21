import type { LanguageId } from '../type.js';
import { PhpLanguageAdapter } from './adapter/php.js';
import { PythonLanguageAdapter } from './adapter/python.js';
import { TypeScriptLanguageAdapter } from './adapter/typescript.js';
import type { LanguageAdapter, LanguageRegistryContract } from './type.js';

export { TypeScriptLanguageAdapter } from './adapter/typescript.js';

export { PythonLanguageAdapter } from './adapter/python.js';
export { PhpLanguageAdapter } from './adapter/php.js';
export { BaseLanguageAdapter } from './adapter/base.js';
export type { Node, NodeHandler } from './adapter/type.js';

export type {
  ExtractionContext,
  LanguageAdapter,
  LanguageDefinition,
  LanguageRegistryContract,
  RelationExtractionContext,
} from './type.js';

export {
  LanguageErrorKind,
  toLanguageErr,
  toLanguageError,
  type LanguageError,
} from './error.js';

export class LanguageRegistry implements LanguageRegistryContract {
  readonly #adapters = new Map<LanguageId, LanguageAdapter>();
  readonly #extensions = new Map<string, LanguageId>();

  constructor(
    adapters: readonly LanguageAdapter[] = LanguageRegistry.builtins(),
  ) {
    for (const adapter of adapters) this.#register(adapter);
  }

  static builtins(): LanguageAdapter[] {
    return [
      new TypeScriptLanguageAdapter('typescript'),
      new TypeScriptLanguageAdapter('tsx'),
      new TypeScriptLanguageAdapter('javascript'),
      new TypeScriptLanguageAdapter('jsx'),
      new PythonLanguageAdapter(),
      new PhpLanguageAdapter(),
    ];
  }

  detect(filePath: string): LanguageId | null {
    const extension = filePath.slice(filePath.lastIndexOf('.')).toLowerCase();
    return this.#extensions.get(extension) ?? null;
  }

  get(language: LanguageId): LanguageAdapter | undefined {
    return this.#adapters.get(language);
  }

  supports(language: string): language is LanguageId {
    return this.#adapters.has(language as LanguageId);
  }

  extensions(): readonly string[] {
    return [...this.#extensions.keys()].sort();
  }

  languages(): readonly LanguageId[] {
    return [...this.#adapters.keys()];
  }

  #register(adapter: LanguageAdapter): void {
    this.#adapters.set(adapter.definition.id, adapter);
    for (const extension of adapter.definition.extensions)
      this.#extensions.set(extension, adapter.definition.id);
  }
}
