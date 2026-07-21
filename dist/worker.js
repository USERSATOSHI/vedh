// packages/parser/src/parallel/worker.ts
import { parentPort, workerData } from "node:worker_threads";

// packages/parser/src/engine/index.ts
import { readFile } from "node:fs/promises";

// node_modules/.bun/@usersatoshi+results@1.0.0+7524df1edfed9f02/node_modules/@usersatoshi/results/dist/esm/results/index.js
class ResultError extends Error {
  constructor(message) {
    super(message);
    this.name = "ResultError";
  }
}

class BaseResult {
  static all(results) {
    if (results.length > 0 && results[0] instanceof Promise) {
      return Promise.all(results).then((resolved) => BaseResult.all(resolved));
    }
    const values = [];
    for (const result of results) {
      if (result.isErr())
        return new Err(result.error);
      values.push(result.value);
    }
    return new Ok(values);
  }
  static any(results) {
    if (results.length > 0 && results[0] instanceof Promise) {
      return Promise.all(results).then((resolved) => BaseResult.any(resolved));
    }
    let lastErr;
    for (const result of results) {
      if (result.isOk())
        return result;
      lastErr = result.error;
    }
    return new Err(lastErr);
  }
  andThen(fn) {
    if (this.success && this.value !== undefined) {
      return fn(this.value);
    }
    return new Err(this.error);
  }
  orElse(fn) {
    if (!this.success && this.error !== undefined) {
      return fn(this.error);
    }
    return new Ok(this.value);
  }
  map(fn) {
    if (this.success && this.value !== undefined) {
      const result = fn(this.value);
      if (result instanceof Promise) {
        return result.then((v) => new Ok(v));
      }
      return new Ok(result);
    }
    return new Err(this.error);
  }
  mapErr(fn) {
    if (!this.success && this.error !== undefined) {
      const result = fn(this.error);
      if (result instanceof Promise) {
        return result.then((e) => new Err(e));
      }
      return new Err(result);
    }
    return new Ok(this.value);
  }
  match(onOk, onErr) {
    if (this.success && this.value !== undefined) {
      return onOk(this.value);
    }
    return onErr(this.error);
  }
  unwrap() {
    if (this.success && this.value !== undefined) {
      return this.value;
    }
    throw new ResultError(`Called unwrap on an Err: ${JSON.stringify(this.error)}`);
  }
  unwrapOr(defaultValue) {
    if (this.success && this.value !== undefined) {
      return this.value;
    }
    return defaultValue;
  }
  isOk() {
    return this.success;
  }
  isErr() {
    return !this.success;
  }
}

class Ok extends BaseResult {
  constructor(value) {
    super();
    this.value = value;
    this.success = true;
  }
}

class Err extends BaseResult {
  constructor(error) {
    super();
    this.error = error;
    this.success = false;
  }
}

// node_modules/.bun/@usersatoshi+results@1.0.0+7524df1edfed9f02/node_modules/@usersatoshi/results/dist/esm/index.js
function ok(value) {
  return new Ok(value);
}
function err(error) {
  return new Err(error);
}
async function fromPromise(promise, onErr) {
  try {
    return ok(await promise);
  } catch (error) {
    return err(onErr(error));
  }
}
async function fromAsync(fn, onErr) {
  return fromPromise(fn(), onErr);
}
function safeCall(fn, onErr) {
  if (fn instanceof Promise) {
    return fromPromise(fn, onErr);
  }
  try {
    const result = fn();
    if (result instanceof Promise) {
      return fromPromise(result, onErr);
    }
    return ok(result);
  } catch (error) {
    return err(onErr(error));
  }
}

// packages/parser/src/engine/index.ts
import Parser from "tree-sitter";

// packages/parser/src/declaration/index.ts
import * as path from "node:path";

// packages/parser/src/declaration/error.ts
function toDeclarationError(kind, details) {
  return { kind, ...details };
}

// packages/parser/src/declaration/index.ts
var ALWAYS_KEEP = new Set(["export_statement", "export_declaration"]);
var OVERLOADABLE = new Set([
  "function_declaration",
  "function_signature",
  "method_declaration",
  "constructor_declaration",
  "function_definition"
]);
var EXPORT_KINDS = new Set(["export_statement", "export_declaration"]);

class DeclarationExtractor {
  extract(root, context, adapter) {
    return safeCall(() => {
      const declarations = this.#visit(root, context, adapter, 0, null);
      const deduplicated = this.#deduplicateOverloads(declarations);
      return this.#finalize(deduplicated, root, context);
    }, (cause) => toDeclarationError(0 /* ExtractionFailed */, {
      filePath: context.filePath,
      cause
    }));
  }
  #visit(node, context, adapter, depth, parentId) {
    const declarations = [];
    let current = null;
    if (depth > 0 && node.isNamed) {
      const extracted = this.#extractName(node);
      if (adapter.isDeclaration(node) || ALWAYS_KEEP.has(node.type)) {
        current = this.#createDeclaration(node, context, depth, parentId, extracted.name);
        declarations.push(current);
      }
    }
    for (let index = 0;index < node.namedChildCount; index += 1) {
      const child = node.namedChild(index);
      if (child) {
        declarations.push(...this.#visit(child, context, adapter, depth + 1, current?.id ?? parentId));
      }
    }
    return declarations;
  }
  #extractName(node) {
    const name = node.childForFieldName("name");
    return name ? { name: name.text || name.type, isDeclaration: true } : { name: node.type, isDeclaration: false };
  }
  #relativeFilePath(context) {
    return context.projectRoot ? path.relative(context.projectRoot, context.filePath) : path.basename(context.filePath);
  }
  #createDeclaration(node, context, depth, parentId, name) {
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
          offset: node.startIndex
        },
        end: {
          line: node.endPosition.row + 1,
          column: node.endPosition.column,
          offset: node.endIndex
        }
      },
      parentId,
      depth,
      metadata: node.namedChildCount ? { namedChildren: node.namedChildCount } : {}
    };
  }
  #deduplicateOverloads(declarations) {
    const lastIndex = new Map;
    for (let index = 0;index < declarations.length; index += 1) {
      const declaration = declarations[index];
      if (OVERLOADABLE.has(declaration.kind)) {
        lastIndex.set(`${declaration.filePath}\x00${declaration.name}`, index);
      }
    }
    return declarations.filter((declaration, index) => {
      if (!OVERLOADABLE.has(declaration.kind))
        return true;
      return lastIndex.get(`${declaration.filePath}\x00${declaration.name}`) === index;
    });
  }
  #finalize(declarations, root, context) {
    const exports = declarations.filter((item) => EXPORT_KINDS.has(item.kind));
    const exportIds = new Set(exports.map((item) => item.id));
    const result = declarations.filter((item) => !EXPORT_KINDS.has(item.kind)).map((item) => item.parentId && exportIds.has(item.parentId) ? { ...item, parentId: null } : item);
    const relativePath = this.#relativeFilePath(context);
    if (exports.length > 0) {
      const first = exports[0];
      const last = exports[exports.length - 1];
      result.push({
        id: `${relativePath}:exports`,
        name: `${relativePath}-exports`,
        kind: "export_statement",
        filePath: context.filePath,
        range: { start: first.range.start, end: last.range.end },
        parentId: null,
        depth: 0,
        metadata: { namedChildren: exports.length }
      });
    }
    result.push({
      id: `${relativePath}:module`,
      name: relativePath,
      kind: "module",
      filePath: context.filePath,
      range: {
        start: { line: 1, column: 0, offset: 0 },
        end: {
          line: root.endPosition.row + 1,
          column: root.endPosition.column,
          offset: root.endIndex
        }
      },
      parentId: null,
      depth: 0,
      metadata: {}
    });
    return result;
  }
}

// packages/parser/src/event/error.ts
function toEventCallError(kind, details) {
  return { kind, ...details };
}

// packages/parser/src/event/index.ts
class EventCallDetector {
  #config;
  constructor(config) {
    this.#config = config;
  }
  static create(config = {}) {
    for (const [name, rule] of Object.entries(config.fires ?? {})) {
      const validationError = EventCallDetector.#validateFireRule(name, rule);
      if (validationError)
        return err(validationError);
    }
    for (const [name, rule] of Object.entries(config.listens ?? {})) {
      const validationError = EventCallDetector.#validateListenRule(name, rule);
      if (validationError)
        return err(validationError);
    }
    return ok(new EventCallDetector(config));
  }
  static #validateIndex(value, label) {
    if (!Number.isInteger(value) || value < 0) {
      return toEventCallError(0 /* InvalidConfiguration */, {
        message: `${label} must be a non-negative integer`
      });
    }
    return null;
  }
  static #validateFireRule(name, rule) {
    return EventCallDetector.#validateIndex(rule.eventArgument, `fires.${name}.eventArgument`);
  }
  static #validateListenRule(name, rule) {
    const fireError = EventCallDetector.#validateFireRule(name, rule);
    if (fireError)
      return fireError;
    const callbackError = EventCallDetector.#validateIndex(rule.callbackArgument, `listens.${name}.callbackArgument`);
    if (callbackError)
      return callbackError;
    if (rule.priorityArgument !== undefined) {
      const priorityError = EventCallDetector.#validateIndex(rule.priorityArgument, `listens.${name}.priorityArgument`);
      if (priorityError)
        return priorityError;
    }
    if (rule.acceptedArgumentsArgument !== undefined) {
      const acceptedArgumentsError = EventCallDetector.#validateIndex(rule.acceptedArgumentsArgument, `listens.${name}.acceptedArgumentsArgument`);
      if (acceptedArgumentsError)
        return acceptedArgumentsError;
    }
    return null;
  }
  matches(functionName) {
    return Boolean(this.#config.fires?.[functionName] ?? this.#config.listens?.[functionName]);
  }
  detect(call) {
    const fireRule = this.#config.fires?.[call.functionName];
    if (fireRule) {
      const eventArgument2 = call.arguments[fireRule.eventArgument];
      if (!eventArgument2?.stringLiteral || !eventArgument2.text)
        return null;
      return {
        kind: "event",
        direction: "fire",
        eventName: eventArgument2.text,
        eventKind: fireRule.eventKind,
        filePath: call.filePath,
        range: call.range
      };
    }
    const listenRule = this.#config.listens?.[call.functionName];
    if (!listenRule)
      return null;
    const eventArgument = call.arguments[listenRule.eventArgument];
    if (!eventArgument?.stringLiteral || !eventArgument.text)
      return null;
    const callbackArgument = call.arguments[listenRule.callbackArgument];
    const priorityArgument = listenRule.priorityArgument === undefined ? undefined : call.arguments[listenRule.priorityArgument];
    const acceptedArgumentsArgument = listenRule.acceptedArgumentsArgument === undefined ? undefined : call.arguments[listenRule.acceptedArgumentsArgument];
    return {
      kind: "event",
      direction: "listen",
      eventName: eventArgument.text,
      eventKind: listenRule.eventKind,
      callback: callbackArgument?.memberReference ? {
        receiver: callbackArgument.memberReference.receiver,
        name: callbackArgument.memberReference.method
      } : callbackArgument?.stringLiteral ? { name: callbackArgument.text } : undefined,
      priority: priorityArgument?.integerLiteral ? Number.parseInt(priorityArgument.text, 10) : undefined,
      acceptedArguments: acceptedArgumentsArgument?.integerLiteral ? Number.parseInt(acceptedArgumentsArgument.text, 10) : undefined,
      filePath: call.filePath,
      range: call.range
    };
  }
}

// packages/parser/src/language/adapter/php.ts
import Php from "tree-sitter-php";

// packages/parser/src/language/adapter/helper.ts
function range(node) {
  return {
    start: {
      line: node.startPosition.row + 1,
      column: node.startPosition.column,
      offset: node.startIndex
    },
    end: {
      line: node.endPosition.row + 1,
      column: node.endPosition.column,
      offset: node.endIndex
    }
  };
}
function stripQuotes(text) {
  return text.replace(/^["'`]|["'`]$/g, "");
}
function relationFile(node, context) {
  return { filePath: context.filePath, range: range(node) };
}

// packages/parser/src/language/adapter/base.ts
class BaseLanguageAdapter {
  static declarationKinds = new Set;
  isDeclaration(node) {
    const constructor = this.constructor;
    return constructor.declarationKinds.has(node.type);
  }
  extractRelations(root, context) {
    const relations = [];
    this.#walk(root, relations, context);
    return relations;
  }
  #walk(node, relations, context) {
    this.handlers[node.type]?.(node, relations, context);
    for (let index = 0;index < node.childCount; index += 1) {
      const child = node.child(index);
      if (child)
        this.#walk(child, relations, context);
    }
  }
  importDeclaration(node, relations, context) {
    const source = node.childForFieldName("source");
    if (!source)
      return;
    const module = stripQuotes(source.text);
    const specifiers = new Set;
    for (let index = 0;index < node.namedChildCount; index += 1) {
      const clause = node.namedChild(index);
      if (clause?.type !== "import_clause")
        continue;
      this.#collectImportSpecifiers(clause, specifiers);
    }
    if (!specifiers.size)
      relations.push({
        kind: "import",
        module,
        ...relationFile(node, context)
      });
    else
      for (const specifier of specifiers)
        relations.push({
          kind: "import",
          module,
          specifier,
          ...relationFile(node, context)
        });
  }
  callExpression(node, relations, context) {
    const functionNode = node.childForFieldName("function");
    if (!functionNode || functionNode.type === "super")
      return;
    if (functionNode.text === "require" || functionNode.text === "import") {
      const argument = node.childForFieldName("arguments")?.namedChild(0);
      if (argument)
        relations.push({
          kind: "import",
          module: stripQuotes(argument.text),
          ...relationFile(node, context)
        });
      return;
    }
    if (functionNode.type === "identifier") {
      relations.push({
        kind: "reference",
        target: functionNode.text,
        role: "call",
        ...relationFile(functionNode, context)
      });
      return;
    }
    if (functionNode.type === "member_expression" || functionNode.type === "attribute") {
      const property = functionNode.childForFieldName("property") ?? functionNode.childForFieldName("attribute");
      const object = functionNode.childForFieldName("object");
      if (property?.text && object)
        relations.push({
          kind: "reference",
          target: property.text,
          role: "call",
          receiver: object.text,
          ...relationFile(functionNode, context)
        });
    }
  }
  constructorCall(node, relations, context) {
    const constructor = node.childForFieldName("constructor");
    if (!constructor)
      return;
    const name = constructor.type === "member_expression" ? constructor.childForFieldName("property")?.text : constructor.text;
    if (name)
      relations.push({
        kind: "reference",
        target: name,
        role: "constructor",
        ...relationFile(constructor, context)
      });
  }
  exportDeclaration(node, relations, context) {
    const source = node.childForFieldName("source");
    if (source) {
      relations.push({
        kind: "export",
        target: stripQuotes(source.text),
        ...relationFile(node, context)
      });
      return;
    }
    const value = node.childForFieldName("value") ?? node.childForFieldName("declaration");
    if (value)
      relations.push({
        kind: "export",
        target: value.childForFieldName("name")?.text ?? value.text,
        ...relationFile(node, context)
      });
  }
  classDeclaration(node, relations, context) {
    const visit = (clause) => {
      const role = clause.type.includes("extends") ? "extends" : clause.type.includes("implements") ? "implements" : null;
      if (role) {
        for (let index = 0;index < clause.namedChildCount; index += 1) {
          const type = clause.namedChild(index);
          if (!type)
            continue;
          const target = this.#typeName(type.text);
          if (target)
            relations.push({
              kind: "reference",
              target,
              role,
              ...relationFile(type, context)
            });
        }
        return;
      }
      if (clause.type === "class_heritage" || clause.type === "heritage_clause")
        for (let index = 0;index < clause.namedChildCount; index += 1) {
          const child = clause.namedChild(index);
          if (child)
            visit(child);
        }
    };
    for (let index = 0;index < node.namedChildCount; index += 1) {
      const child = node.namedChild(index);
      if (child)
        visit(child);
    }
  }
  functionDeclaration(node, relations, context) {
    const returnType = node.childForFieldName("return_type");
    const target = returnType ? this.#typeName(returnType.text) : null;
    if (returnType && target)
      relations.push({
        kind: "reference",
        target,
        role: "return-type",
        ...relationFile(returnType, context)
      });
  }
  #collectImportSpecifiers(node, specifiers) {
    if (node.type === "import_specifier") {
      const name = node.childForFieldName("name")?.text;
      if (name)
        specifiers.add(name);
      return;
    }
    if (node.type === "identifier") {
      specifiers.add(node.text);
      return;
    }
    for (let index = 0;index < node.namedChildCount; index += 1) {
      const child = node.namedChild(index);
      if (child)
        this.#collectImportSpecifiers(child, specifiers);
    }
  }
  #typeName(text) {
    const normalized = text.trim().replace(/^:\s*/, "").replace(/^(?:extends|implements)\s+/, "").replace(/^readonly\s+/, "");
    const primary = normalized.match(/[A-Za-z_$][\w$]*(?:[.\\][A-Za-z_$][\w$]*)*/)?.[0];
    return primary?.split(/[.\\]/).pop() ?? null;
  }
}

// packages/parser/src/language/adapter/php.ts
class PhpLanguageAdapter extends BaseLanguageAdapter {
  static declarationKinds = new Set([
    "class_declaration",
    "interface_declaration",
    "trait_declaration",
    "function_definition",
    "method_declaration"
  ]);
  definition = {
    id: "php",
    extensions: [".php", ".php5", ".php7"],
    grammar: Php.php_only
  };
  get handlers() {
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
      include_once_expression: this.#include.bind(this)
    };
  }
  #namespaceUse(node, relations, context) {
    for (let index = 0;index < node.namedChildCount; index += 1) {
      const clause = node.namedChild(index);
      if (!clause)
        continue;
      const target = clause.text.replace(/\s+as\s+\w+$/i, "");
      relations.push({
        kind: "import",
        module: target,
        specifier: target.split("\\").pop(),
        ...relationFile(node, context)
      });
    }
  }
  #functionCall(node, relations, context) {
    const functionNode = node.childForFieldName("function") ?? node.namedChild(0);
    const functionName = functionNode?.text.split("\\").pop()?.split("::").pop();
    if (!functionName || functionName.startsWith("$"))
      return;
    if (context.eventDetector.matches(functionName)) {
      const event = context.eventDetector.detect({
        functionName,
        arguments: this.#arguments(node),
        filePath: context.filePath,
        range: range(node)
      });
      if (event)
        relations.push(event);
      return;
    }
    relations.push({
      kind: "reference",
      target: functionName,
      role: "call",
      ...relationFile(functionNode, context)
    });
  }
  #memberCall(node, relations, context) {
    const name = node.childForFieldName("name");
    const receiver = node.childForFieldName("object") ?? node.childForFieldName("scope");
    if (name?.text && receiver)
      relations.push({
        kind: "reference",
        target: name.text,
        receiver: receiver.text,
        role: "call",
        ...relationFile(name, context)
      });
  }
  #objectCreation(node, relations, context) {
    const name = node.namedChild(0);
    if (name?.text)
      relations.push({
        kind: "reference",
        target: name.text.split("\\").pop(),
        role: "constructor",
        ...relationFile(name, context)
      });
  }
  #include(node, relations, context) {
    const argument = node.namedChild(0);
    if (argument?.type === "string")
      relations.push({
        kind: "import",
        module: stripQuotes(argument.text),
        ...relationFile(node, context)
      });
  }
  #arguments(node) {
    const args = node.childForFieldName("arguments");
    if (!args)
      return [];
    return Array.from({ length: args.namedChildCount }, (_, index) => this.#argument(args.namedChild(index)));
  }
  #argument(node) {
    const value = node?.type === "argument" ? node.namedChild(node.namedChildCount - 1) : node;
    if (!value)
      return {
        text: "",
        stringLiteral: false,
        integerLiteral: false,
        closure: false
      };
    if (value.type === "string")
      return {
        text: stripQuotes(value.text),
        stringLiteral: true,
        integerLiteral: false,
        closure: false
      };
    if (value.type === "integer")
      return {
        text: value.text,
        stringLiteral: false,
        integerLiteral: true,
        closure: false
      };
    if (value.type === "anonymous_function" || value.type === "arrow_function")
      return {
        text: "",
        stringLiteral: false,
        integerLiteral: false,
        closure: true
      };
    return {
      text: value.text,
      stringLiteral: false,
      integerLiteral: false,
      closure: false
    };
  }
}

// packages/parser/src/language/adapter/python.ts
import Python from "tree-sitter-python";
class PythonLanguageAdapter extends BaseLanguageAdapter {
  static declarationKinds = new Set([
    "class_definition",
    "function_definition"
  ]);
  definition = {
    id: "python",
    extensions: [".py"],
    grammar: Python
  };
  get handlers() {
    return {
      import_statement: this.#import.bind(this),
      import_from_statement: this.#importFrom.bind(this),
      call: this.callExpression.bind(this),
      class_definition: this.#classDefinition.bind(this)
    };
  }
  #import(node, relations, context) {
    for (let index = 0;index < node.namedChildCount; index += 1) {
      const child = node.namedChild(index);
      const dotted = child?.type === "aliased_import" ? child.childForFieldName("name") : child;
      if (dotted?.text)
        relations.push({
          kind: "import",
          module: dotted.text,
          specifier: dotted.text.split(".").pop(),
          ...relationFile(node, context)
        });
    }
  }
  #importFrom(node, relations, context) {
    const module = node.childForFieldName("module_name")?.text;
    if (!module)
      return;
    let emitted = false;
    for (let index = 0;index < node.namedChildCount; index += 1) {
      const child = node.namedChild(index);
      if (!child || child === node.childForFieldName("module_name") || child.type === "wildcard_import")
        continue;
      const imported = child.type === "aliased_import" ? child.childForFieldName("name")?.text : child.text;
      if (imported) {
        relations.push({
          kind: "import",
          module,
          specifier: imported.split(".").pop(),
          ...relationFile(node, context)
        });
        emitted = true;
      }
    }
    if (!emitted)
      relations.push({
        kind: "import",
        module,
        ...relationFile(node, context)
      });
  }
  #classDefinition(node, relations, context) {
    const superclasses = node.childForFieldName("superclasses");
    if (!superclasses)
      return;
    for (let index = 0;index < superclasses.namedChildCount; index += 1) {
      const base = superclasses.namedChild(index);
      if (!base || base.type === "keyword_argument")
        continue;
      const name = base.type === "attribute" ? base.childForFieldName("attribute")?.text : base.text;
      if (name)
        relations.push({
          kind: "reference",
          target: name,
          role: "extends",
          ...relationFile(base, context)
        });
    }
  }
}

// packages/parser/src/language/adapter/typescript.ts
import JavaScript from "tree-sitter-javascript";
import TypeScript from "tree-sitter-typescript";
class TypeScriptLanguageAdapter extends BaseLanguageAdapter {
  static declarationKinds = new Set([
    "class_declaration",
    "function_declaration",
    "method_definition",
    "interface_declaration",
    "enum_declaration",
    "type_alias_declaration",
    "variable_declarator"
  ]);
  definition;
  constructor(id) {
    super();
    const grammar = id === "typescript" ? TypeScript.typescript : id === "tsx" ? TypeScript.tsx : JavaScript;
    this.definition = {
      id,
      extensions: id === "typescript" ? [".ts"] : id === "tsx" ? [".tsx"] : id === "javascript" ? [".js", ".mjs", ".cjs"] : [".jsx"],
      grammar
    };
  }
  get handlers() {
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
      method_signature: this.functionDeclaration.bind(this)
    };
  }
}

// packages/parser/src/language/index.ts
class LanguageRegistry {
  #adapters = new Map;
  #extensions = new Map;
  constructor(adapters = LanguageRegistry.builtins()) {
    for (const adapter of adapters)
      this.#register(adapter);
  }
  static builtins() {
    return [
      new TypeScriptLanguageAdapter("typescript"),
      new TypeScriptLanguageAdapter("tsx"),
      new TypeScriptLanguageAdapter("javascript"),
      new TypeScriptLanguageAdapter("jsx"),
      new PythonLanguageAdapter,
      new PhpLanguageAdapter
    ];
  }
  detect(filePath) {
    const extension = filePath.slice(filePath.lastIndexOf(".")).toLowerCase();
    return this.#extensions.get(extension) ?? null;
  }
  get(language) {
    return this.#adapters.get(language);
  }
  supports(language) {
    return this.#adapters.has(language);
  }
  extensions() {
    return [...this.#extensions.keys()].sort();
  }
  languages() {
    return [...this.#adapters.keys()];
  }
  #register(adapter) {
    this.#adapters.set(adapter.definition.id, adapter);
    for (const extension of adapter.definition.extensions)
      this.#extensions.set(extension, adapter.definition.id);
  }
}

// packages/parser/src/parallel/index.ts
import { cpus } from "node:os";
import { Worker } from "node:worker_threads";

// packages/parser/src/parallel/error.ts
function toParallelParserError(kind, details) {
  return { kind, ...details };
}

// packages/parser/src/parallel/index.ts
class ParallelFileParser {
  #options;
  #workers = new Set;
  constructor(options = {}) {
    this.#options = {
      workers: options.workers ?? "auto",
      maxWorkers: Math.max(1, options.maxWorkers ?? 8),
      batchSize: Math.max(1, options.batchSize ?? 32),
      minimumFiles: Math.max(1, options.minimumFiles ?? 64)
    };
  }
  async parse(jobs, signal) {
    if (signal?.aborted)
      return err(toParallelParserError(2 /* Aborted */, {}));
    if (!jobs.length)
      return ok({ results: new Map, diagnostics: [] });
    const requested = this.#options.workers === "auto" ? Math.max(1, cpus().length - 1) : Math.max(1, this.#options.workers);
    const count = Math.min(this.#options.maxWorkers, requested, Math.ceil(jobs.length / this.#options.batchSize));
    const batches = Array.from({ length: count }, () => []);
    jobs.forEach((job, index) => batches[index % count].push(job));
    try {
      const responses = (await Promise.all(batches.filter(Boolean).filter((batch) => batch.length).map((batch) => this.#run(batch, signal)))).flat();
      const results2 = new Map;
      const diagnostics = [];
      for (const response of responses) {
        if (response.result) {
          results2.set(response.filePath, response.result);
          diagnostics.push(...response.result.diagnostics);
        } else if (response.diagnostic)
          diagnostics.push(response.diagnostic);
      }
      return ok({ results: results2, diagnostics });
    } catch (cause) {
      if (signal?.aborted)
        return err(toParallelParserError(2 /* Aborted */, {}));
      return err(toParallelParserError(1 /* WorkerFailed */, {
        message: "A parser worker failed",
        cause
      }));
    }
  }
  async dispose() {
    await Promise.all([...this.#workers].map((worker) => worker.terminate()));
    this.#workers.clear();
  }
  #run(jobs, signal) {
    return new Promise((resolve, reject) => {
      const worker = new Worker(new URL("./worker.js", import.meta.url), {
        workerData: { jobs }
      });
      this.#workers.add(worker);
      const abort = () => void worker.terminate();
      signal?.addEventListener("abort", abort, { once: true });
      worker.once("message", (responses) => resolve(responses));
      worker.once("error", reject);
      worker.once("exit", (code) => {
        this.#workers.delete(worker);
        signal?.removeEventListener("abort", abort);
        if (code !== 0 && !signal?.aborted)
          reject(new Error(`Parser worker exited with code ${code}`));
      });
    });
  }
}

// packages/parser/src/engine/error.ts
function toParserEngineError(kind, details) {
  return { kind, ...details };
}

// packages/parser/src/engine/index.ts
class ParserEngine {
  #parser = new Parser;
  #registry;
  #declarations = new DeclarationExtractor;
  #eventCalls;
  #onDiagnostic;
  #parallelism;
  #workerSafe;
  #disposed = false;
  constructor(options = {}) {
    this.#registry = new LanguageRegistry([
      ...LanguageRegistry.builtins(),
      ...options.languageAdapters ?? []
    ]);
    this.#eventCalls = options.eventCalls;
    this.#onDiagnostic = options.onDiagnostic;
    this.#parallelism = options.parallelism;
    const builtinIds = new Set([
      "typescript",
      "tsx",
      "javascript",
      "jsx",
      "python",
      "php"
    ]);
    this.#workerSafe = this.#registry.languages().every((id) => builtinIds.has(id));
  }
  supportedExtensions() {
    return this.#registry.extensions();
  }
  parse(file, options = {}) {
    if (this.#disposed) {
      return err(toParserEngineError(3 /* Disposed */, {}));
    }
    const language = file.language ?? this.#registry.detect(file.filePath);
    if (!language) {
      return err(toParserEngineError(0 /* UnsupportedLanguage */, {
        filePath: file.filePath
      }));
    }
    const adapter = this.#registry.get(language);
    if (!adapter) {
      return err(toParserEngineError(0 /* UnsupportedLanguage */, {
        filePath: file.filePath,
        language
      }));
    }
    const detectorResult = EventCallDetector.create(options.eventCalls ?? this.#eventCalls);
    if (detectorResult.isErr()) {
      return err(toParserEngineError(2 /* ParseFailed */, {
        filePath: file.filePath,
        cause: detectorResult.error
      }));
    }
    const parsedTree = safeCall(() => {
      this.#parser.setLanguage(adapter.definition.grammar);
      return this.#parser.parse(file.source);
    }, (cause) => toParserEngineError(2 /* ParseFailed */, {
      filePath: file.filePath,
      cause
    }));
    if (parsedTree.isErr())
      return parsedTree;
    const tree = parsedTree.value;
    const context = {
      filePath: file.filePath,
      projectRoot: file.projectRoot,
      language
    };
    const declarationResult = this.#declarations.extract(tree.rootNode, context, adapter);
    if (declarationResult.isErr())
      return err(toParserEngineError(2 /* ParseFailed */, {
        filePath: file.filePath,
        cause: declarationResult.error
      }));
    const diagnostics = tree.rootNode.hasError ? [
      {
        code: "syntax-error",
        severity: "warning",
        message: "Tree-sitter recovered from one or more syntax errors",
        filePath: file.filePath
      }
    ] : [];
    for (const diagnostic of diagnostics)
      this.#onDiagnostic?.(diagnostic);
    return ok({
      filePath: file.filePath,
      language,
      declarations: declarationResult.value,
      relations: adapter.extractRelations(tree.rootNode, {
        ...context,
        eventDetector: detectorResult.value
      }),
      diagnostics,
      hasSyntaxErrors: tree.rootNode.hasError
    });
  }
  async parseFile(filePath, options = {}) {
    return fromAsync(async () => {
      const source = await readFile(filePath, "utf8");
      return this.parse({
        filePath,
        source,
        language: options.language,
        projectRoot: options.projectRoot
      }, options);
    }, (cause) => toParserEngineError(1 /* FileReadFailed */, {
      filePath,
      cause
    })).then((result) => result.isErr() ? result : result.value);
  }
  async parseFiles(filePaths, options = {}) {
    const parallelism = options.parallelism ?? this.#parallelism;
    const threshold = parallelism && parallelism.minimumFiles !== undefined ? parallelism.minimumFiles : 64;
    if (parallelism !== false && this.#workerSafe && filePaths.length >= threshold) {
      const parser = new ParallelFileParser(parallelism || {});
      const parsed = await parser.parse(filePaths.map((filePath) => ({
        filePath,
        projectRoot: options.projectRootForFile?.(filePath) ?? options.projectRoot,
        language: this.#registry.detect(filePath) ?? undefined,
        eventCalls: options.eventCalls ?? this.#eventCalls
      })), options.signal);
      await parser.dispose();
      if (parsed.isOk())
        return parsed;
      if (options.continueOnError === false)
        return err(toParserEngineError(2 /* ParseFailed */, {
          filePath: "<workers>",
          cause: parsed.error
        }));
    }
    const results2 = new Map;
    const diagnostics = [];
    for (const filePath of filePaths) {
      if (options.signal?.aborted) {
        diagnostics.push({
          code: "aborted",
          severity: "warning",
          message: "Parsing was aborted",
          filePath
        });
        break;
      }
      const result = await this.parseFile(filePath, {
        projectRoot: options.projectRootForFile?.(filePath) ?? options.projectRoot,
        eventCalls: options.eventCalls
      });
      if (result.isErr()) {
        if (options.continueOnError === false)
          return result;
        const diagnostic = {
          code: result.error.kind === 1 /* FileReadFailed */ ? "file-read-failed" : result.error.kind === 0 /* UnsupportedLanguage */ ? "unsupported-language" : "parse-failed",
          severity: "error",
          message: "Failed to parse file",
          filePath
        };
        diagnostics.push(diagnostic);
        this.#onDiagnostic?.(diagnostic);
        continue;
      }
      results2.set(filePath, result.value);
      diagnostics.push(...result.value.diagnostics);
    }
    const batch = { results: results2, diagnostics };
    return ok(batch);
  }
  dispose() {
    this.#disposed = true;
  }
}

// packages/parser/src/parallel/worker.ts
var { jobs } = workerData;
var engine = new ParserEngine({ parallelism: false });
var responses = [];
for (const job of jobs) {
  const result = await engine.parseFile(job.filePath, {
    projectRoot: job.projectRoot,
    language: job.language,
    eventCalls: job.eventCalls
  });
  if (result.isOk())
    responses.push({ filePath: job.filePath, result: result.value });
  else
    responses.push({
      filePath: job.filePath,
      diagnostic: {
        code: "worker-failed",
        severity: "error",
        message: "Worker could not parse file",
        filePath: job.filePath
      }
    });
}
engine.dispose();
parentPort?.postMessage(responses);

//# debugId=7BE48DA98DC7E0CC64756E2164756E21
