#!/usr/bin/env node
var __defProp = Object.defineProperty;
var __returnValue = (v) => v;
function __exportSetter(name, newValue) {
  this[name] = __returnValue.bind(null, newValue);
}
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, {
      get: all[name],
      enumerable: true,
      configurable: true,
      set: __exportSetter.bind(all, name)
    });
};
var __esm = (fn, res) => () => (fn && (res = fn(fn = 0)), res);

// node_modules/.bun/@usersatoshi+results@1.0.0+1fb4c65d43e298b9/node_modules/@usersatoshi/results/dist/esm/results/index.js
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
var ResultError, Ok, Err;
var init_results = __esm(() => {
  ResultError = class ResultError extends Error {
    constructor(message) {
      super(message);
      this.name = "ResultError";
    }
  };
  Ok = class Ok extends BaseResult {
    constructor(value) {
      super();
      this.value = value;
      this.success = true;
    }
  };
  Err = class Err extends BaseResult {
    constructor(error) {
      super();
      this.error = error;
      this.success = false;
    }
  };
});

// node_modules/.bun/@usersatoshi+results@1.0.0+1fb4c65d43e298b9/node_modules/@usersatoshi/results/dist/esm/types.js
var init_types = () => {};

// node_modules/.bun/@usersatoshi+results@1.0.0+1fb4c65d43e298b9/node_modules/@usersatoshi/results/dist/esm/index.js
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
var init_esm = __esm(() => {
  init_results();
  init_results();
  init_types();
});

// node_modules/.bun/@usersatoshi+results@1.0.0+7524df1edfed9f02/node_modules/@usersatoshi/results/dist/esm/results/index.js
class BaseResult2 {
  static all(results2) {
    if (results2.length > 0 && results2[0] instanceof Promise) {
      return Promise.all(results2).then((resolved) => BaseResult2.all(resolved));
    }
    const values = [];
    for (const result of results2) {
      if (result.isErr())
        return new Err2(result.error);
      values.push(result.value);
    }
    return new Ok2(values);
  }
  static any(results2) {
    if (results2.length > 0 && results2[0] instanceof Promise) {
      return Promise.all(results2).then((resolved) => BaseResult2.any(resolved));
    }
    let lastErr;
    for (const result of results2) {
      if (result.isOk())
        return result;
      lastErr = result.error;
    }
    return new Err2(lastErr);
  }
  andThen(fn) {
    if (this.success && this.value !== undefined) {
      return fn(this.value);
    }
    return new Err2(this.error);
  }
  orElse(fn) {
    if (!this.success && this.error !== undefined) {
      return fn(this.error);
    }
    return new Ok2(this.value);
  }
  map(fn) {
    if (this.success && this.value !== undefined) {
      const result = fn(this.value);
      if (result instanceof Promise) {
        return result.then((v) => new Ok2(v));
      }
      return new Ok2(result);
    }
    return new Err2(this.error);
  }
  mapErr(fn) {
    if (!this.success && this.error !== undefined) {
      const result = fn(this.error);
      if (result instanceof Promise) {
        return result.then((e) => new Err2(e));
      }
      return new Err2(result);
    }
    return new Ok2(this.value);
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
    throw new ResultError2(`Called unwrap on an Err: ${JSON.stringify(this.error)}`);
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
var ResultError2, Ok2, Err2;
var init_results2 = __esm(() => {
  ResultError2 = class ResultError2 extends Error {
    constructor(message) {
      super(message);
      this.name = "ResultError";
    }
  };
  Ok2 = class Ok2 extends BaseResult2 {
    constructor(value) {
      super();
      this.value = value;
      this.success = true;
    }
  };
  Err2 = class Err2 extends BaseResult2 {
    constructor(error) {
      super();
      this.error = error;
      this.success = false;
    }
  };
});

// node_modules/.bun/@usersatoshi+results@1.0.0+7524df1edfed9f02/node_modules/@usersatoshi/results/dist/esm/types.js
var init_types2 = () => {};

// node_modules/.bun/@usersatoshi+results@1.0.0+7524df1edfed9f02/node_modules/@usersatoshi/results/dist/esm/index.js
function ok2(value) {
  return new Ok2(value);
}
function err2(error) {
  return new Err2(error);
}
async function fromPromise2(promise, onErr) {
  try {
    return ok2(await promise);
  } catch (error) {
    return err2(onErr(error));
  }
}
async function fromAsync2(fn, onErr) {
  return fromPromise2(fn(), onErr);
}
function safeCall2(fn, onErr) {
  if (fn instanceof Promise) {
    return fromPromise2(fn, onErr);
  }
  try {
    const result = fn();
    if (result instanceof Promise) {
      return fromPromise2(result, onErr);
    }
    return ok2(result);
  } catch (error) {
    return err2(onErr(error));
  }
}
var init_esm2 = __esm(() => {
  init_results2();
  init_results2();
  init_types2();
});

// packages/parser/dist/declaration/error.js
function toDeclarationError(kind, details) {
  return { kind, ...details };
}
var DeclarationErrorKind, toDeclarationErr = (kind, details) => err2(toDeclarationError(kind, details));
var init_error = __esm(() => {
  init_esm2();
  (function(DeclarationErrorKind2) {
    DeclarationErrorKind2[DeclarationErrorKind2["ExtractionFailed"] = 0] = "ExtractionFailed";
  })(DeclarationErrorKind || (DeclarationErrorKind = {}));
});

// packages/parser/dist/declaration/index.js
import * as path2 from "node:path";

class DeclarationExtractor {
  extract(root, context, adapter) {
    return safeCall2(() => {
      const declarations = this.#visit(root, context, adapter, 0, null);
      const deduplicated = this.#deduplicateOverloads(declarations);
      return this.#finalize(deduplicated, root, context);
    }, (cause) => toDeclarationError(DeclarationErrorKind.ExtractionFailed, {
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
    return context.projectRoot ? path2.relative(context.projectRoot, context.filePath) : path2.basename(context.filePath);
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
var ALWAYS_KEEP, OVERLOADABLE, EXPORT_KINDS;
var init_declaration = __esm(() => {
  init_esm2();
  init_error();
  init_error();
  ALWAYS_KEEP = new Set(["export_statement", "export_declaration"]);
  OVERLOADABLE = new Set([
    "function_declaration",
    "function_signature",
    "method_declaration",
    "constructor_declaration",
    "function_definition"
  ]);
  EXPORT_KINDS = new Set(["export_statement", "export_declaration"]);
});

// packages/parser/dist/event/error.js
function toEventCallError(kind, details) {
  return { kind, ...details };
}
var EventCallErrorKind, toEventCallErr = (kind, details) => err2(toEventCallError(kind, details));
var init_error2 = __esm(() => {
  init_esm2();
  (function(EventCallErrorKind2) {
    EventCallErrorKind2[EventCallErrorKind2["InvalidConfiguration"] = 0] = "InvalidConfiguration";
  })(EventCallErrorKind || (EventCallErrorKind = {}));
});

// packages/parser/dist/event/index.js
class EventCallDetector {
  #config;
  constructor(config) {
    this.#config = config;
  }
  static create(config = {}) {
    for (const [name, rule] of Object.entries(config.fires ?? {})) {
      const validationError = EventCallDetector.#validateFireRule(name, rule);
      if (validationError)
        return err2(validationError);
    }
    for (const [name, rule] of Object.entries(config.listens ?? {})) {
      const validationError = EventCallDetector.#validateListenRule(name, rule);
      if (validationError)
        return err2(validationError);
    }
    return ok2(new EventCallDetector(config));
  }
  static #validateIndex(value, label) {
    if (!Number.isInteger(value) || value < 0) {
      return toEventCallError(EventCallErrorKind.InvalidConfiguration, {
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
var init_event = __esm(() => {
  init_esm2();
  init_error2();
  init_error2();
});

// packages/parser/dist/language/adapter/helper.js
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

// packages/parser/dist/language/adapter/base.js
var BaseLanguageAdapter;
var init_base = __esm(() => {
  BaseLanguageAdapter = class BaseLanguageAdapter {
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
  };
});

// packages/parser/dist/language/adapter/php.js
import Php from "tree-sitter-php";
var PhpLanguageAdapter;
var init_php = __esm(() => {
  init_base();
  PhpLanguageAdapter = class PhpLanguageAdapter extends BaseLanguageAdapter {
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
  };
});

// packages/parser/dist/language/adapter/python.js
import Python from "tree-sitter-python";
var PythonLanguageAdapter;
var init_python = __esm(() => {
  init_base();
  PythonLanguageAdapter = class PythonLanguageAdapter extends BaseLanguageAdapter {
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
  };
});

// packages/parser/dist/language/adapter/typescript.js
import JavaScript from "tree-sitter-javascript";
import TypeScript from "tree-sitter-typescript";
var TypeScriptLanguageAdapter;
var init_typescript = __esm(() => {
  init_base();
  TypeScriptLanguageAdapter = class TypeScriptLanguageAdapter extends BaseLanguageAdapter {
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
  };
});

// packages/parser/dist/language/error.js
var LanguageErrorKind;
var init_error3 = __esm(() => {
  init_esm2();
  (function(LanguageErrorKind2) {
    LanguageErrorKind2[LanguageErrorKind2["NotRegistered"] = 0] = "NotRegistered";
    LanguageErrorKind2[LanguageErrorKind2["DuplicateRegistration"] = 1] = "DuplicateRegistration";
    LanguageErrorKind2[LanguageErrorKind2["GrammarConfigurationFailed"] = 2] = "GrammarConfigurationFailed";
  })(LanguageErrorKind || (LanguageErrorKind = {}));
});

// packages/parser/dist/language/index.js
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
var init_language = __esm(() => {
  init_php();
  init_python();
  init_typescript();
  init_typescript();
  init_python();
  init_php();
  init_base();
  init_error3();
});

// packages/parser/dist/parallel/error.js
function toParallelParserError(kind, details) {
  return { kind, ...details };
}
var ParallelParserErrorKind;
var init_error4 = __esm(() => {
  init_esm2();
  (function(ParallelParserErrorKind2) {
    ParallelParserErrorKind2[ParallelParserErrorKind2["InvalidOptions"] = 0] = "InvalidOptions";
    ParallelParserErrorKind2[ParallelParserErrorKind2["WorkerFailed"] = 1] = "WorkerFailed";
    ParallelParserErrorKind2[ParallelParserErrorKind2["Aborted"] = 2] = "Aborted";
  })(ParallelParserErrorKind || (ParallelParserErrorKind = {}));
});

// packages/parser/dist/parallel/index.js
import { cpus } from "node:os";
import { Worker } from "node:worker_threads";

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
      return err2(toParallelParserError(ParallelParserErrorKind.Aborted, {}));
    if (!jobs.length)
      return ok2({ results: new Map, diagnostics: [] });
    const requested = this.#options.workers === "auto" ? Math.max(1, cpus().length - 1) : Math.max(1, this.#options.workers);
    const count = Math.min(this.#options.maxWorkers, requested, Math.ceil(jobs.length / this.#options.batchSize));
    const batches = Array.from({ length: count }, () => []);
    jobs.forEach((job, index) => batches[index % count].push(job));
    try {
      const responses = (await Promise.all(batches.filter(Boolean).filter((batch) => batch.length).map((batch) => this.#run(batch, signal)))).flat();
      const results3 = new Map;
      const diagnostics = [];
      for (const response of responses) {
        if (response.result) {
          results3.set(response.filePath, response.result);
          diagnostics.push(...response.result.diagnostics);
        } else if (response.diagnostic)
          diagnostics.push(response.diagnostic);
      }
      return ok2({ results: results3, diagnostics });
    } catch (cause) {
      if (signal?.aborted)
        return err2(toParallelParserError(ParallelParserErrorKind.Aborted, {}));
      return err2(toParallelParserError(ParallelParserErrorKind.WorkerFailed, {
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
var init_parallel = __esm(() => {
  init_esm2();
  init_error4();
  init_error4();
});

// packages/parser/dist/engine/error.js
function toParserEngineError(kind, details) {
  return { kind, ...details };
}
var ParserEngineErrorKind, toParserEngineErr = (kind, details) => err2(toParserEngineError(kind, details));
var init_error5 = __esm(() => {
  init_esm2();
  (function(ParserEngineErrorKind2) {
    ParserEngineErrorKind2[ParserEngineErrorKind2["UnsupportedLanguage"] = 0] = "UnsupportedLanguage";
    ParserEngineErrorKind2[ParserEngineErrorKind2["FileReadFailed"] = 1] = "FileReadFailed";
    ParserEngineErrorKind2[ParserEngineErrorKind2["ParseFailed"] = 2] = "ParseFailed";
    ParserEngineErrorKind2[ParserEngineErrorKind2["Disposed"] = 3] = "Disposed";
  })(ParserEngineErrorKind || (ParserEngineErrorKind = {}));
});

// packages/parser/dist/engine/index.js
import { readFile } from "node:fs/promises";
import Parser from "tree-sitter";

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
      return err2(toParserEngineError(ParserEngineErrorKind.Disposed, {}));
    }
    const language = file.language ?? this.#registry.detect(file.filePath);
    if (!language) {
      return err2(toParserEngineError(ParserEngineErrorKind.UnsupportedLanguage, {
        filePath: file.filePath
      }));
    }
    const adapter = this.#registry.get(language);
    if (!adapter) {
      return err2(toParserEngineError(ParserEngineErrorKind.UnsupportedLanguage, {
        filePath: file.filePath,
        language
      }));
    }
    const detectorResult = EventCallDetector.create(options.eventCalls ?? this.#eventCalls);
    if (detectorResult.isErr()) {
      return err2(toParserEngineError(ParserEngineErrorKind.ParseFailed, {
        filePath: file.filePath,
        cause: detectorResult.error
      }));
    }
    const parsedTree = safeCall2(() => {
      this.#parser.setLanguage(adapter.definition.grammar);
      return this.#parser.parse(file.source);
    }, (cause) => toParserEngineError(ParserEngineErrorKind.ParseFailed, {
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
      return err2(toParserEngineError(ParserEngineErrorKind.ParseFailed, {
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
    return ok2({
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
    return fromAsync2(async () => {
      const source = await readFile(filePath, "utf8");
      return this.parse({
        filePath,
        source,
        language: options.language,
        projectRoot: options.projectRoot
      }, options);
    }, (cause) => toParserEngineError(ParserEngineErrorKind.FileReadFailed, {
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
        return err2(toParserEngineError(ParserEngineErrorKind.ParseFailed, {
          filePath: "<workers>",
          cause: parsed.error
        }));
    }
    const results3 = new Map;
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
          code: result.error.kind === ParserEngineErrorKind.FileReadFailed ? "file-read-failed" : result.error.kind === ParserEngineErrorKind.UnsupportedLanguage ? "unsupported-language" : "parse-failed",
          severity: "error",
          message: "Failed to parse file",
          filePath
        };
        diagnostics.push(diagnostic);
        this.#onDiagnostic?.(diagnostic);
        continue;
      }
      results3.set(filePath, result.value);
      diagnostics.push(...result.value.diagnostics);
    }
    const batch = { results: results3, diagnostics };
    return ok2(batch);
  }
  dispose() {
    this.#disposed = true;
  }
}
var init_engine = __esm(() => {
  init_esm2();
  init_declaration();
  init_event();
  init_language();
  init_parallel();
  init_error5();
  init_error5();
});

// packages/parser/dist/resolver/error.js
function toImportResolverError(kind, details) {
  return { kind, ...details };
}
var ImportResolverErrorKind;
var init_error6 = __esm(() => {
  init_esm2();
  (function(ImportResolverErrorKind2) {
    ImportResolverErrorKind2[ImportResolverErrorKind2["InvalidOptions"] = 0] = "InvalidOptions";
    ImportResolverErrorKind2[ImportResolverErrorKind2["ResolutionFailed"] = 1] = "ResolutionFailed";
  })(ImportResolverErrorKind || (ImportResolverErrorKind = {}));
});

// packages/parser/dist/resolver/index.js
import { existsSync, readFileSync, statSync } from "node:fs";
import { basename as basename2, dirname, extname, join, resolve } from "node:path";

class ImportResolver {
  #options;
  #tsconfigCache = new Map;
  constructor(options = {}) {
    this.#options = options;
  }
  resolve(request) {
    return safeCall2(() => this.#resolve(request), (cause) => toImportResolverError(ImportResolverErrorKind.ResolutionFailed, {
      specifier: request.specifier,
      importerPath: request.importerPath,
      cause
    }));
  }
  resolveToSymbol(request) {
    const resolved = this.resolve(request);
    if (resolved.isErr())
      return resolved;
    if (!resolved.value)
      return ok2(null);
    return ok2({
      ...resolved.value,
      symbolName: request.importedName ?? basename2(resolved.value.filePath, extname(resolved.value.filePath))
    });
  }
  clearCache() {
    this.#tsconfigCache.clear();
  }
  #resolve(request) {
    const specifier = request.specifier;
    const importer = resolve(request.importerPath);
    const root = request.projectRoot ?? this.#options.projectRoot;
    if (/\.py$/i.test(importer)) {
      const filePath = this.#python(specifier, importer, root);
      return filePath ? { filePath, kind: "python-module" } : null;
    }
    if (/\.php[57]?$/i.test(importer)) {
      for (const base of [dirname(importer), root].filter(Boolean)) {
        const filePath = resolve(base, specifier);
        if (this.#isFile(filePath))
          return { filePath, kind: "php-include" };
      }
      return null;
    }
    if (specifier.startsWith(".")) {
      const base = resolve(dirname(importer), specifier);
      const extension = extname(base);
      const sourceStem = /^[.]?[cm]?jsx?$/.test(extension) ? base.slice(0, -extension.length) : base;
      const filePath = this.#probe(base) ?? this.#probe(sourceStem);
      return filePath ? { filePath, kind: "relative" } : null;
    }
    const aliased = this.#tsPath(specifier, importer);
    if (aliased)
      return { filePath: aliased, kind: "tsconfig-path" };
    const packages = request.workspacePackages ?? this.#options.workspacePackages;
    if (packages) {
      const match = Object.keys(packages).filter((name) => specifier === name || specifier.startsWith(`${name}/`)).sort((a, b) => b.length - a.length)[0];
      if (match) {
        const packageRoot = packages[match];
        const subpath = specifier === match ? "" : specifier.slice(match.length + 1);
        const filePath = subpath ? this.#probe(join(packageRoot, "src", subpath)) ?? this.#probe(join(packageRoot, subpath)) : this.#packageEntry(packageRoot);
        if (filePath)
          return { filePath, kind: "workspace" };
      }
    }
    return null;
  }
  #probe(base) {
    const extensions = this.#options.javascriptExtensions ?? DEFAULT_JS_EXTENSIONS;
    for (const candidate of [
      base,
      ...extensions.map((extension) => `${base}${extension}`),
      ...extensions.map((extension) => join(base, `index${extension}`))
    ])
      if (this.#isFile(candidate))
        return resolve(candidate);
    return null;
  }
  #packageEntry(root) {
    const packageJson = join(root, "package.json");
    if (existsSync(packageJson)) {
      try {
        const pkg = JSON.parse(readFileSync(packageJson, "utf8"));
        const rootExport = typeof pkg.exports === "string" ? pkg.exports : pkg.exports?.["."];
        const target = typeof rootExport === "string" ? rootExport : rootExport && typeof rootExport === "object" ? rootExport.import ?? rootExport.default : pkg.module ?? pkg.main;
        if (typeof target === "string") {
          const exact = resolve(root, target);
          if (this.#isFile(exact))
            return exact;
          const probed = this.#probe(exact.replace(/\.[^.]+$/, ""));
          if (probed)
            return probed;
        }
      } catch {}
    }
    return this.#probe(join(root, "src", "index")) ?? this.#probe(join(root, "index"));
  }
  #python(specifier, importer, root) {
    const dots = specifier.match(/^\.+/)?.[0].length ?? 0;
    const parts = specifier.slice(dots).split(".").filter(Boolean);
    if (dots) {
      let base = dirname(importer);
      for (let index = 1;index < dots; index += 1)
        base = dirname(base);
      return this.#pythonProbe(join(base, ...parts));
    }
    let current = dirname(importer);
    while (true) {
      const found = this.#pythonProbe(join(current, ...parts));
      if (found)
        return found;
      if (root && resolve(current) === resolve(root))
        break;
      const parent = dirname(current);
      if (parent === current)
        break;
      current = parent;
    }
    return null;
  }
  #pythonProbe(base) {
    for (const candidate of [`${base}.py`, join(base, "__init__.py")])
      if (this.#isFile(candidate))
        return resolve(candidate);
    return null;
  }
  #tsPath(specifier, importer) {
    const config = this.#nearestTsconfig(dirname(importer));
    if (!config)
      return null;
    for (const pattern of Object.keys(config.paths).sort((a, b) => b.length - a.length)) {
      const star = pattern.indexOf("*");
      const match = star < 0 ? specifier === pattern ? "" : null : specifier.startsWith(pattern.slice(0, star)) && specifier.endsWith(pattern.slice(star + 1)) ? specifier.slice(pattern.slice(0, star).length, specifier.length - pattern.slice(star + 1).length) : null;
      if (match === null)
        continue;
      for (const target of config.paths[pattern] ?? []) {
        const filePath = this.#probe(resolve(config.baseUrl, target.replace("*", match)));
        if (filePath)
          return filePath;
      }
    }
    return null;
  }
  #nearestTsconfig(start) {
    if (this.#tsconfigCache.has(start))
      return this.#tsconfigCache.get(start);
    let current = start;
    const visited = [];
    let found = null;
    while (true) {
      visited.push(current);
      for (const name of this.#options.tsconfigNames ?? [
        "tsconfig.json",
        "jsconfig.json"
      ]) {
        const file = join(current, name);
        if (!existsSync(file))
          continue;
        try {
          const raw = readFileSync(file, "utf8").replace(/\/\*[\s\S]*?\*\//g, "").replace(/^\s*\/\/.*$/gm, "").replace(/,\s*([}\]])/g, "$1");
          const parsed = JSON.parse(raw);
          const paths = parsed.compilerOptions?.paths;
          if (paths) {
            found = {
              baseUrl: resolve(current, parsed.compilerOptions?.baseUrl ?? "."),
              paths
            };
            break;
          }
        } catch {}
      }
      if (found)
        break;
      const parent = dirname(current);
      if (parent === current)
        break;
      current = parent;
    }
    for (const directory of visited)
      this.#tsconfigCache.set(directory, found);
    return found;
  }
  #isFile(path3) {
    return existsSync(path3) && statSync(path3).isFile();
  }
}
var DEFAULT_JS_EXTENSIONS;
var init_resolver = __esm(() => {
  init_esm2();
  init_error6();
  init_error6();
  DEFAULT_JS_EXTENSIONS = [
    ".ts",
    ".tsx",
    ".mts",
    ".cts",
    ".js",
    ".jsx",
    ".mjs",
    ".cjs"
  ];
});

// packages/parser/dist/index.js
var exports_dist = {};
__export(exports_dist, {
  toParserEngineError: () => toParserEngineError,
  toParserEngineErr: () => toParserEngineErr,
  toEventCallError: () => toEventCallError,
  toEventCallErr: () => toEventCallErr,
  toDeclarationError: () => toDeclarationError,
  toDeclarationErr: () => toDeclarationErr,
  TypeScriptLanguageAdapter: () => TypeScriptLanguageAdapter,
  PythonLanguageAdapter: () => PythonLanguageAdapter,
  PhpLanguageAdapter: () => PhpLanguageAdapter,
  ParserEngineErrorKind: () => ParserEngineErrorKind,
  ParserEngine: () => ParserEngine,
  ParallelFileParser: () => ParallelFileParser,
  LanguageRegistry: () => LanguageRegistry,
  ImportResolver: () => ImportResolver,
  EventCallErrorKind: () => EventCallErrorKind,
  EventCallDetector: () => EventCallDetector,
  DeclarationExtractor: () => DeclarationExtractor,
  DeclarationErrorKind: () => DeclarationErrorKind,
  BaseLanguageAdapter: () => BaseLanguageAdapter
});
var init_dist = __esm(() => {
  init_engine();
  init_engine();
  init_resolver();
  init_parallel();
  init_declaration();
  init_declaration();
  init_event();
  init_event();
  init_language();
});

// packages/core/dist/db/error.js
function toCoreDatabaseError(kind, details) {
  return { kind, ...details };
}
var CoreDatabaseErrorKind;
var init_error7 = __esm(() => {
  init_esm();
  (function(CoreDatabaseErrorKind2) {
    CoreDatabaseErrorKind2[CoreDatabaseErrorKind2["OpenFailed"] = 0] = "OpenFailed";
    CoreDatabaseErrorKind2[CoreDatabaseErrorKind2["SchemaFailed"] = 1] = "SchemaFailed";
    CoreDatabaseErrorKind2[CoreDatabaseErrorKind2["QueryFailed"] = 2] = "QueryFailed";
    CoreDatabaseErrorKind2[CoreDatabaseErrorKind2["Closed"] = 3] = "Closed";
  })(CoreDatabaseErrorKind || (CoreDatabaseErrorKind = {}));
});

// packages/core/dist/db/index.js
import Database from "better-sqlite3";
import { existsSync as existsSync2, mkdirSync, readFileSync as readFileSync2, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { join as join2 } from "node:path";

class CoreDatabase {
  #database;
  #databasePath;
  #statements = new Map;
  #closed = false;
  constructor(database, databasePath) {
    this.#database = database;
    this.#databasePath = databasePath;
  }
  static open(options) {
    const opened = safeCall(() => {
      const databasePath = CoreDatabase.resolvePath(options);
      const database = new Database(databasePath);
      const connection = new CoreDatabase(database, databasePath);
      const schemaResult = connection.#ensureSchema();
      if (schemaResult.isErr()) {
        database.close();
        return schemaResult;
      }
      return ok(connection);
    }, (cause) => toCoreDatabaseError(CoreDatabaseErrorKind.OpenFailed, {
      databasePath: "<unresolved>",
      cause
    }));
    return opened.isErr() ? opened : opened.value;
  }
  static readProjectConfig(projectDir) {
    const configPath = join2(projectDir, ".vedh", "config.json");
    if (!existsSync2(configPath))
      return {};
    const parsed = safeCall(() => JSON.parse(readFileSync2(configPath, "utf8")), () => toCoreDatabaseError(CoreDatabaseErrorKind.QueryFailed, {
      sql: "read config",
      cause: undefined
    }));
    return parsed.isOk() ? parsed.value : {};
  }
  static resolvePath(options) {
    const dataDir = options.dataDir ?? process.env.VEDH_DATA_DIR ?? join2(homedir(), ".vedh");
    const config = options.projectDir ? CoreDatabase.readProjectConfig(options.projectDir) : {};
    if (options.projectDir && config.local) {
      const directory2 = join2(options.projectDir, config.dbPath ?? ".vedh");
      mkdirSync(directory2, { recursive: true });
      CoreDatabase.#writeProjectPointer(dataDir, options.repoHash, options.projectDir);
      return join2(directory2, "kb.sqlite");
    }
    const directory = join2(dataDir, options.repoHash);
    mkdirSync(directory, { recursive: true });
    return join2(directory, "kb.sqlite");
  }
  static #writeProjectPointer(dataDir, repoHash, projectDir) {
    const pointer = safeCall(() => {
      const directory = join2(dataDir, repoHash);
      mkdirSync(directory, { recursive: true });
      writeFileSync(join2(directory, "local-path"), projectDir, "utf8");
    }, () => toCoreDatabaseError(CoreDatabaseErrorKind.QueryFailed, {
      sql: "write local pointer",
      cause: undefined
    }));
  }
  run(sql, parameters = []) {
    if (this.#closed)
      return err(toCoreDatabaseError(CoreDatabaseErrorKind.Closed, {}));
    return safeCall(() => {
      const result = this.#statement(sql).run(...parameters);
      return {
        changes: result.changes,
        lastInsertRowid: result.lastInsertRowid
      };
    }, (cause) => toCoreDatabaseError(CoreDatabaseErrorKind.QueryFailed, { sql, cause }));
  }
  get(sql, parameters = []) {
    if (this.#closed)
      return err(toCoreDatabaseError(CoreDatabaseErrorKind.Closed, {}));
    return safeCall(() => this.#statement(sql).get(...parameters) ?? null, (cause) => toCoreDatabaseError(CoreDatabaseErrorKind.QueryFailed, { sql, cause }));
  }
  all(sql, parameters = []) {
    if (this.#closed)
      return err(toCoreDatabaseError(CoreDatabaseErrorKind.Closed, {}));
    return safeCall(() => this.#statement(sql).all(...parameters), (cause) => toCoreDatabaseError(CoreDatabaseErrorKind.QueryFailed, { sql, cause }));
  }
  close() {
    if (this.#closed)
      return ok(undefined);
    const closed = safeCall(() => {
      this.#statements.clear();
      this.#database.close();
      this.#closed = true;
    }, (cause) => toCoreDatabaseError(CoreDatabaseErrorKind.QueryFailed, {
      sql: "close",
      cause
    }));
    return closed;
  }
  #statement(sql) {
    const cached = this.#statements.get(sql);
    if (cached)
      return cached;
    const statement = this.#database.prepare(sql);
    if (this.#statements.size >= 128) {
      const oldest = this.#statements.keys().next().value;
      if (oldest)
        this.#statements.delete(oldest);
    }
    this.#statements.set(sql, statement);
    return statement;
  }
  #ensureSchema() {
    return safeCall(() => {
      this.#database.exec(`
				PRAGMA journal_mode = WAL;
				PRAGMA synchronous = NORMAL;
				PRAGMA foreign_keys = ON;
				CREATE TABLE IF NOT EXISTS repos (
					repo_hash TEXT PRIMARY KEY, url TEXT DEFAULT '', name TEXT DEFAULT '',
					languages TEXT DEFAULT '[]', indexed_at TEXT DEFAULT CURRENT_TIMESTAMP,
					status TEXT DEFAULT 'indexed', commit_hash TEXT DEFAULT '', node_count INTEGER DEFAULT 0,
					file_count INTEGER DEFAULT 0, schema_version TEXT DEFAULT ''
				);
				CREATE TABLE IF NOT EXISTS nodes (
					id TEXT PRIMARY KEY, name TEXT NOT NULL, kind TEXT NOT NULL, file_path TEXT NOT NULL,
					line_start INTEGER NOT NULL, line_end INTEGER NOT NULL,
					column_start INTEGER, column_end INTEGER, offset_start INTEGER, offset_end INTEGER,
					repo_hash TEXT NOT NULL,
					parent_id TEXT, hierarchy_level TEXT DEFAULT 'low', metadata_json TEXT DEFAULT '{}'
				);
				CREATE TABLE IF NOT EXISTS edges (
					source TEXT NOT NULL, target TEXT NOT NULL, type TEXT NOT NULL, weight REAL DEFAULT 1.0,
					metadata_json TEXT DEFAULT '{}', PRIMARY KEY (source, target, type)
				);
				CREATE TABLE IF NOT EXISTS wiki_pages (path TEXT PRIMARY KEY, content TEXT NOT NULL, updated_at TEXT DEFAULT CURRENT_TIMESTAMP);
				CREATE TABLE IF NOT EXISTS file_manifest (file_path TEXT NOT NULL, repo_hash TEXT NOT NULL, content_hash TEXT NOT NULL, mtime INTEGER NOT NULL, PRIMARY KEY (file_path, repo_hash));
				CREATE TABLE IF NOT EXISTS parse_cache (file_path TEXT NOT NULL, repo_hash TEXT NOT NULL, content_hash TEXT NOT NULL, data TEXT NOT NULL, PRIMARY KEY (file_path, repo_hash));
				CREATE INDEX IF NOT EXISTS idx_nodes_repo ON nodes(repo_hash);
				CREATE INDEX IF NOT EXISTS idx_edges_source ON edges(source);
				CREATE INDEX IF NOT EXISTS idx_edges_target ON edges(target);
			`);
      const columns = new Set(this.#database.prepare("PRAGMA table_info(nodes)").all().map((column) => column.name));
      for (const [name, type] of [
        ["column_start", "INTEGER"],
        ["column_end", "INTEGER"],
        ["offset_start", "INTEGER"],
        ["offset_end", "INTEGER"]
      ])
        if (!columns.has(name))
          this.#database.exec(`ALTER TABLE nodes ADD COLUMN ${name} ${type}`);
    }, (cause) => toCoreDatabaseError(CoreDatabaseErrorKind.SchemaFailed, {
      databasePath: this.#databasePath,
      cause
    }));
  }
}
var init_db = __esm(() => {
  init_esm();
  init_error7();
  init_error7();
});

// packages/core/dist/repository/index.js
class GraphRepository {
  #db;
  constructor(database) {
    this.#db = database;
  }
  get database() {
    return this.#db;
  }
  initRepo(repoHash, url = "", name = "") {
    const result = this.#db.run("INSERT OR IGNORE INTO repos (repo_hash, url, name, languages, indexed_at, status) VALUES (?, ?, ?, '[]', CURRENT_TIMESTAMP, 'indexed')", [repoHash, url, name]);
    return result.isErr() ? result : ok(undefined);
  }
  getRepo(repoHash) {
    return this.#db.get("SELECT * FROM repos WHERE repo_hash = ? LIMIT 1", [repoHash]);
  }
  updateSnapshot(repoHash, snapshot) {
    const result = this.#db.run("UPDATE repos SET commit_hash = COALESCE(?, commit_hash), node_count = ?, file_count = ?, schema_version = COALESCE(?, schema_version), indexed_at = CURRENT_TIMESTAMP WHERE repo_hash = ?", [
      snapshot.commitHash ?? null,
      snapshot.nodeCount ?? 0,
      snapshot.fileCount ?? 0,
      snapshot.schemaVersion ?? null,
      repoHash
    ]);
    return result.isErr() ? result : ok(undefined);
  }
  createNode(node) {
    return this.createNodes([node]);
  }
  createNodes(nodes) {
    const chunkSize = 400;
    for (let offset = 0;offset < nodes.length; offset += chunkSize) {
      const chunk = nodes.slice(offset, offset + chunkSize);
      const placeholders = chunk.map(() => "(?,?,?,?,?,?,?,?,?,?,?,?,?,?)").join(",");
      const parameters = chunk.flatMap((node) => [
        node.id,
        node.name,
        node.kind,
        node.file_path,
        node.line_start,
        node.line_end,
        node.column_start ?? null,
        node.column_end ?? null,
        node.offset_start ?? null,
        node.offset_end ?? null,
        node.repo_hash,
        node.parent_id,
        node.hierarchy_level,
        JSON.stringify(node.metadata)
      ]);
      const result = this.#db.run(`INSERT OR REPLACE INTO nodes (id,name,kind,file_path,line_start,line_end,column_start,column_end,offset_start,offset_end,repo_hash,parent_id,hierarchy_level,metadata_json) VALUES ${placeholders}`, parameters);
      if (result.isErr())
        return result;
    }
    return this.createEdges(nodes.flatMap((node) => node.parent_id ? [
      {
        source: node.parent_id,
        target: node.id,
        type: "contains",
        weight: 1
      }
    ] : []));
  }
  getNode(id) {
    const result = this.#db.get("SELECT * FROM nodes WHERE id = ? LIMIT 1", [id]);
    return result.isErr() ? result : ok(result.value ? this.#toNode(result.value) : null);
  }
  getNodes(repoHash) {
    const result = this.#db.all("SELECT * FROM nodes WHERE repo_hash = ?", [repoHash]);
    return result.isErr() ? result : ok(result.value.map((node) => this.#toNode(node)));
  }
  createEdge(edge) {
    return this.createEdges([edge]);
  }
  createEdges(edges) {
    const chunkSize = 1000;
    for (let offset = 0;offset < edges.length; offset += chunkSize) {
      const chunk = edges.slice(offset, offset + chunkSize);
      const placeholders = chunk.map(() => "(?,?,?,?,?)").join(",");
      const parameters = chunk.flatMap((edge) => [
        edge.source,
        edge.target,
        edge.type,
        edge.weight,
        edge.metadata_json ?? "{}"
      ]);
      const result = this.#db.run(`INSERT OR REPLACE INTO edges (source,target,type,weight,metadata_json) VALUES ${placeholders}`, parameters);
      if (result.isErr())
        return result;
    }
    return ok(undefined);
  }
  getEdges(nodeId) {
    return this.#db.all("SELECT * FROM edges WHERE source = ? OR target = ?", [nodeId, nodeId]);
  }
  #toNode(row) {
    const parsed = safeCall(() => JSON.parse(row.metadata_json), () => ({ kind: -1 }));
    return { ...row, metadata: parsed.isOk() ? parsed.value : {} };
  }
}
var init_repository = __esm(() => {
  init_esm();
  init_db();
});

// packages/core/dist/graph/index.js
class GraphService {
  #db;
  constructor(database) {
    this.#db = database;
  }
  walk(startNodeId, options = {}) {
    const visited = new Set;
    const nodes = [];
    const maxDepth = options.maxDepth ?? 5;
    const collect = (id, depth) => {
      if (depth > maxDepth || visited.has(id))
        return ok(undefined);
      visited.add(id);
      const node = this.#node(id);
      if (node.isErr())
        return node;
      if (node.value)
        nodes.push(node.value);
      const edges = this.neighbors(id);
      if (edges.isErr())
        return edges;
      for (const edge of edges.value) {
        if (!this.#matches(edge, options.edgeTypes))
          continue;
        const next = edge.source === id ? edge.target : edge.source;
        const nextResult = collect(next, depth + 1);
        if (nextResult.isErr())
          return nextResult;
      }
      return ok(undefined);
    };
    const collected = collect(startNodeId, 0);
    if (collected.isErr())
      return collected;
    return this.#subgraphForVisited(visited, nodes, options.edgeTypes);
  }
  impact(startNodeId, options = {}) {
    const maxDepth = options.maxDepth ?? 3;
    const visited = new Set([startNodeId]);
    const nodes = [];
    const queue = [{ id: startNodeId, depth: 0 }];
    for (let head = 0;head < queue.length; head++) {
      const current = queue[head];
      const node = this.#node(current.id);
      if (node.isErr())
        return node;
      if (node.value)
        nodes.push(node.value);
      if (current.depth >= maxDepth)
        continue;
      const edges = this.neighbors(current.id);
      if (edges.isErr())
        return edges;
      for (const edge of edges.value) {
        if (!this.#matches(edge, options.edgeTypes))
          continue;
        const next = edge.source === current.id ? edge.target : edge.source;
        if (!visited.has(next)) {
          visited.add(next);
          queue.push({ id: next, depth: current.depth + 1 });
        }
      }
    }
    return this.#subgraphForVisited(visited, nodes, options.edgeTypes);
  }
  shortestPath(fromId, toId, maxDepth = 20) {
    if (fromId === toId)
      return ok([fromId]);
    const visited = new Set([fromId]);
    const parent = new Map;
    const queue = [{ id: fromId, depth: 0 }];
    for (let head = 0;head < queue.length; head++) {
      const current = queue[head];
      if (current.depth >= maxDepth)
        continue;
      const edges = this.neighbors(current.id);
      if (edges.isErr())
        return edges;
      for (const edge of edges.value) {
        const next = edge.source === current.id ? edge.target : edge.source;
        if (visited.has(next))
          continue;
        visited.add(next);
        parent.set(next, current.id);
        if (next === toId) {
          const path3 = [toId];
          for (let id = toId;id !== fromId; ) {
            id = parent.get(id);
            path3.unshift(id);
          }
          return ok(path3);
        }
        queue.push({ id: next, depth: current.depth + 1 });
      }
    }
    return ok([]);
  }
  neighbors(nodeId) {
    return this.#db.all("SELECT * FROM edges WHERE source = ? OR target = ?", [nodeId, nodeId]);
  }
  subgraph(repoHash) {
    const nodes = this.#nodes(repoHash);
    if (nodes.isErr())
      return nodes;
    const edges = this.#db.all("SELECT e.* FROM edges e JOIN nodes n ON n.id = e.source WHERE n.repo_hash = ?", [repoHash]);
    return edges.isErr() ? edges : ok({ nodes: nodes.value, edges: edges.value });
  }
  dependencyTree(nodeId, direction, maxDepth = 2, budget = 200) {
    const visited = new Set([nodeId]);
    let remaining = Math.max(0, budget);
    const build = (id, depth) => {
      if (depth >= maxDepth || remaining <= 0)
        return ok([]);
      const edges = this.#db.all(direction === "out" ? "SELECT * FROM edges WHERE source = ? AND type != 'contains'" : "SELECT * FROM edges WHERE target = ? AND type != 'contains'", [id]);
      if (edges.isErr())
        return edges;
      const children = [];
      for (const edge of edges.value) {
        const next = direction === "out" ? edge.target : edge.source;
        if (visited.has(next) || remaining <= 0)
          continue;
        visited.add(next);
        const node = this.#node(next);
        if (node.isErr())
          return node;
        if (!node.value)
          continue;
        remaining--;
        const nested = build(next, depth + 1);
        if (nested.isErr())
          return nested;
        let metadata = {};
        try {
          metadata = JSON.parse(edge.metadata_json ?? "{}");
        } catch {}
        children.push({
          id: next,
          edgeType: edge.type,
          node: node.value,
          children: nested.value,
          callSites: metadata.call_sites,
          subKind: metadata.sub_kind
        });
      }
      return ok(children);
    };
    const tree = build(nodeId, 0);
    return tree.isErr() ? tree : ok({ tree: tree.value, truncated: remaining <= 0 });
  }
  #node(id) {
    const result = this.#db.get("SELECT * FROM nodes WHERE id = ?", [
      id
    ]);
    return result.isErr() ? result : ok(result.value ? this.#mapNode(result.value) : null);
  }
  #nodes(repoHash) {
    const result = this.#db.all("SELECT * FROM nodes WHERE repo_hash = ?", [repoHash]);
    return result.isErr() ? result : ok(result.value.map((row) => this.#mapNode(row)));
  }
  #mapNode(row) {
    const parsed = safeCall(() => JSON.parse(row.metadata_json), () => ({ kind: -1 }));
    return { ...row, metadata: parsed.isOk() ? parsed.value : {} };
  }
  #matches(edge, types3) {
    if (!types3?.length)
      return true;
    const aliases = {
      import: ["import", "imports"],
      export: ["export", "exports"],
      calls: ["call", "calls"],
      constructor: ["constructor", "constructors"],
      extends: ["extend", "extends"],
      implements: ["implement", "implements"]
    };
    return types3.some((type) => (aliases[edge.type] ?? [edge.type]).includes(type.toLowerCase()));
  }
  #subgraphForVisited(visited, nodes, types3) {
    const edges = [];
    const known = new Set;
    for (const id of visited) {
      const result = this.neighbors(id);
      if (result.isErr())
        return result;
      for (const edge of result.value) {
        const key = `${edge.source}|${edge.target}|${edge.type}`;
        if (visited.has(edge.source) && visited.has(edge.target) && this.#matches(edge, types3) && !known.has(key)) {
          known.add(key);
          edges.push(edge);
        }
      }
    }
    return ok({ nodes, edges });
  }
}
var init_graph = __esm(() => {
  init_esm();
  init_db();
});

// packages/core/dist/search/index.js
class SearchService {
  #db;
  constructor(database) {
    this.#db = database;
  }
  ensureIndex() {
    const columns = this.#db.all("PRAGMA table_info(node_search)");
    if (columns.isErr())
      return columns;
    if (columns.value.length && !columns.value.some((column) => column.name === "source")) {
      const dropped = this.#db.run("DROP TABLE node_search");
      if (dropped.isErr())
        return dropped;
    }
    const result = this.#db.run("CREATE VIRTUAL TABLE IF NOT EXISTS node_search USING fts5(node_id UNINDEXED, name, kind UNINDEXED, file_path, domain, summary, doc, source, tokenize='porter unicode61')");
    return result.isErr() ? result : ok(undefined);
  }
  populate(repoHash) {
    const ready = this.ensureIndex();
    if (ready.isErr())
      return ready;
    const cleared = this.#db.run("DELETE FROM node_search WHERE node_id IN (SELECT id FROM nodes WHERE repo_hash = ?)", [repoHash]);
    if (cleared.isErr())
      return cleared;
    const inserted = this.#db.run("INSERT INTO node_search (node_id, name, kind, file_path, domain, summary, doc, source) SELECT id, name, kind, file_path, COALESCE(json_extract(metadata_json, '$.domain'), ''), COALESCE(json_extract(metadata_json, '$.summary'), ''), COALESCE(json_extract(metadata_json, '$.doc'), ''), COALESCE(json_extract(metadata_json, '$.source_code'), '') FROM nodes WHERE repo_hash = ?", [repoHash]);
    return inserted.isErr() ? inserted : ok(undefined);
  }
  search(repoHash, query) {
    const clean = query.trim().replace(/["']/g, "").replace(/\s+/g, " ");
    if (!clean)
      return ok([]);
    const stopWords = new Set([
      "a",
      "an",
      "and",
      "are",
      "does",
      "for",
      "from",
      "how",
      "in",
      "is",
      "me",
      "of",
      "show",
      "the",
      "to",
      "what",
      "where",
      "which",
      "who"
    ]);
    const terms = (clean.match(/[\p{L}\p{N}_$.-]+/gu) ?? []).map((term) => term.replace(/[.-]+/g, " ").trim()).flatMap((term) => term.split(/\s+/)).filter((term) => term.length > 1 && !stopWords.has(term.toLowerCase()));
    const ftsQuery = (terms.length ? terms : [clean]).map((term) => `"${term.replaceAll('"', '""')}"*`).join(" OR ");
    const fts = this.#db.all("SELECT node_id, name, kind, file_path, domain, rank FROM node_search WHERE node_search MATCH ? AND node_id IN (SELECT id FROM nodes WHERE repo_hash = ?) ORDER BY rank LIMIT 50", [ftsQuery, repoHash]);
    if (fts.isOk())
      return ok(fts.value.map((row) => ({
        id: row.node_id,
        label: row.name,
        kind: row.kind,
        filePath: row.file_path,
        domain: row.domain ?? "",
        rank: row.rank ?? 0
      })));
    const fallback = this.#db.all("SELECT id, name, kind, file_path, metadata_json FROM nodes WHERE repo_hash = ? AND (name LIKE ? OR file_path LIKE ? OR metadata_json LIKE ?) LIMIT 50", [repoHash, `%${clean}%`, `%${clean}%`, `%${clean}%`]);
    if (fallback.isErr())
      return fallback;
    return ok(fallback.value.map((row) => ({
      id: row.id,
      label: row.name,
      kind: row.kind,
      filePath: row.file_path,
      domain: this.#domain(row.metadata_json),
      rank: 0
    })));
  }
  clear() {
    const result = this.#db.run("DROP TABLE IF EXISTS node_search");
    return result.isErr() ? result : ok(undefined);
  }
  #domain(raw) {
    const parsed = safeCall(() => JSON.parse(raw), () => ({ kind: -1 }));
    return parsed.isOk() && typeof parsed.value.domain === "string" ? parsed.value.domain : "";
  }
}
var init_search = __esm(() => {
  init_esm();
  init_db();
});

// packages/core/dist/analysis/louvain.js
function computeLouvain(nodeIds, adjacency, _totalWeight, resolution = 1) {
  const originals = [...new Set(nodeIds)].sort((a, b) => a.localeCompare(b));
  if (!originals.length)
    return new Map;
  const originalGraph = normalizeGraph(originals, adjacency);
  let graph = originalGraph;
  let members = new Map(originals.map((id) => [id, [id]]));
  let finalGroups = originals.map((id) => [id]);
  for (let level = 0;level < 12; level += 1) {
    const assignment = localMove(graph, resolution);
    const grouped = groupMembers(assignment, members);
    finalGroups = [...grouped.values()];
    if (grouped.size === graph.size)
      break;
    const aggregated = aggregateGraph(graph, assignment, grouped);
    graph = aggregated.graph;
    members = aggregated.members;
  }
  return stableConnectedAssignments(originals, originalGraph, finalGroups);
}
function normalizeGraph(nodeIds, adjacency) {
  const allowed = new Set(nodeIds);
  const graph = new Map(nodeIds.map((id) => [id, new Map]));
  for (const source of nodeIds) {
    for (const edge of adjacency.get(source) ?? []) {
      if (!allowed.has(edge.target) || !Number.isFinite(edge.weight))
        continue;
      const weight = Math.max(0, edge.weight);
      if (!weight)
        continue;
      const neighbors = graph.get(source);
      neighbors.set(edge.target, (neighbors.get(edge.target) ?? 0) + weight);
    }
  }
  return graph;
}
function localMove(graph, resolution) {
  const nodes = [...graph.keys()].sort((a, b) => a.localeCompare(b));
  const community = new Map(nodes.map((id, index) => [id, index]));
  const degrees = new Map(nodes.map((id) => [
    id,
    [...(graph.get(id) ?? new Map).values()].reduce((sum, weight) => sum + weight, 0)
  ]));
  const totalDegree = Math.max(1, [...degrees.values()].reduce((sum, degree) => sum + degree, 0));
  const communityDegree = new Map(nodes.map((id, index) => [index, degrees.get(id) ?? 0]));
  for (let iteration = 0;iteration < 50; iteration += 1) {
    let moves = 0;
    for (const node of nodes) {
      const current = community.get(node);
      const degree = degrees.get(node) ?? 0;
      communityDegree.set(current, (communityDegree.get(current) ?? 0) - degree);
      const weights = new Map;
      for (const [target, weight] of graph.get(node) ?? []) {
        const candidate = community.get(target);
        if (candidate === undefined)
          continue;
        weights.set(candidate, (weights.get(candidate) ?? 0) + weight);
      }
      let best = current;
      let bestGain = 0;
      const candidates = [...weights.keys()].sort((a, b) => a - b);
      for (const candidate of candidates) {
        const gain = (weights.get(candidate) ?? 0) - resolution * degree * (communityDegree.get(candidate) ?? 0) / totalDegree;
        if (gain > bestGain + 0.0000000001 || Math.abs(gain - bestGain) <= 0.0000000001 && gain > 0.0000000001 && candidate < best) {
          best = candidate;
          bestGain = gain;
        }
      }
      community.set(node, best);
      communityDegree.set(best, (communityDegree.get(best) ?? 0) + degree);
      if (best !== current)
        moves += 1;
    }
    if (!moves)
      break;
  }
  return community;
}
function groupMembers(assignment, members) {
  const grouped = new Map;
  for (const node of [...assignment.keys()].sort((a, b) => a.localeCompare(b))) {
    const id = assignment.get(node);
    const group = grouped.get(id) ?? [];
    group.push(...members.get(node) ?? [node]);
    grouped.set(id, group);
  }
  for (const group of grouped.values())
    group.sort((a, b) => a.localeCompare(b));
  return grouped;
}
function aggregateGraph(graph, assignment, grouped) {
  const communityIds = [...grouped.keys()].sort((a, b) => a - b);
  const key = new Map(communityIds.map((id, index) => [id, `level:${index}`]));
  const next = new Map(communityIds.map((id) => [key.get(id), new Map]));
  for (const [source, neighbors] of graph) {
    const sourceKey = key.get(assignment.get(source));
    if (!sourceKey)
      continue;
    for (const [target, weight] of neighbors) {
      const targetKey = key.get(assignment.get(target));
      if (!targetKey)
        continue;
      const nextNeighbors = next.get(sourceKey);
      nextNeighbors.set(targetKey, (nextNeighbors.get(targetKey) ?? 0) + weight);
    }
  }
  return {
    graph: next,
    members: new Map(communityIds.map((id) => [key.get(id), grouped.get(id)]))
  };
}
function stableConnectedAssignments(nodeIds, graph, groups) {
  const components = [];
  for (const group of groups) {
    const allowed = new Set(group);
    const unseen = new Set(group);
    while (unseen.size) {
      const first = [...unseen].sort((a, b) => a.localeCompare(b))[0];
      unseen.delete(first);
      const component = [first];
      const queue = [first];
      for (let head = 0;head < queue.length; head += 1) {
        for (const target of graph.get(queue[head])?.keys() ?? []) {
          if (!allowed.has(target) || !unseen.has(target))
            continue;
          unseen.delete(target);
          component.push(target);
          queue.push(target);
        }
      }
      component.sort((a, b) => a.localeCompare(b));
      components.push(component);
    }
  }
  components.sort((a, b) => a[0].localeCompare(b[0]));
  const result = new Map;
  components.forEach((component, id) => {
    for (const node of component)
      result.set(node, id);
  });
  for (const node of nodeIds)
    if (!result.has(node))
      result.set(node, result.size);
  return result;
}

// packages/core/dist/analysis/index.js
class AnalysisService {
  #db;
  constructor(database) {
    this.#db = database;
  }
  centrality() {
    const out = this.#db.all("SELECT source AS id, COUNT(*) AS count FROM edges GROUP BY source");
    if (out.isErr())
      return out;
    const incoming = this.#db.all("SELECT target AS id, COUNT(*) AS count FROM edges GROUP BY target");
    if (incoming.isErr())
      return incoming;
    const values = new Map;
    for (const row of out.value)
      values.set(row.id, {
        nodeId: row.id,
        degree: Number(row.count),
        inDegree: 0,
        outDegree: Number(row.count)
      });
    for (const row of incoming.value) {
      const prior = values.get(row.id) ?? {
        nodeId: row.id,
        degree: 0,
        inDegree: 0,
        outDegree: 0
      };
      values.set(row.id, {
        ...prior,
        inDegree: Number(row.count),
        degree: prior.degree + Number(row.count)
      });
    }
    return ok(values);
  }
  detectHierarchy() {
    const values = this.centrality();
    if (values.isErr())
      return values;
    const degrees = [...values.value.values()].map((item) => item.degree).filter(Boolean).sort((a, b) => a - b);
    if (!degrees.length)
      return ok(undefined);
    const at = (p) => degrees[Math.max(0, Math.ceil(p / 100 * degrees.length) - 1)];
    const levels = { god: at(95), high: at(80), mid: at(50) };
    const begun = this.#db.run("BEGIN IMMEDIATE");
    if (begun.isErr())
      return begun;
    for (const [id, value] of values.value) {
      const level = value.degree > levels.god ? "god" : value.degree > levels.high ? "high" : value.degree > levels.mid ? "mid" : "low";
      const result = this.#db.run("UPDATE nodes SET hierarchy_level = ? WHERE id = ?", [level, id]);
      if (result.isErr()) {
        this.#db.run("ROLLBACK");
        return result;
      }
    }
    const committed = this.#db.run("COMMIT");
    return committed.isErr() ? committed : ok(undefined);
  }
  godNodes(repoHash) {
    const result = this.#db.all(repoHash ? "SELECT id FROM nodes WHERE repo_hash = ? AND hierarchy_level = 'god'" : "SELECT id FROM nodes WHERE hierarchy_level = 'god'", repoHash ? [repoHash] : []);
    return result.isErr() ? result : ok(result.value.map((row) => row.id));
  }
  detectDomains(repoHash, configuredDomains) {
    const rows = this.#db.all("SELECT id, file_path FROM nodes WHERE repo_hash = ?", [repoHash]);
    if (rows.isErr())
      return rows;
    const repo = this.#db.get("SELECT url FROM repos WHERE repo_hash = ?", [repoHash]);
    if (repo.isErr())
      return repo;
    const root = repo.value?.url?.replace(/[\\/]$/, "") ?? "";
    const groups = new Map;
    const begun = this.#db.run("BEGIN IMMEDIATE");
    if (begun.isErr())
      return begun;
    for (const row of rows.value) {
      const relativePath = root && row.file_path.startsWith(root) ? row.file_path.slice(root.length).replace(/^[\\/]+/, "") : row.file_path;
      const name = this.#domain(relativePath, configuredDomains);
      const patterns = configuredDomains?.[name] ?? [
        `${name.toLowerCase()}/**`
      ];
      const group = groups.get(name) ?? { name, patterns, nodeIds: [] };
      group.nodeIds.push(row.id);
      groups.set(name, group);
      const updated = this.#db.run("UPDATE nodes SET metadata_json=json_set(COALESCE(metadata_json,'{}'),'$.domain',?) WHERE id=?", [name, row.id]);
      if (updated.isErr()) {
        this.#db.run("ROLLBACK");
        return updated;
      }
    }
    const committed = this.#db.run("COMMIT");
    if (committed.isErr())
      return committed;
    return ok([...groups.values()].sort((a, b) => a.name.localeCompare(b.name)));
  }
  detectCommunities(repoHash) {
    const repo = this.#db.get("SELECT url FROM repos WHERE repo_hash=?", [repoHash]);
    if (repo.isErr())
      return repo;
    const root = repo.value?.url?.replace(/[\\/]$/, "") ?? "";
    const nodes = this.#db.all("SELECT id,file_path FROM nodes WHERE repo_hash=? ORDER BY file_path,id", [repoHash]);
    if (nodes.isErr())
      return nodes;
    const edgeRows = this.#db.all(`SELECT e.source,e.target,e.type,e.weight,s.file_path AS source_file,t.file_path AS target_file
       FROM edges e JOIN nodes s ON s.id=e.source JOIN nodes t ON t.id=e.target
       WHERE s.repo_hash=? AND t.repo_hash=? AND e.type!='contains'
       ORDER BY s.file_path,t.file_path,e.type,e.source,e.target`, [repoHash, repoHash]);
    if (edgeRows.isErr())
      return edgeRows;
    const filePaths = [
      ...new Set(nodes.value.map((node) => node.file_path))
    ].sort((a, b) => a.localeCompare(b));
    const adjacency = new Map;
    const pairs = new Map;
    const addPair = (source, target, weight) => {
      if (source === target || !weight)
        return;
      const [left, right] = source.localeCompare(target) < 0 ? [source, target] : [target, source];
      const key = `${left}\x00${right}`;
      pairs.set(key, (pairs.get(key) ?? 0) + weight);
    };
    for (const edge of edgeRows.value) {
      if (edge.source_file === edge.target_file)
        continue;
      const semanticWeight = this.#communityEdgeWeight(edge.type);
      const frequency = 1 + Math.log2(Math.max(1, Number(edge.weight)));
      addPair(edge.source_file, edge.target_file, semanticWeight * frequency);
    }
    const areas = new Map;
    for (const filePath of filePaths) {
      const area = this.#architectureArea(filePath, root);
      const files = areas.get(area) ?? [];
      files.push(filePath);
      areas.set(area, files);
    }
    for (const files of areas.values())
      for (let index = 1;index < files.length; index += 1)
        addPair(files[index - 1], files[index], 0.35);
    for (const [key, weight] of pairs) {
      const [source, target] = key.split("\x00");
      adjacency.set(source, [
        ...adjacency.get(source) ?? [],
        { target, weight }
      ]);
      adjacency.set(target, [
        ...adjacency.get(target) ?? [],
        { target: source, weight }
      ]);
    }
    const assignments = computeLouvain(filePaths, adjacency);
    const begun = this.#db.run("BEGIN IMMEDIATE");
    if (begun.isErr())
      return begun;
    const cleared = this.#db.run("UPDATE nodes SET metadata_json=json_remove(COALESCE(metadata_json,'{}'),'$.community_id','$.community_area') WHERE repo_hash=?", [repoHash]);
    if (cleared.isErr()) {
      this.#db.run("ROLLBACK");
      return cleared;
    }
    for (const node of nodes.value) {
      const communityId = assignments.get(node.file_path);
      if (communityId === undefined)
        continue;
      const updated = this.#db.run("UPDATE nodes SET metadata_json=json_set(COALESCE(metadata_json,'{}'),'$.community_id',?,'$.community_area',?) WHERE id=?", [communityId, this.#architectureArea(node.file_path, root), node.id]);
      if (updated.isErr()) {
        this.#db.run("ROLLBACK");
        return updated;
      }
    }
    const committed = this.#db.run("COMMIT");
    if (committed.isErr())
      return committed;
    return this.communities(repoHash);
  }
  communities(repoHash, limit = 20) {
    const members = this.#db.all("SELECT id,name,hierarchy_level,json_extract(metadata_json,'$.community_id') AS cid FROM nodes WHERE repo_hash=? AND json_extract(metadata_json,'$.community_id') IS NOT NULL", [repoHash]);
    if (members.isErr())
      return members;
    const edges = this.#db.all("SELECT e.source,e.target FROM edges e JOIN nodes s ON s.id=e.source JOIN nodes t ON t.id=e.target WHERE s.repo_hash=? AND t.repo_hash=? AND e.type!='contains'", [repoHash, repoHash]);
    if (edges.isErr())
      return edges;
    const nodeCommunity = new Map(members.value.map((node) => [node.id, Number(node.cid)]));
    const grouped = new Map;
    for (const node of members.value) {
      const list = grouped.get(Number(node.cid)) ?? [];
      list.push(node);
      grouped.set(Number(node.cid), list);
    }
    const touching = new Map;
    const internal = new Map;
    for (const edge of edges.value) {
      const source = nodeCommunity.get(edge.source);
      const target = nodeCommunity.get(edge.target);
      if (source !== undefined)
        touching.set(source, (touching.get(source) ?? 0) + 1);
      if (target !== undefined && target !== source)
        touching.set(target, (touching.get(target) ?? 0) + 1);
      if (source !== undefined && source === target)
        internal.set(source, (internal.get(source) ?? 0) + 1);
    }
    const rank = { god: 0, high: 1, mid: 2, low: 3 };
    const result = [...grouped].map(([id, nodes]) => ({
      id,
      nodeCount: nodes.length,
      cohesion: touching.get(id) ?? 0 ? (internal.get(id) ?? 0) / touching.get(id) : 0,
      topNodes: [...nodes].sort((a, b) => (rank[a.hierarchy_level] ?? 3) - (rank[b.hierarchy_level] ?? 3)).slice(0, 5).map((node) => node.id)
    })).sort((a, b) => b.nodeCount - a.nodeCount).slice(0, limit);
    return ok(result);
  }
  communityMembers(repoHash, communityId, limit = 100) {
    const result = this.#db.all("SELECT id,name,kind,file_path,hierarchy_level FROM nodes WHERE repo_hash=? AND json_extract(metadata_json,'$.community_id')=? LIMIT ?", [repoHash, communityId, Math.max(1, limit)]);
    return result.isErr() ? result : ok(result.value.map((node) => ({
      id: node.id,
      name: node.name,
      kind: node.kind,
      filePath: node.file_path,
      hierarchyLevel: node.hierarchy_level
    })));
  }
  crossCommunityEdges(repoHash, communityA, communityB, limit = 50) {
    const result = this.#db.all(`SELECT e.source,e.target,e.type,s.name AS source_name,t.name AS target_name FROM edges e
       JOIN nodes s ON s.id=e.source JOIN nodes t ON t.id=e.target
       WHERE s.repo_hash=? AND t.repo_hash=? AND e.type!='contains' AND
       ((json_extract(s.metadata_json,'$.community_id')=? AND json_extract(t.metadata_json,'$.community_id')=?) OR
        (json_extract(s.metadata_json,'$.community_id')=? AND json_extract(t.metadata_json,'$.community_id')=?)) LIMIT ?`, [
      repoHash,
      repoHash,
      communityA,
      communityB,
      communityB,
      communityA,
      Math.max(1, limit)
    ]);
    return result.isErr() ? result : ok(result.value.map((edge) => ({
      source: edge.source,
      target: edge.target,
      type: edge.type,
      sourceName: edge.source_name,
      targetName: edge.target_name
    })));
  }
  #domain(filePath, configured) {
    if (configured) {
      for (const [name, patterns] of Object.entries(configured))
        if (patterns.some((pattern) => this.#matches(filePath, pattern)))
          return name;
    }
    const first = filePath.replace(/^\/+/, "").split("/")[0] || "misc";
    return first.charAt(0).toUpperCase() + first.slice(1);
  }
  #matches(path3, pattern) {
    return new RegExp(`^${pattern.replace(/[.+^${}()|[\]\\]/g, "\\$&").replace(/\*\*/g, ".*").replace(/\*/g, "[^/]*")}$`).test(path3);
  }
  #architectureArea(filePath, root = "") {
    const normalized = filePath.replaceAll("\\", "/");
    const normalizedRoot = root.replaceAll("\\", "/");
    const clean = (normalizedRoot && normalized.startsWith(`${normalizedRoot}/`) ? normalized.slice(normalizedRoot.length + 1) : normalized).replace(/^\/+/, "");
    const marker = clean.lastIndexOf("/packages/");
    const relative2 = marker >= 0 ? clean.slice(marker + 1) : clean;
    const parts = relative2.split("/").filter(Boolean);
    if (parts[0] === "packages") {
      if (parts[1] === "extensions" && parts[2])
        return parts.slice(0, 3).join("/");
      return parts.slice(0, 2).join("/");
    }
    if (["apps", "src", "lib"].includes(parts[0] ?? "") && parts[1])
      return parts.slice(0, 2).join("/");
    return parts.length > 1 ? parts[0] ?? "root" : "root";
  }
  #communityEdgeWeight(type) {
    const weights = {
      extends: 9,
      implements: 8,
      import: 6,
      fires_hook: 5,
      listens_hook: 5,
      dispatches: 5,
      calls: 3,
      constructor: 3,
      return_type: 2,
      return: 2,
      type: 2,
      export: 1.5
    };
    return weights[type] ?? 1;
  }
}
var init_analysis = __esm(() => {
  init_esm();
  init_db();
});

// packages/core/dist/indexer/type.js
var IndexerErrorKind;
var init_type = __esm(() => {
  (function(IndexerErrorKind2) {
    IndexerErrorKind2[IndexerErrorKind2["DatabaseFailed"] = 0] = "DatabaseFailed";
    IndexerErrorKind2[IndexerErrorKind2["ParserFailed"] = 1] = "ParserFailed";
    IndexerErrorKind2[IndexerErrorKind2["Aborted"] = 2] = "Aborted";
  })(IndexerErrorKind || (IndexerErrorKind = {}));
});

// packages/core/dist/indexer/error.js
function toIndexerError(kind, details) {
  return { kind, ...details };
}
var init_error8 = __esm(() => {
  init_esm();
});

// packages/core/dist/indexer/index.js
import { createHash } from "node:crypto";
import { readFile as readFile2, stat } from "node:fs/promises";
import { basename as basename3 } from "node:path";
import { spawnSync } from "node:child_process";

class ProjectIndexer {
  #repository;
  #parser;
  #sourceCache = new Map;
  constructor(repository, parser) {
    this.#repository = repository;
    this.#parser = parser;
  }
  async index(options) {
    const initialized = this.#repository.initRepo(options.repoHash, options.url ?? options.projectDir, options.name ?? basename3(options.projectDir));
    if (initialized.isErr())
      return err(toIndexerError(IndexerErrorKind.DatabaseFailed, {
        cause: initialized.error
      }));
    const parser = await this.#loadParser();
    if (parser.isErr())
      return parser;
    const db = this.#repository.database;
    const manifestResult = db.all("SELECT file_path, content_hash, mtime FROM file_manifest WHERE repo_hash = ?", [options.repoHash]);
    if (manifestResult.isErr())
      return err(toIndexerError(IndexerErrorKind.DatabaseFailed, {
        cause: manifestResult.error
      }));
    const prior = new Map(manifestResult.value.map((row) => [row.file_path, row]));
    const snapshotResult = db.get("SELECT schema_version, commit_hash FROM repos WHERE repo_hash = ?", [options.repoHash]);
    if (snapshotResult.isErr())
      return err(toIndexerError(IndexerErrorKind.DatabaseFailed, {
        cause: snapshotResult.error
      }));
    const schemaVersion = options.schemaVersion ?? INDEX_SCHEMA_VERSION;
    const hashes = new Map;
    options.onProgress?.({
      stage: "hashing",
      message: `Hashing ${options.files.length} source files...`,
      completed: 0,
      total: options.files.length
    });
    const hashBatchSize = 64;
    for (let offset = 0;offset < options.files.length; offset += hashBatchSize) {
      const files = options.files.slice(offset, offset + hashBatchSize);
      const batch2 = await Promise.all(files.map(async (filePath) => ({
        filePath,
        result: await this.#hashFile(filePath)
      })));
      for (const hashed of batch2) {
        if (hashed.result.isErr())
          return hashed.result;
        hashes.set(hashed.filePath, hashed.result.value);
      }
    }
    const deleted = [...prior.keys()].filter((file) => !hashes.has(file));
    const changed = options.files.filter((file) => prior.get(file)?.content_hash !== hashes.get(file)?.hash);
    for (const file of deleted)
      this.#sourceCache.delete(file);
    const fullRebuild = Boolean(options.fullRebuild || !prior.size || snapshotResult.value?.schema_version !== schemaVersion);
    const filesToParse = fullRebuild ? [...options.files] : [...new Set([...changed])];
    const cached = new Map;
    if (!fullRebuild) {
      const cacheResult = db.all("SELECT file_path, content_hash, data FROM parse_cache WHERE repo_hash = ?", [options.repoHash]);
      if (cacheResult.isErr())
        return err(toIndexerError(IndexerErrorKind.DatabaseFailed, {
          cause: cacheResult.error
        }));
      for (const row of cacheResult.value) {
        if (hashes.get(row.file_path)?.hash !== row.content_hash || changed.includes(row.file_path))
          continue;
        try {
          cached.set(row.file_path, JSON.parse(row.data));
        } catch {
          filesToParse.push(row.file_path);
        }
      }
      for (const file of options.files)
        if (!cached.has(file) && !filesToParse.includes(file))
          filesToParse.push(file);
    }
    const parsedFiles = new Set(filesToParse);
    for (const file of this.#sourceCache.keys())
      if (!parsedFiles.has(file))
        this.#sourceCache.delete(file);
    if (options.signal?.aborted)
      return err(toIndexerError(IndexerErrorKind.Aborted, {}));
    options.onProgress?.({
      stage: "parsing",
      message: `Parsing ${filesToParse.length} file(s); reusing ${cached.size} cached result(s)...`,
      completed: 0,
      total: filesToParse.length
    });
    const batch = await parser.value.parseFiles(filesToParse, {
      projectRoot: options.projectDir,
      signal: options.signal,
      continueOnError: true
    });
    if (batch.isErr())
      return err(toIndexerError(IndexerErrorKind.ParserFailed, {
        filePath: "<batch>",
        cause: batch.error
      }));
    const parsed = new Map(cached);
    for (const [file, result] of batch.value.results)
      parsed.set(file, result);
    for (const file of deleted)
      parsed.delete(file);
    options.onProgress?.({
      stage: "writing",
      message: "Preparing graph storage..."
    });
    let writingStepStarted = Date.now();
    const began = db.run("BEGIN IMMEDIATE");
    if (began.isErr())
      return err(toIndexerError(IndexerErrorKind.DatabaseFailed, {
        cause: began.error
      }));
    const rollback = (result) => {
      db.run("ROLLBACK");
      return result;
    };
    const databaseFailure = (cause) => rollback(err(toIndexerError(IndexerErrorKind.DatabaseFailed, {
      cause
    })));
    options.onProgress?.({
      stage: "writing",
      message: `Prepared graph storage in ${this.#secondsSince(writingStepStarted)}; removing stale graph data...`
    });
    writingStepStarted = Date.now();
    const clear = this.#clearChanged(options.repoHash, fullRebuild ? options.files.concat(deleted) : changed.concat(deleted), fullRebuild);
    if (clear.isErr())
      return rollback(clear);
    const declarationCount = filesToParse.reduce((count, file) => count + (parsed.get(file)?.declarations.length ?? 0), 0);
    options.onProgress?.({
      stage: "writing",
      message: `Removed stale graph data in ${this.#secondsSince(writingStepStarted)}; processing ${declarationCount} declarations...`,
      completed: 0,
      total: declarationCount
    });
    writingStepStarted = Date.now();
    const declarationNodes = [];
    for (const file of filesToParse) {
      const result = parsed.get(file);
      if (!result)
        continue;
      for (const declaration of result.declarations)
        declarationNodes.push(this.#node(options.repoHash, declaration, options.sourceInlineMaxLines ?? 40));
    }
    this.#sourceCache.clear();
    options.onProgress?.({
      stage: "writing",
      message: `Processed ${declarationNodes.length} declarations in ${this.#secondsSince(writingStepStarted)}; saving graph...`,
      completed: 0,
      total: declarationNodes.length
    });
    writingStepStarted = Date.now();
    const declarationsSaved = this.#repository.createNodes(declarationNodes);
    if (declarationsSaved.isErr())
      return databaseFailure(declarationsSaved.error);
    for (const node of declarationNodes)
      node.metadata = {};
    let nodesForLinking = declarationNodes;
    if (!fullRebuild) {
      options.onProgress?.({
        stage: "writing",
        message: `Saved graph in ${this.#secondsSince(writingStepStarted)}; loading existing graph...`
      });
      writingStepStarted = Date.now();
      const eventWiki = db.run("DELETE FROM wiki_pages WHERE path IN (SELECT id FROM nodes WHERE repo_hash = ? AND kind = 'event')", [options.repoHash]);
      if (eventWiki.isErr())
        return databaseFailure(eventWiki.error);
      const eventEdges = db.run("DELETE FROM edges WHERE source IN (SELECT id FROM nodes WHERE repo_hash = ? AND kind = 'event') OR target IN (SELECT id FROM nodes WHERE repo_hash = ? AND kind = 'event')", [options.repoHash, options.repoHash]);
      if (eventEdges.isErr())
        return databaseFailure(eventEdges.error);
      const oldEvents = db.run("DELETE FROM nodes WHERE repo_hash = ? AND kind = 'event'", [options.repoHash]);
      if (oldEvents.isErr())
        return databaseFailure(oldEvents.error);
      const nodesResult = this.#repository.getNodes(options.repoHash);
      if (nodesResult.isErr())
        return databaseFailure(nodesResult.error);
      nodesForLinking = nodesResult.value;
      const relationClear = db.run("DELETE FROM edges WHERE type != 'contains' AND source IN (SELECT id FROM nodes WHERE repo_hash = ?)", [options.repoHash]);
      if (relationClear.isErr())
        return databaseFailure(relationClear.error);
    }
    options.onProgress?.({
      stage: "linking",
      message: `Prepared graph in ${this.#secondsSince(writingStepStarted)}; connecting calls, imports, events, and dependencies...`
    });
    const linked = this.#link(options, parsed, nodesForLinking);
    if (linked.isErr())
      return rollback(linked);
    const virtualNodesSaved = this.#repository.createNodes(linked.value.nodes);
    if (virtualNodesSaved.isErr())
      return databaseFailure(virtualNodesSaved.error);
    const edgesSaved = this.#repository.createEdges(linked.value.edges);
    if (edgesSaved.isErr())
      return databaseFailure(edgesSaved.error);
    const persisted = this.#persistState(options, parsed, hashes, deleted, filesToParse);
    if (persisted.isErr())
      return rollback(persisted);
    const counts = db.get("SELECT (SELECT COUNT(*) FROM nodes WHERE repo_hash = ?) AS nodes, (SELECT COUNT(*) FROM file_manifest WHERE repo_hash = ?) AS files", [options.repoHash, options.repoHash]);
    if (counts.isErr())
      return databaseFailure(counts.error);
    const commitHash = options.commitHash ?? this.#gitCommit(options.projectDir);
    const snapshot = this.#repository.updateSnapshot(options.repoHash, {
      commitHash: commitHash ?? undefined,
      nodeCount: counts.value?.nodes ?? 0,
      fileCount: counts.value?.files ?? options.files.length,
      schemaVersion
    });
    if (snapshot.isErr())
      return databaseFailure(snapshot.error);
    const committed = db.run("COMMIT");
    if (committed.isErr())
      return databaseFailure(committed.error);
    return ok({
      indexedFiles: filesToParse.length,
      indexedNodes: declarationNodes.length + linked.value.nodes.length,
      indexedEdges: linked.value.edges.length,
      diagnostics: batch.value.diagnostics,
      changedFiles: changed.length,
      deletedFiles: deleted.length,
      cachedFiles: cached.size,
      fullRebuild
    });
  }
  #clearChanged(repoHash, files, full) {
    const db = this.#repository.database;
    if (full) {
      const wiki = db.run("DELETE FROM wiki_pages WHERE path IN (SELECT id FROM nodes WHERE repo_hash = ?)", [repoHash]);
      if (wiki.isErr())
        return err(toIndexerError(IndexerErrorKind.DatabaseFailed, {
          cause: wiki.error
        }));
      const edges = db.run("DELETE FROM edges WHERE source IN (SELECT id FROM nodes WHERE repo_hash = ?) OR target IN (SELECT id FROM nodes WHERE repo_hash = ?)", [repoHash, repoHash]);
      if (edges.isErr())
        return err(toIndexerError(IndexerErrorKind.DatabaseFailed, {
          cause: edges.error
        }));
      const nodes = db.run("DELETE FROM nodes WHERE repo_hash = ?", [repoHash]);
      return nodes.isErr() ? err(toIndexerError(IndexerErrorKind.DatabaseFailed, {
        cause: nodes.error
      })) : ok(undefined);
    }
    for (const file of files) {
      const wiki = db.run("DELETE FROM wiki_pages WHERE path IN (SELECT id FROM nodes WHERE repo_hash = ? AND file_path = ?)", [repoHash, file]);
      if (wiki.isErr())
        return err(toIndexerError(IndexerErrorKind.DatabaseFailed, {
          cause: wiki.error
        }));
      const edges = db.run("DELETE FROM edges WHERE source IN (SELECT id FROM nodes WHERE repo_hash = ? AND file_path = ?) OR target IN (SELECT id FROM nodes WHERE repo_hash = ? AND file_path = ?)", [repoHash, file, repoHash, file]);
      if (edges.isErr())
        return err(toIndexerError(IndexerErrorKind.DatabaseFailed, {
          cause: edges.error
        }));
      const nodes = db.run("DELETE FROM nodes WHERE repo_hash = ? AND file_path = ?", [repoHash, file]);
      if (nodes.isErr())
        return err(toIndexerError(IndexerErrorKind.DatabaseFailed, {
          cause: nodes.error
        }));
    }
    return ok(undefined);
  }
  #link(options, parsed, existing) {
    const nodes = [...existing];
    const virtualNodes = new Map;
    const byFile = new Map;
    const byName = new Map;
    for (const node of nodes) {
      const file = byFile.get(node.file_path) ?? [];
      file.push(node);
      byFile.set(node.file_path, file);
      const named = byName.get(node.name) ?? [];
      named.push(node);
      byName.set(node.name, named);
    }
    const resolver = new ImportResolver({
      projectRoot: options.projectDir,
      workspacePackages: options.workspacePackages
    });
    const edgeSites = new Map;
    const add = (source, target, type, relation, extra = {}) => {
      const key = `${source.id}\x00${target.id}\x00${type}`;
      const site = {
        file: relation.filePath,
        line: relation.range.start.line,
        column: relation.range.start.column,
        columnStart: relation.range.start.column,
        columnEnd: relation.range.end.column,
        offsetStart: relation.range.start.offset,
        offsetEnd: relation.range.end.offset,
        ...extra
      };
      const value = edgeSites.get(key) ?? {
        edge: { source: source.id, target: target.id, type, weight: 0 },
        sites: []
      };
      value.edge.weight += 1;
      value.sites.push(site);
      edgeSites.set(key, value);
    };
    for (const result of parsed.values()) {
      const local = byFile.get(result.filePath) ?? [];
      const imports = new Map;
      for (const relation of result.relations)
        if (relation.kind === "import") {
          const resolved = resolver.resolveToSymbol({
            specifier: relation.module,
            importedName: relation.specifier,
            importerPath: result.filePath,
            projectRoot: options.projectDir,
            workspacePackages: options.workspacePackages
          });
          if (resolved.isOk() && resolved.value) {
            const target = (byFile.get(resolved.value.filePath) ?? []).find((node) => node.name === resolved.value.symbolName) ?? (byFile.get(resolved.value.filePath) ?? []).find((node) => node.kind === "module");
            if (target && relation.specifier)
              imports.set(relation.specifier, target);
          }
        }
      for (const relation of result.relations) {
        const source = this.#closest(local, relation.range.start.line);
        if (!source)
          continue;
        if (relation.kind === "event") {
          const id = `event:${options.repoHash}:${relation.eventName}`;
          let eventNode = virtualNodes.get(id);
          if (!eventNode) {
            eventNode = {
              id,
              name: relation.eventName,
              kind: "event",
              file_path: "<events>",
              line_start: 0,
              line_end: 0,
              repo_hash: options.repoHash,
              parent_id: null,
              hierarchy_level: "low",
              metadata: { eventKind: relation.eventKind ?? "event" }
            };
            virtualNodes.set(id, eventNode);
          }
          if (relation.direction === "fire")
            add(source, eventNode, "fires_hook", relation, {
              eventKind: relation.eventKind
            });
          else {
            const callback = relation.callback?.name ? (byName.get(relation.callback.name) ?? []).find((node) => node.file_path === result.filePath) ?? byName.get(relation.callback.name)?.[0] : undefined;
            add(source, eventNode, "listens_hook", relation, {
              callback: relation.callback?.name,
              priority: relation.priority,
              acceptedArguments: relation.acceptedArguments
            });
            if (callback)
              add(eventNode, callback, "dispatches", relation, {
                priority: relation.priority,
                acceptedArguments: relation.acceptedArguments
              });
          }
          continue;
        }
        let target;
        if (relation.kind === "import") {
          const resolved = resolver.resolveToSymbol({
            specifier: relation.module,
            importedName: relation.specifier,
            importerPath: result.filePath,
            projectRoot: options.projectDir,
            workspacePackages: options.workspacePackages
          });
          if (resolved.isOk() && resolved.value)
            target = (byFile.get(resolved.value.filePath) ?? []).find((node) => node.name === resolved.value.symbolName) ?? (byFile.get(resolved.value.filePath) ?? []).find((node) => node.kind === "module");
        } else {
          const name = relation.kind === "export" ? relation.target : relation.target;
          target = local.find((node) => node.name === name) ?? imports.get(name);
          if (!target && relation.kind === "reference" && relation.receiver) {
            const receiver = relation.receiver.replace(/^this\.|^self\.|^\$this->|^\$/, "");
            const owner = receiver === "this" || receiver === "self" ? nodes.find((node) => node.id === source.parent_id) : (byName.get(receiver) ?? [])[0];
            target = owner ? nodes.find((node) => node.parent_id === owner.id && node.name === name) : undefined;
          }
          if (!target) {
            const matches = byName.get(name) ?? [];
            if (matches.length === 1)
              target = matches[0];
          }
        }
        if (!target)
          continue;
        const type = relation.kind === "reference" ? relation.role === "call" ? "calls" : relation.role : relation.kind;
        add(source, target, type, relation, relation.kind === "reference" ? { receiver: relation.receiver } : {});
      }
    }
    const edges = [...edgeSites.values()].map(({ edge, sites }) => ({
      ...edge,
      metadata_json: JSON.stringify({ call_sites: sites, call_site: sites[0] })
    }));
    return ok({ nodes: [...virtualNodes.values()], edges });
  }
  #persistState(options, parsed, hashes, deleted, filesToPersist) {
    const db = this.#repository.database;
    if (deleted.length > 0) {
      const placeholders = deleted.map(() => "?").join(",");
      const manifest = db.run(`DELETE FROM file_manifest WHERE repo_hash = ? AND file_path IN (${placeholders})`, [options.repoHash, ...deleted]);
      if (manifest.isErr())
        return err(toIndexerError(IndexerErrorKind.DatabaseFailed, {
          cause: manifest.error
        }));
      const cache = db.run(`DELETE FROM parse_cache WHERE repo_hash = ? AND file_path IN (${placeholders})`, [options.repoHash, ...deleted]);
      if (cache.isErr())
        return err(toIndexerError(IndexerErrorKind.DatabaseFailed, {
          cause: cache.error
        }));
    }
    const files = [...new Set(filesToPersist)];
    const manifestChunkSize = 1000;
    for (let offset = 0;offset < files.length; offset += manifestChunkSize) {
      const chunk = files.slice(offset, offset + manifestChunkSize);
      const placeholders = chunk.map(() => "(?,?,?,?)").join(",");
      const parameters = chunk.flatMap((file) => {
        const value = hashes.get(file);
        return [file, options.repoHash, value.hash, value.mtime];
      });
      const manifest = db.run(`INSERT OR REPLACE INTO file_manifest(file_path, repo_hash, content_hash, mtime) VALUES ${placeholders}`, parameters);
      if (manifest.isErr())
        return err(toIndexerError(IndexerErrorKind.DatabaseFailed, {
          cause: manifest.error
        }));
    }
    const cacheRows = files.flatMap((file) => {
      const result = parsed.get(file);
      const value = hashes.get(file);
      return result && value ? [[file, options.repoHash, value.hash, JSON.stringify(result)]] : [];
    });
    const cacheChunkSize = 500;
    for (let offset = 0;offset < cacheRows.length; offset += cacheChunkSize) {
      const chunk = cacheRows.slice(offset, offset + cacheChunkSize);
      const placeholders = chunk.map(() => "(?,?,?,?)").join(",");
      const cache = db.run(`INSERT OR REPLACE INTO parse_cache(file_path, repo_hash, content_hash, data) VALUES ${placeholders}`, chunk.flat());
      if (cache.isErr())
        return err(toIndexerError(IndexerErrorKind.DatabaseFailed, {
          cause: cache.error
        }));
    }
    return ok(undefined);
  }
  #node(repoHash, declaration, inlineLimit) {
    const lines = this.#sourceCache.get(declaration.filePath) ?? [];
    const count = declaration.range.end.line - declaration.range.start.line + 1;
    const source = count <= inlineLimit ? lines.slice(declaration.range.start.line - 1, declaration.range.end.line).join(`
`) : "";
    const leading = lines.slice(Math.max(0, declaration.range.start.line - 8), declaration.range.start.line - 1).join(`
`);
    const blockMatches = [...leading.matchAll(/\/\*\*[\s\S]*?\*\//g)];
    const lastBlock = blockMatches.at(-1);
    const blockDoc = lastBlock && leading.slice((lastBlock.index ?? 0) + lastBlock[0].length).trim() === "" ? lastBlock[0] : "";
    const lineDoc = /\.py$/i.test(declaration.filePath) ? leading.match(/(?:^|\n)(?:\s*#.*\n?)+$/)?.[0]?.trim() ?? "" : "";
    const doc = blockDoc || lineDoc;
    return {
      id: declaration.id,
      name: declaration.name,
      kind: declaration.kind,
      file_path: declaration.filePath,
      line_start: declaration.range.start.line,
      line_end: declaration.range.end.line,
      column_start: declaration.range.start.column,
      column_end: declaration.range.end.column,
      offset_start: declaration.range.start.offset,
      offset_end: declaration.range.end.offset,
      repo_hash: repoHash,
      parent_id: declaration.parentId,
      hierarchy_level: "low",
      metadata: {
        ...declaration.metadata,
        depth: declaration.depth,
        source_code: source,
        doc,
        summary: doc.replace(/^[\s/*#-]+|[\s/*#-]+$/g, "").split(/\r?\n/)[0] ?? ""
      }
    };
  }
  #closest(nodes, line) {
    return nodes.filter((node) => node.line_start <= line && node.line_end >= line).sort((a, b) => a.line_end - a.line_start - (b.line_end - b.line_start))[0];
  }
  #secondsSince(startedAt) {
    return `${((Date.now() - startedAt) / 1000).toFixed(2)}s`;
  }
  async#hashFile(filePath) {
    return fromAsync(async () => {
      const [content, info] = await Promise.all([
        readFile2(filePath),
        stat(filePath)
      ]);
      this.#sourceCache.set(filePath, content.toString("utf8").split(/\r?\n/));
      return {
        hash: createHash("sha256").update(content).digest("hex"),
        mtime: Math.floor(info.mtimeMs)
      };
    }, (cause) => toIndexerError(IndexerErrorKind.ParserFailed, { filePath, cause }));
  }
  #gitCommit(projectDir) {
    const result = spawnSync("git", ["-C", projectDir, "rev-parse", "HEAD"], {
      encoding: "utf8"
    });
    return result.status === 0 ? result.stdout.trim() : null;
  }
  async#loadParser() {
    if (this.#parser)
      return ok(this.#parser);
    return fromAsync(async () => {
      const { ParserEngine: ParserEngine2 } = await Promise.resolve().then(() => (init_dist(), exports_dist));
      this.#parser = new ParserEngine2;
      return this.#parser;
    }, (cause) => toIndexerError(IndexerErrorKind.ParserFailed, {
      filePath: "<engine>",
      cause
    }));
  }
}
var INDEX_SCHEMA_VERSION = "7";
var init_indexer = __esm(() => {
  init_esm();
  init_dist();
  init_repository();
  init_type();
  init_error8();
  init_error8();
  init_type();
});

// node_modules/.bun/marked@18.0.7/node_modules/marked/lib/marked.esm.js
function z() {
  return { async: false, breaks: false, extensions: null, gfm: true, hooks: null, pedantic: false, renderer: null, silent: false, tokenizer: null, walkTokens: null };
}
function N(l) {
  T = l;
}
function E(l) {
  let e = [];
  return (t) => {
    let n = Math.max(0, Math.min(3, t - 1)), s = e[n];
    return s || (s = l(n), e[n] = s), s;
  };
}
function d(l, e = "") {
  let t = typeof l == "string" ? l : l.source, n = { replace: (s, r) => {
    let i = typeof r == "string" ? r : r.source;
    return i = i.replace(m.caret, "$1"), t = t.replace(s, i), n;
  }, getRegex: () => new RegExp(t, e) };
  return n;
}
function O(l, e) {
  if (e) {
    if (m.escapeTest.test(l))
      return l.replace(m.escapeReplace, ge);
  } else if (m.escapeTestNoEncode.test(l))
    return l.replace(m.escapeReplaceNoEncode, ge);
  return l;
}
function V(l) {
  try {
    l = encodeURI(l).replace(m.percentDecode, "%");
  } catch {
    return null;
  }
  return l;
}
function Y(l, e) {
  let t = l.replace(m.findPipe, (r, i, o) => {
    let u = false, a = i;
    for (;--a >= 0 && o[a] === "\\"; )
      u = !u;
    return u ? "|" : " |";
  }), n = t.split(m.splitPipe), s = 0;
  if (n[0].trim() || n.shift(), n.length > 0 && !n.at(-1)?.trim() && n.pop(), e)
    if (n.length > e)
      n.splice(e);
    else
      for (;n.length < e; )
        n.push("");
  for (;s < n.length; s++)
    n[s] = n[s].trim().replace(m.slashPipe, "|");
  return n;
}
function $(l, e, t) {
  let n = l.length;
  if (n === 0)
    return "";
  let s = 0;
  for (;s < n; ) {
    let r = l.charAt(n - s - 1);
    if (r === e && !t)
      s++;
    else if (r !== e && t)
      s++;
    else
      break;
  }
  return l.slice(0, n - s);
}
function ee(l) {
  let e = l.split(`
`), t = e.length - 1;
  for (;t >= 0 && m.blankLine.test(e[t]); )
    t--;
  return e.length - t <= 2 ? l : e.slice(0, t + 1).join(`
`);
}
function fe(l, e) {
  if (l.indexOf(e[1]) === -1)
    return -1;
  let t = 0;
  for (let n = 0;n < l.length; n++)
    if (l[n] === "\\")
      n++;
    else if (l[n] === e[0])
      t++;
    else if (l[n] === e[1] && (t--, t < 0))
      return n;
  return t > 0 ? -2 : -1;
}
function me(l, e = 0) {
  let t = e, n = "";
  for (let s of l)
    if (s === "\t") {
      let r = 4 - t % 4;
      n += " ".repeat(r), t += r;
    } else
      n += s, t++;
  return n;
}
function xe(l, e, t, n, s) {
  let r = e.href, i = e.title || null, o = l[1].replace(s.other.outputLinkReplace, "$1");
  n.state.inLink = true;
  let u = { type: l[0].charAt(0) === "!" ? "image" : "link", raw: t, href: r, title: i, text: o, tokens: n.inlineTokens(o) };
  return n.state.inLink = false, u;
}
function ot(l, e, t) {
  let n = l.match(t.other.indentCodeCompensation);
  if (n === null)
    return e;
  let s = n[1];
  return e.split(`
`).map((r) => {
    let i = r.match(t.other.beginningSpace);
    if (i === null)
      return r;
    let [o] = i;
    return o.length >= s.length ? r.slice(s.length) : r;
  }).join(`
`);
}
function g(l3, e) {
  return M.parse(l3, e);
}
var T, _, Te, m, Oe, we, ye, B, Pe, j, oe, ae, Se, F, $e, U, Le, _e, H = "address|article|aside|base|basefont|blockquote|body|caption|center|col|colgroup|dd|details|dialog|dir|div|dl|dt|fieldset|figcaption|figure|footer|form|frame|frameset|h[1-6]|head|header|hr|html|iframe|legend|li|link|main|menu|menuitem|meta|nav|noframes|ol|optgroup|option|p|param|search|section|summary|table|tbody|td|tfoot|th|thead|title|tr|track|ul", K, Me, le = (l) => d(F).replace("hr", B).replace("heading", " {0,3}#{1,6}(?:\\s|$)").replace("|lheading", "").replace("|table", "").replace("blockquote", " {0,3}>").replace("fences", " {0,3}(?:`{3,}(?=[^`\\n]*\\n)|~~~)[^\\n]*\\n").replace("list", l).replace("html", "</?(?:tag)(?: +|\\n|/?>)|<(?:script|pre|style|textarea|!--)").replace("tag", H).getRegex(), ze, Ee, Ce, W, se, Ae, Ie, Be, qe, ue, De, C, Z, X, ve, pe, He, Ze, Ge, ce, Ne, Qe, he = "^[^_*]*?__[^_*]*?\\*[^_*]*?(?=__)|[^*]+(?=[^*])|(?!\\*)punct(\\*+)(?=[\\s]|$)|notPunctSpace(\\*+)(?!\\*)(?=punctSpace|$)|(?!\\*)punctSpace(\\*+)(?=notPunctSpace)|[\\s](\\*+)(?!\\*)(?=punct)|(?!\\*)punct(\\*+)(?!\\*)(?=punct)|notPunctSpace(\\*+)(?=notPunctSpace)", je, Fe, Ue, Ke, We = "^[^~]+(?=[^~])|(?!~)punct(~~?)(?=[\\s]|$)|notPunctSpace(~~?)(?!~)(?=punctSpace|$)|(?!~)punctSpace(~~?)(?=notPunctSpace)|[\\s](~~?)(?!~)(?=punct)|(?!~)punct(~~?)(?!~)(?=punct)|notPunctSpace(~~?)(?=notPunctSpace)", Xe, Je, Ve, Ye, et, v, tt, ke, de, nt, ie, J, rt, Q, st, q, A, it, ge = (l) => it[l], w = class {
  options;
  rules;
  lexer;
  constructor(e) {
    this.options = e || T;
  }
  space(e) {
    let t = this.rules.block.newline.exec(e);
    if (t && t[0].length > 0)
      return { type: "space", raw: t[0] };
  }
  code(e) {
    let t = this.rules.block.code.exec(e);
    if (t) {
      let n = this.options.pedantic ? t[0] : ee(t[0]), s = n.replace(this.rules.other.codeRemoveIndent, "");
      return { type: "code", raw: n, codeBlockStyle: "indented", text: s };
    }
  }
  fences(e) {
    let t = this.rules.block.fences.exec(e);
    if (t) {
      let n = t[0], s = ot(n, t[3] || "", this.rules);
      return { type: "code", raw: n, lang: t[2] ? t[2].trim().replace(this.rules.inline.anyPunctuation, "$1") : t[2], text: s };
    }
  }
  heading(e) {
    let t = this.rules.block.heading.exec(e);
    if (t) {
      let n = t[2].trim();
      if (this.rules.other.endingHash.test(n)) {
        let s = $(n, "#");
        (this.options.pedantic || !s || this.rules.other.endingSpaceChar.test(s)) && (n = s.trim());
      }
      return { type: "heading", raw: $(t[0], `
`), depth: t[1].length, text: n, tokens: this.lexer.inline(n) };
    }
  }
  hr(e) {
    let t = this.rules.block.hr.exec(e);
    if (t)
      return { type: "hr", raw: $(t[0], `
`) };
  }
  blockquote(e) {
    let t = this.rules.block.blockquote.exec(e);
    if (t) {
      let n = $(t[0], `
`).split(`
`), s = "", r = "", i = [];
      for (;n.length > 0; ) {
        let o = false, u = [], a;
        for (a = 0;a < n.length; a++)
          if (this.rules.other.blockquoteStart.test(n[a]))
            u.push(n[a]), o = true;
          else if (!o)
            u.push(n[a]);
          else
            break;
        n = n.slice(a);
        let p = u.join(`
`), c = p.replace(this.rules.other.blockquoteSetextReplace, `
    $1`).replace(this.rules.other.blockquoteSetextReplace2, "");
        s = s ? `${s}
${p}` : p, r = r ? `${r}
${c}` : c;
        let h = this.lexer.state.top;
        if (this.lexer.state.top = true, this.lexer.blockTokens(c, i, true), this.lexer.state.top = h, n.length === 0)
          break;
        let k = i.at(-1);
        if (k?.type === "code")
          break;
        if (k?.type === "blockquote") {
          let R = k, f = R.raw + `
` + n.join(`
`), S = this.blockquote(f);
          i[i.length - 1] = S, s = s.substring(0, s.length - R.raw.length) + S.raw, r = r.substring(0, r.length - R.text.length) + S.text;
          break;
        } else if (k?.type === "list") {
          let R = k, f = R.raw + `
` + n.join(`
`), S = this.list(f);
          i[i.length - 1] = S, s = s.substring(0, s.length - k.raw.length) + S.raw, r = r.substring(0, r.length - R.raw.length) + S.raw, n = f.substring(i.at(-1).raw.length).split(`
`);
          continue;
        }
      }
      return { type: "blockquote", raw: s, tokens: i, text: r };
    }
  }
  list(e) {
    let t = this.rules.block.list.exec(e);
    if (t) {
      let n = t[1].trim(), s = n.length > 1, r = { type: "list", raw: "", ordered: s, start: s ? +n.slice(0, -1) : "", loose: false, items: [] };
      n = s ? `\\d{1,9}\\${n.slice(-1)}` : `\\${n}`, this.options.pedantic && (n = s ? n : "[*+-]");
      let i = this.rules.other.listItemRegex(n), o = false;
      for (;e; ) {
        let a = false, p = "", c = "";
        if (!(t = i.exec(e)) || this.rules.block.hr.test(e))
          break;
        p = t[0], e = e.substring(p.length);
        let h = me(t[2].split(`
`, 1)[0], t[1].length), k = e.split(`
`, 1)[0], R = !h.trim(), f = 0;
        if (this.options.pedantic ? (f = 2, c = h.trimStart()) : R ? f = t[1].length + 1 : (f = h.search(this.rules.other.nonSpaceChar), f = f > 4 ? 1 : f, c = h.slice(f), f += t[1].length), R && this.rules.other.blankLine.test(k) && (p += k + `
`, e = e.substring(k.length + 1), a = true), !a) {
          let S = this.rules.other.nextBulletRegex(f), te = this.rules.other.hrRegex(f), ne = this.rules.other.fencesBeginRegex(f), re = this.rules.other.headingBeginRegex(f), be = this.rules.other.htmlBeginRegex(f), Re = this.rules.other.blockquoteBeginRegex(f);
          for (;e; ) {
            let G = e.split(`
`, 1)[0], I;
            if (k = G, this.options.pedantic ? (k = k.replace(this.rules.other.listReplaceNesting, "  "), I = k) : I = k.replace(this.rules.other.tabCharGlobal, "    "), ne.test(k) || re.test(k) || be.test(k) || Re.test(k) || S.test(k) || te.test(k))
              break;
            if (I.search(this.rules.other.nonSpaceChar) >= f || !k.trim())
              c += `
` + I.slice(f);
            else {
              if (R || h.replace(this.rules.other.tabCharGlobal, "    ").search(this.rules.other.nonSpaceChar) >= 4 || ne.test(h) || re.test(h) || te.test(h))
                break;
              c += `
` + k;
            }
            R = !k.trim(), p += G + `
`, e = e.substring(G.length + 1), h = I.slice(f);
          }
        }
        r.loose || (o ? r.loose = true : this.rules.other.doubleBlankLine.test(p) && (o = true)), r.items.push({ type: "list_item", raw: p, task: !!this.options.gfm && this.rules.other.listIsTask.test(c), loose: false, text: c, tokens: [] }), r.raw += p;
      }
      let u = r.items.at(-1);
      if (u)
        u.raw = u.raw.trimEnd(), u.text = u.text.trimEnd();
      else
        return;
      r.raw = r.raw.trimEnd();
      for (let a of r.items) {
        this.lexer.state.top = false, a.tokens = this.lexer.blockTokens(a.text, []);
        let p = a.tokens[0];
        if (a.task && (p?.type === "text" || p?.type === "paragraph")) {
          a.text = a.text.replace(this.rules.other.listReplaceTask, ""), p.raw = p.raw.replace(this.rules.other.listReplaceTask, ""), p.text = p.text.replace(this.rules.other.listReplaceTask, "");
          for (let h = this.lexer.inlineQueue.length - 1;h >= 0; h--)
            if (this.rules.other.listIsTask.test(this.lexer.inlineQueue[h].src)) {
              this.lexer.inlineQueue[h].src = this.lexer.inlineQueue[h].src.replace(this.rules.other.listReplaceTask, "");
              break;
            }
          let c = this.rules.other.listTaskCheckbox.exec(a.raw);
          if (c) {
            let h = { type: "checkbox", raw: c[0] + " ", checked: c[0] !== "[ ]" };
            a.checked = h.checked, r.loose ? a.tokens[0] && ["paragraph", "text"].includes(a.tokens[0].type) && "tokens" in a.tokens[0] && a.tokens[0].tokens ? (a.tokens[0].raw = h.raw + a.tokens[0].raw, a.tokens[0].text = h.raw + a.tokens[0].text, a.tokens[0].tokens.unshift(h)) : a.tokens.unshift({ type: "paragraph", raw: h.raw, text: h.raw, tokens: [h] }) : a.tokens.unshift(h);
          }
        } else
          a.task && (a.task = false);
        if (!r.loose) {
          let c = a.tokens.filter((k) => k.type === "space"), h = c.length > 0 && c.some((k) => this.rules.other.anyLine.test(k.raw));
          r.loose = h;
        }
      }
      if (r.loose)
        for (let a of r.items) {
          a.loose = true;
          for (let p of a.tokens)
            p.type === "text" && (p.type = "paragraph");
        }
      return r;
    }
  }
  html(e) {
    let t = this.rules.block.html.exec(e);
    if (t) {
      let n = ee(t[0]);
      return { type: "html", block: true, raw: n, pre: t[1] === "pre" || t[1] === "script" || t[1] === "style", text: n };
    }
  }
  def(e) {
    let t = this.rules.block.def.exec(e);
    if (t) {
      let n = t[1].toLowerCase().replace(this.rules.other.multipleSpaceGlobal, " "), s = t[2] ? t[2].replace(this.rules.other.hrefBrackets, "$1").replace(this.rules.inline.anyPunctuation, "$1") : "", r = t[3] ? t[3].substring(1, t[3].length - 1).replace(this.rules.inline.anyPunctuation, "$1") : t[3];
      return { type: "def", tag: n, raw: $(t[0], `
`), href: s, title: r };
    }
  }
  table(e) {
    let t = this.rules.block.table.exec(e);
    if (!t || !this.rules.other.tableDelimiter.test(t[2]))
      return;
    let n = Y(t[1]), s = t[2].replace(this.rules.other.tableAlignChars, "").split("|"), r = t[3]?.trim() ? t[3].replace(this.rules.other.tableRowBlankLine, "").split(`
`) : [], i = { type: "table", raw: $(t[0], `
`), header: [], align: [], rows: [] };
    if (n.length === s.length) {
      for (let o of s)
        this.rules.other.tableAlignRight.test(o) ? i.align.push("right") : this.rules.other.tableAlignCenter.test(o) ? i.align.push("center") : this.rules.other.tableAlignLeft.test(o) ? i.align.push("left") : i.align.push(null);
      for (let o = 0;o < n.length; o++)
        i.header.push({ text: n[o], tokens: this.lexer.inline(n[o]), header: true, align: i.align[o] });
      for (let o of r)
        i.rows.push(Y(o, i.header.length).map((u, a) => ({ text: u, tokens: this.lexer.inline(u), header: false, align: i.align[a] })));
      return i;
    }
  }
  lheading(e) {
    let t = this.rules.block.lheading.exec(e);
    if (t) {
      let n = t[1].trim();
      return { type: "heading", raw: $(t[0], `
`), depth: t[2].charAt(0) === "=" ? 1 : 2, text: n, tokens: this.lexer.inline(n) };
    }
  }
  paragraph(e) {
    let t = this.rules.block.paragraph.exec(e);
    if (t) {
      let n = t[1].charAt(t[1].length - 1) === `
` ? t[1].slice(0, -1) : t[1];
      return { type: "paragraph", raw: t[0], text: n, tokens: this.lexer.inline(n) };
    }
  }
  text(e) {
    let t = this.rules.block.text.exec(e);
    if (t)
      return { type: "text", raw: t[0], text: t[0], tokens: this.lexer.inline(t[0]) };
  }
  escape(e) {
    let t = this.rules.inline.escape.exec(e);
    if (t)
      return { type: "escape", raw: t[0], text: t[1] };
  }
  tag(e) {
    let t = this.rules.inline.tag.exec(e);
    if (t)
      return !this.lexer.state.inLink && this.rules.other.startATag.test(t[0]) ? this.lexer.state.inLink = true : this.lexer.state.inLink && this.rules.other.endATag.test(t[0]) && (this.lexer.state.inLink = false), !this.lexer.state.inRawBlock && this.rules.other.startPreScriptTag.test(t[0]) ? this.lexer.state.inRawBlock = true : this.lexer.state.inRawBlock && this.rules.other.endPreScriptTag.test(t[0]) && (this.lexer.state.inRawBlock = false), { type: "html", raw: t[0], inLink: this.lexer.state.inLink, inRawBlock: this.lexer.state.inRawBlock, block: false, text: t[0] };
  }
  link(e) {
    let t = this.rules.inline.link.exec(e);
    if (t) {
      let n = t[2].trim();
      if (!this.options.pedantic && this.rules.other.startAngleBracket.test(n)) {
        if (!this.rules.other.endAngleBracket.test(n))
          return;
        let i = $(n.slice(0, -1), "\\");
        if ((n.length - i.length) % 2 === 0)
          return;
      } else {
        let i = fe(t[2], "()");
        if (i === -2)
          return;
        if (i > -1) {
          let u = (t[0].indexOf("!") === 0 ? 5 : 4) + t[1].length + i;
          t[2] = t[2].substring(0, i), t[0] = t[0].substring(0, u).trim(), t[3] = "";
        }
      }
      let s = t[2], r = "";
      if (this.options.pedantic) {
        let i = this.rules.other.pedanticHrefTitle.exec(s);
        i && (s = i[1], r = i[3]);
      } else
        r = t[3] ? t[3].slice(1, -1) : "";
      return s = s.trim(), this.rules.other.startAngleBracket.test(s) && (this.options.pedantic && !this.rules.other.endAngleBracket.test(n) ? s = s.slice(1) : s = s.slice(1, -1)), xe(t, { href: s && s.replace(this.rules.inline.anyPunctuation, "$1"), title: r && r.replace(this.rules.inline.anyPunctuation, "$1") }, t[0], this.lexer, this.rules);
    }
  }
  reflink(e, t) {
    let n;
    if ((n = this.rules.inline.reflink.exec(e)) || (n = this.rules.inline.nolink.exec(e))) {
      let s = (n[2] || n[1]).replace(this.rules.other.multipleSpaceGlobal, " "), r = t[s.toLowerCase()];
      if (!r) {
        let i = n[0].charAt(0);
        return { type: "text", raw: i, text: i };
      }
      return xe(n, r, n[0], this.lexer, this.rules);
    }
  }
  emStrong(e, t, n = "") {
    let s = this.rules.inline.emStrongLDelim.exec(e);
    if (!s || !s[1] && !s[2] && !s[3] && !s[4] || s[4] && n.match(this.rules.other.unicodeAlphaNumeric))
      return;
    if (!(s[1] || s[3] || "") || !n || this.rules.inline.punctuation.exec(n)) {
      let i = [...s[0]].length - 1, o, u, a = i, p = 0, c = s[0][0] === "*" ? this.rules.inline.emStrongRDelimAst : this.rules.inline.emStrongRDelimUnd;
      for (c.lastIndex = 0, t = t.slice(-1 * e.length + i);(s = c.exec(t)) !== null; ) {
        if (o = s[1] || s[2] || s[3] || s[4] || s[5] || s[6], !o)
          continue;
        if (u = [...o].length, s[3] || s[4]) {
          a += u;
          continue;
        } else if ((s[5] || s[6]) && i % 3 && !((i + u) % 3)) {
          p += u;
          continue;
        }
        if (a -= u, a > 0)
          continue;
        u = Math.min(u, u + a + p);
        let h = [...s[0]][0].length, k = e.slice(0, i + s.index + h + u);
        if (Math.min(i, u) % 2) {
          let f = k.slice(1, -1);
          return { type: "em", raw: k, text: f, tokens: this.lexer.inlineTokens(f) };
        }
        let R = k.slice(2, -2);
        return { type: "strong", raw: k, text: R, tokens: this.lexer.inlineTokens(R) };
      }
    }
  }
  codespan(e) {
    let t = this.rules.inline.code.exec(e);
    if (t) {
      let n = t[2].replace(this.rules.other.newLineCharGlobal, " "), s = this.rules.other.nonSpaceChar.test(n), r = this.rules.other.startingSpaceChar.test(n) && this.rules.other.endingSpaceChar.test(n);
      return s && r && (n = n.substring(1, n.length - 1)), { type: "codespan", raw: t[0], text: n };
    }
  }
  br(e) {
    let t = this.rules.inline.br.exec(e);
    if (t)
      return { type: "br", raw: t[0] };
  }
  del(e, t, n = "") {
    let s = this.rules.inline.delLDelim.exec(e);
    if (!s)
      return;
    if (!(s[1] || "") || !n || this.rules.inline.punctuation.exec(n)) {
      let i = [...s[0]].length - 1, o, u, a = i, p = this.rules.inline.delRDelim;
      for (p.lastIndex = 0, t = t.slice(-1 * e.length + i);(s = p.exec(t)) !== null; ) {
        if (o = s[1] || s[2] || s[3] || s[4] || s[5] || s[6], !o || (u = [...o].length, u !== i))
          continue;
        if (s[3] || s[4]) {
          a += u;
          continue;
        }
        if (a -= u, a > 0)
          continue;
        u = Math.min(u, u + a);
        let c = [...s[0]][0].length, h = e.slice(0, i + s.index + c + u), k = h.slice(i, -i);
        return { type: "del", raw: h, text: k, tokens: this.lexer.inlineTokens(k) };
      }
    }
  }
  autolink(e) {
    let t = this.rules.inline.autolink.exec(e);
    if (t) {
      let n, s;
      return t[2] === "@" ? (n = t[1], s = "mailto:" + n) : (n = t[1], s = n), { type: "link", raw: t[0], text: n, href: s, tokens: [{ type: "text", raw: n, text: n }] };
    }
  }
  url(e) {
    let t;
    if (t = this.rules.inline.url.exec(e)) {
      let n, s;
      if (t[2] === "@")
        n = t[0], s = "mailto:" + n;
      else {
        let r;
        do
          r = t[0], t[0] = this.rules.inline._backpedal.exec(t[0])?.[0] ?? "";
        while (r !== t[0]);
        n = t[0], t[1] === "www." ? s = "http://" + t[0] : s = t[0];
      }
      return { type: "link", raw: t[0], text: n, href: s, tokens: [{ type: "text", raw: n, text: n }] };
    }
  }
  inlineText(e) {
    let t = this.rules.inline.text.exec(e);
    if (t) {
      let n = this.lexer.state.inRawBlock;
      return { type: "text", raw: t[0], text: t[0], escaped: n };
    }
  }
}, x = class l {
  tokens;
  options;
  state;
  inlineQueue;
  tokenizer;
  constructor(e) {
    this.tokens = [], this.tokens.links = Object.create(null), this.options = e || T, this.options.tokenizer = this.options.tokenizer || new w, this.tokenizer = this.options.tokenizer, this.tokenizer.options = this.options, this.tokenizer.lexer = this, this.inlineQueue = [], this.state = { inLink: false, inRawBlock: false, top: true };
    let t = { other: m, block: q.normal, inline: A.normal };
    this.options.pedantic ? (t.block = q.pedantic, t.inline = A.pedantic) : this.options.gfm && (t.block = q.gfm, this.options.breaks ? t.inline = A.breaks : t.inline = A.gfm), this.tokenizer.rules = t;
  }
  static get rules() {
    return { block: q, inline: A };
  }
  static lex(e, t) {
    return new l(t).lex(e);
  }
  static lexInline(e, t) {
    return new l(t).inlineTokens(e);
  }
  lex(e) {
    e = e.replace(m.carriageReturn, `
`), this.blockTokens(e, this.tokens);
    for (let t = 0;t < this.inlineQueue.length; t++) {
      let n = this.inlineQueue[t];
      this.inlineTokens(n.src, n.tokens);
    }
    return this.inlineQueue = [], this.tokens;
  }
  blockTokens(e, t = [], n = false) {
    this.tokenizer.lexer = this, this.options.pedantic && (e = e.replace(m.tabCharGlobal, "    ").replace(m.spaceLine, ""));
    let s = 1 / 0;
    for (;e; ) {
      if (e.length < s)
        s = e.length;
      else {
        this.infiniteLoopError(e.charCodeAt(0));
        break;
      }
      let r;
      if (this.options.extensions?.block?.some((o) => (r = o.call({ lexer: this }, e, t)) ? (e = e.substring(r.raw.length), t.push(r), true) : false))
        continue;
      if (r = this.tokenizer.space(e)) {
        e = e.substring(r.raw.length);
        let o = t.at(-1);
        r.raw.length === 1 && o !== undefined ? o.raw += `
` : t.push(r);
        continue;
      }
      if (r = this.tokenizer.code(e)) {
        e = e.substring(r.raw.length);
        let o = t.at(-1);
        o?.type === "paragraph" || o?.type === "text" ? (o.raw += (o.raw.endsWith(`
`) ? "" : `
`) + r.raw, o.text += `
` + r.text, this.inlineQueue.at(-1).src = o.text) : t.push(r);
        continue;
      }
      if (r = this.tokenizer.fences(e)) {
        e = e.substring(r.raw.length), t.push(r);
        continue;
      }
      if (r = this.tokenizer.heading(e)) {
        e = e.substring(r.raw.length), t.push(r);
        continue;
      }
      if (r = this.tokenizer.hr(e)) {
        e = e.substring(r.raw.length), t.push(r);
        continue;
      }
      if (r = this.tokenizer.blockquote(e)) {
        e = e.substring(r.raw.length), t.push(r);
        continue;
      }
      if (r = this.tokenizer.list(e)) {
        e = e.substring(r.raw.length), t.push(r);
        continue;
      }
      if (r = this.tokenizer.html(e)) {
        e = e.substring(r.raw.length), t.push(r);
        continue;
      }
      if (r = this.tokenizer.def(e)) {
        e = e.substring(r.raw.length);
        let o = t.at(-1);
        o?.type === "paragraph" || o?.type === "text" ? (o.raw += (o.raw.endsWith(`
`) ? "" : `
`) + r.raw, o.text += `
` + r.raw, this.inlineQueue.at(-1).src = o.text) : this.tokens.links[r.tag] || (this.tokens.links[r.tag] = { href: r.href, title: r.title }, t.push(r));
        continue;
      }
      if (r = this.tokenizer.table(e)) {
        e = e.substring(r.raw.length), t.push(r);
        continue;
      }
      if (r = this.tokenizer.lheading(e)) {
        e = e.substring(r.raw.length), t.push(r);
        continue;
      }
      let i = e;
      if (this.options.extensions?.startBlock) {
        let o = 1 / 0, u = e.slice(1), a;
        this.options.extensions.startBlock.forEach((p) => {
          a = p.call({ lexer: this }, u), typeof a == "number" && a >= 0 && (o = Math.min(o, a));
        }), o < 1 / 0 && o >= 0 && (i = e.substring(0, o + 1));
      }
      if (this.state.top && (r = this.tokenizer.paragraph(i))) {
        let o = t.at(-1);
        n && o?.type === "paragraph" ? (o.raw += (o.raw.endsWith(`
`) ? "" : `
`) + r.raw, o.text += `
` + r.text, this.inlineQueue.pop(), this.inlineQueue.at(-1).src = o.text) : t.push(r), n = i.length !== e.length, e = e.substring(r.raw.length);
        continue;
      }
      if (r = this.tokenizer.text(e)) {
        e = e.substring(r.raw.length);
        let o = t.at(-1);
        o?.type === "text" ? (o.raw += (o.raw.endsWith(`
`) ? "" : `
`) + r.raw, o.text += `
` + r.text, this.inlineQueue.pop(), this.inlineQueue.at(-1).src = o.text) : t.push(r);
        continue;
      }
      if (e) {
        this.infiniteLoopError(e.charCodeAt(0));
        break;
      }
    }
    return this.state.top = true, t;
  }
  inline(e, t = []) {
    return this.inlineQueue.push({ src: e, tokens: t }), t;
  }
  inlineTokens(e, t = []) {
    this.tokenizer.lexer = this;
    let n = e;
    if (this.tokens.links) {
      let o = Object.keys(this.tokens.links);
      o.length > 0 && (n = n.replace(this.tokenizer.rules.inline.reflinkSearch, (u) => o.includes(u.slice(u.lastIndexOf("[") + 1, -1)) ? "[" + "a".repeat(u.length - 2) + "]" : u));
    }
    n = n.replace(this.tokenizer.rules.inline.anyPunctuation, "++"), n = n.replace(this.tokenizer.rules.inline.blockSkip, (o, u, a) => {
      let p = a ? a.length : 0;
      return o.slice(0, p) + "[" + "a".repeat(o.length - p - 2) + "]";
    }), n = this.options.hooks?.emStrongMask?.call({ lexer: this }, n) ?? n;
    let s = false, r = "", i = 1 / 0;
    for (;e; ) {
      if (e.length < i)
        i = e.length;
      else {
        this.infiniteLoopError(e.charCodeAt(0));
        break;
      }
      s || (r = ""), s = false;
      let o;
      if (this.options.extensions?.inline?.some((a) => (o = a.call({ lexer: this }, e, t)) ? (e = e.substring(o.raw.length), t.push(o), true) : false))
        continue;
      if (o = this.tokenizer.escape(e)) {
        e = e.substring(o.raw.length), t.push(o);
        continue;
      }
      if (o = this.tokenizer.tag(e)) {
        e = e.substring(o.raw.length), t.push(o);
        continue;
      }
      if (o = this.tokenizer.link(e)) {
        e = e.substring(o.raw.length), t.push(o);
        continue;
      }
      if (o = this.tokenizer.reflink(e, this.tokens.links)) {
        e = e.substring(o.raw.length);
        let a = t.at(-1);
        o.type === "text" && a?.type === "text" ? (a.raw += o.raw, a.text += o.text) : t.push(o);
        continue;
      }
      if (o = this.tokenizer.emStrong(e, n, r)) {
        e = e.substring(o.raw.length), t.push(o);
        continue;
      }
      if (o = this.tokenizer.codespan(e)) {
        e = e.substring(o.raw.length), t.push(o);
        continue;
      }
      if (o = this.tokenizer.br(e)) {
        e = e.substring(o.raw.length), t.push(o);
        continue;
      }
      if (o = this.tokenizer.del(e, n, r)) {
        e = e.substring(o.raw.length), t.push(o);
        continue;
      }
      if (o = this.tokenizer.autolink(e)) {
        e = e.substring(o.raw.length), t.push(o);
        continue;
      }
      if (!this.state.inLink && (o = this.tokenizer.url(e))) {
        e = e.substring(o.raw.length), t.push(o);
        continue;
      }
      let u = e;
      if (this.options.extensions?.startInline) {
        let a = 1 / 0, p = e.slice(1), c;
        this.options.extensions.startInline.forEach((h) => {
          c = h.call({ lexer: this }, p), typeof c == "number" && c >= 0 && (a = Math.min(a, c));
        }), a < 1 / 0 && a >= 0 && (u = e.substring(0, a + 1));
      }
      if (o = this.tokenizer.inlineText(u)) {
        e = e.substring(o.raw.length), o.raw.slice(-1) !== "_" && (r = o.raw.slice(-1)), s = true;
        let a = t.at(-1);
        a?.type === "text" ? (a.raw += o.raw, a.text += o.text) : t.push(o);
        continue;
      }
      if (e) {
        this.infiniteLoopError(e.charCodeAt(0));
        break;
      }
    }
    return t;
  }
  infiniteLoopError(e) {
    let t = "Infinite loop on byte: " + e;
    if (this.options.silent)
      console.error(t);
    else
      throw new Error(t);
  }
}, y = class {
  options;
  parser;
  constructor(e) {
    this.options = e || T;
  }
  space(e) {
    return "";
  }
  code({ text: e, lang: t, escaped: n }) {
    let s = (t || "").match(m.notSpaceStart)?.[0], r = e.replace(m.endingNewline, "") + `
`;
    return s ? '<pre><code class="language-' + O(s) + '">' + (n ? r : O(r, true)) + `</code></pre>
` : "<pre><code>" + (n ? r : O(r, true)) + `</code></pre>
`;
  }
  blockquote({ tokens: e }) {
    return `<blockquote>
${this.parser.parse(e)}</blockquote>
`;
  }
  html({ text: e }) {
    return e;
  }
  def(e) {
    return "";
  }
  heading({ tokens: e, depth: t }) {
    return `<h${t}>${this.parser.parseInline(e)}</h${t}>
`;
  }
  hr(e) {
    return `<hr>
`;
  }
  list(e) {
    let { ordered: t, start: n } = e, s = "";
    for (let o = 0;o < e.items.length; o++) {
      let u = e.items[o];
      s += this.listitem(u);
    }
    let r = t ? "ol" : "ul", i = t && n !== 1 ? ' start="' + n + '"' : "";
    return "<" + r + i + `>
` + s + "</" + r + `>
`;
  }
  listitem(e) {
    return `<li>${this.parser.parse(e.tokens)}</li>
`;
  }
  checkbox({ checked: e }) {
    return "<input " + (e ? 'checked="" ' : "") + 'disabled="" type="checkbox"> ';
  }
  paragraph({ tokens: e }) {
    return `<p>${this.parser.parseInline(e)}</p>
`;
  }
  table(e) {
    let t = "", n = "";
    for (let r = 0;r < e.header.length; r++)
      n += this.tablecell(e.header[r]);
    t += this.tablerow({ text: n });
    let s = "";
    for (let r = 0;r < e.rows.length; r++) {
      let i = e.rows[r];
      n = "";
      for (let o = 0;o < i.length; o++)
        n += this.tablecell(i[o]);
      s += this.tablerow({ text: n });
    }
    return s && (s = `<tbody>${s}</tbody>`), `<table>
<thead>
` + t + `</thead>
` + s + `</table>
`;
  }
  tablerow({ text: e }) {
    return `<tr>
${e}</tr>
`;
  }
  tablecell(e) {
    let t = this.parser.parseInline(e.tokens), n = e.header ? "th" : "td";
    return (e.align ? `<${n} align="${e.align}">` : `<${n}>`) + t + `</${n}>
`;
  }
  strong({ tokens: e }) {
    return `<strong>${this.parser.parseInline(e)}</strong>`;
  }
  em({ tokens: e }) {
    return `<em>${this.parser.parseInline(e)}</em>`;
  }
  codespan({ text: e }) {
    return `<code>${O(e, true)}</code>`;
  }
  br(e) {
    return "<br>";
  }
  del({ tokens: e }) {
    return `<del>${this.parser.parseInline(e)}</del>`;
  }
  link({ href: e, title: t, tokens: n }) {
    let s = this.parser.parseInline(n), r = V(e);
    if (r === null)
      return s;
    e = r;
    let i = '<a href="' + e + '"';
    return t && (i += ' title="' + O(t) + '"'), i += ">" + s + "</a>", i;
  }
  image({ href: e, title: t, text: n, tokens: s }) {
    s && (n = this.parser.parseInline(s, this.parser.textRenderer));
    let r = V(e);
    if (r === null)
      return O(n);
    e = r;
    let i = `<img src="${e}" alt="${O(n)}"`;
    return t && (i += ` title="${O(t)}"`), i += ">", i;
  }
  text(e) {
    return "tokens" in e && e.tokens ? this.parser.parseInline(e.tokens) : ("escaped" in e) && e.escaped ? e.text : O(e.text);
  }
}, L = class {
  strong({ text: e }) {
    return e;
  }
  em({ text: e }) {
    return e;
  }
  codespan({ text: e }) {
    return e;
  }
  del({ text: e }) {
    return e;
  }
  html({ text: e }) {
    return e;
  }
  text({ text: e }) {
    return e;
  }
  link({ text: e }) {
    return "" + e;
  }
  image({ text: e }) {
    return "" + e;
  }
  br() {
    return "";
  }
  checkbox({ raw: e }) {
    return e;
  }
}, b = class l2 {
  options;
  renderer;
  textRenderer;
  constructor(e) {
    this.options = e || T, this.options.renderer = this.options.renderer || new y, this.renderer = this.options.renderer, this.renderer.options = this.options, this.renderer.parser = this, this.textRenderer = new L;
  }
  static parse(e, t) {
    return new l2(t).parse(e);
  }
  static parseInline(e, t) {
    return new l2(t).parseInline(e);
  }
  parse(e) {
    this.renderer.parser = this;
    let t = "";
    for (let n = 0;n < e.length; n++) {
      let s = e[n];
      if (this.options.extensions?.renderers?.[s.type]) {
        let i = s, o = this.options.extensions.renderers[i.type].call({ parser: this }, i);
        if (o !== false || !["space", "hr", "heading", "code", "table", "blockquote", "list", "html", "def", "paragraph", "text"].includes(i.type)) {
          t += o || "";
          continue;
        }
      }
      let r = s;
      switch (r.type) {
        case "space": {
          t += this.renderer.space(r);
          break;
        }
        case "hr": {
          t += this.renderer.hr(r);
          break;
        }
        case "heading": {
          t += this.renderer.heading(r);
          break;
        }
        case "code": {
          t += this.renderer.code(r);
          break;
        }
        case "table": {
          t += this.renderer.table(r);
          break;
        }
        case "blockquote": {
          t += this.renderer.blockquote(r);
          break;
        }
        case "list": {
          t += this.renderer.list(r);
          break;
        }
        case "checkbox": {
          t += this.renderer.checkbox(r);
          break;
        }
        case "html": {
          t += this.renderer.html(r);
          break;
        }
        case "def": {
          t += this.renderer.def(r);
          break;
        }
        case "paragraph": {
          t += this.renderer.paragraph(r);
          break;
        }
        case "text": {
          t += this.renderer.text(r);
          break;
        }
        default: {
          let i = 'Token with "' + r.type + '" type was not found.';
          if (this.options.silent)
            return console.error(i), "";
          throw new Error(i);
        }
      }
    }
    return t;
  }
  parseInline(e, t = this.renderer) {
    this.renderer.parser = this;
    let n = "";
    for (let s = 0;s < e.length; s++) {
      let r = e[s];
      if (this.options.extensions?.renderers?.[r.type]) {
        let o = this.options.extensions.renderers[r.type].call({ parser: this }, r);
        if (o !== false || !["escape", "html", "link", "image", "strong", "em", "codespan", "br", "del", "text"].includes(r.type)) {
          n += o || "";
          continue;
        }
      }
      let i = r;
      switch (i.type) {
        case "escape": {
          n += t.text(i);
          break;
        }
        case "html": {
          n += t.html(i);
          break;
        }
        case "link": {
          n += t.link(i);
          break;
        }
        case "image": {
          n += t.image(i);
          break;
        }
        case "checkbox": {
          n += t.checkbox(i);
          break;
        }
        case "strong": {
          n += t.strong(i);
          break;
        }
        case "em": {
          n += t.em(i);
          break;
        }
        case "codespan": {
          n += t.codespan(i);
          break;
        }
        case "br": {
          n += t.br(i);
          break;
        }
        case "del": {
          n += t.del(i);
          break;
        }
        case "text": {
          n += t.text(i);
          break;
        }
        default: {
          let o = 'Token with "' + i.type + '" type was not found.';
          if (this.options.silent)
            return console.error(o), "";
          throw new Error(o);
        }
      }
    }
    return n;
  }
}, P, D = class {
  defaults = z();
  options = this.setOptions;
  parse = this.parseMarkdown(true);
  parseInline = this.parseMarkdown(false);
  Parser = b;
  Renderer = y;
  TextRenderer = L;
  Lexer = x;
  Tokenizer = w;
  Hooks = P;
  constructor(...e) {
    this.use(...e);
  }
  walkTokens(e, t) {
    let n = [];
    for (let s of e)
      switch (n = n.concat(t.call(this, s)), s.type) {
        case "table": {
          let r = s;
          for (let i of r.header)
            n = n.concat(this.walkTokens(i.tokens, t));
          for (let i of r.rows)
            for (let o of i)
              n = n.concat(this.walkTokens(o.tokens, t));
          break;
        }
        case "list": {
          let r = s;
          n = n.concat(this.walkTokens(r.items, t));
          break;
        }
        default: {
          let r = s;
          this.defaults.extensions?.childTokens?.[r.type] ? this.defaults.extensions.childTokens[r.type].forEach((i) => {
            let o = r[i].flat(1 / 0);
            n = n.concat(this.walkTokens(o, t));
          }) : r.tokens && (n = n.concat(this.walkTokens(r.tokens, t)));
        }
      }
    return n;
  }
  use(...e) {
    let t = this.defaults.extensions || { renderers: {}, childTokens: {} };
    return e.forEach((n) => {
      let s = { ...n };
      if (s.async = this.defaults.async || s.async || false, n.extensions && (n.extensions.forEach((r) => {
        if (!r.name)
          throw new Error("extension name required");
        if ("renderer" in r) {
          let i = t.renderers[r.name];
          i ? t.renderers[r.name] = function(...o) {
            let u = r.renderer.apply(this, o);
            return u === false && (u = i.apply(this, o)), u;
          } : t.renderers[r.name] = r.renderer;
        }
        if ("tokenizer" in r) {
          if (!r.level || r.level !== "block" && r.level !== "inline")
            throw new Error("extension level must be 'block' or 'inline'");
          let i = t[r.level];
          i ? i.unshift(r.tokenizer) : t[r.level] = [r.tokenizer], r.start && (r.level === "block" ? t.startBlock ? t.startBlock.push(r.start) : t.startBlock = [r.start] : r.level === "inline" && (t.startInline ? t.startInline.push(r.start) : t.startInline = [r.start]));
        }
        "childTokens" in r && r.childTokens && (t.childTokens[r.name] = r.childTokens);
      }), s.extensions = t), n.renderer) {
        let r = this.defaults.renderer || new y(this.defaults);
        for (let i in n.renderer) {
          if (!(i in r))
            throw new Error(`renderer '${i}' does not exist`);
          if (["options", "parser"].includes(i))
            continue;
          let o = i, u = n.renderer[o], a = r[o];
          r[o] = (...p) => {
            let c = u.apply(r, p);
            return c === false && (c = a.apply(r, p)), c || "";
          };
        }
        s.renderer = r;
      }
      if (n.tokenizer) {
        let r = this.defaults.tokenizer || new w(this.defaults);
        for (let i in n.tokenizer) {
          if (!(i in r))
            throw new Error(`tokenizer '${i}' does not exist`);
          if (["options", "rules", "lexer"].includes(i))
            continue;
          let o = i, u = n.tokenizer[o], a = r[o];
          r[o] = (...p) => {
            let c = u.apply(r, p);
            return c === false && (c = a.apply(r, p)), c;
          };
        }
        s.tokenizer = r;
      }
      if (n.hooks) {
        let r = this.defaults.hooks || new P;
        for (let i in n.hooks) {
          if (!(i in r))
            throw new Error(`hook '${i}' does not exist`);
          if (["options", "block"].includes(i))
            continue;
          let o = i, u = n.hooks[o], a = r[o];
          P.passThroughHooks.has(i) ? r[o] = (p) => {
            if (this.defaults.async && P.passThroughHooksRespectAsync.has(i))
              return (async () => {
                let h = await u.call(r, p);
                return a.call(r, h);
              })();
            let c = u.call(r, p);
            return a.call(r, c);
          } : r[o] = (...p) => {
            if (this.defaults.async)
              return (async () => {
                let h = await u.apply(r, p);
                return h === false && (h = await a.apply(r, p)), h;
              })();
            let c = u.apply(r, p);
            return c === false && (c = a.apply(r, p)), c;
          };
        }
        s.hooks = r;
      }
      if (n.walkTokens) {
        let r = this.defaults.walkTokens, i = n.walkTokens;
        s.walkTokens = function(o) {
          let u = [];
          return u.push(i.call(this, o)), r && (u = u.concat(r.call(this, o))), u;
        };
      }
      this.defaults = { ...this.defaults, ...s };
    }), this;
  }
  setOptions(e) {
    return this.defaults = { ...this.defaults, ...e }, this;
  }
  lexer(e, t) {
    return x.lex(e, t ?? this.defaults);
  }
  parser(e, t) {
    return b.parse(e, t ?? this.defaults);
  }
  parseMarkdown(e) {
    return (n, s) => {
      let r = { ...s }, i = { ...this.defaults, ...r }, o = this.onError(!!i.silent, !!i.async);
      if (this.defaults.async === true && r.async === false)
        return o(new Error("marked(): The async option was set to true by an extension. Remove async: false from the parse options object to return a Promise."));
      if (typeof n > "u" || n === null)
        return o(new Error("marked(): input parameter is undefined or null"));
      if (typeof n != "string")
        return o(new Error("marked(): input parameter is of type " + Object.prototype.toString.call(n) + ", string expected"));
      if (i.hooks && (i.hooks.options = i, i.hooks.block = e), i.async)
        return (async () => {
          let u = i.hooks ? await i.hooks.preprocess(n) : n, p = await (i.hooks ? await i.hooks.provideLexer(e) : e ? x.lex : x.lexInline)(u, i), c = i.hooks ? await i.hooks.processAllTokens(p) : p;
          i.walkTokens && await Promise.all(this.walkTokens(c, i.walkTokens));
          let k = await (i.hooks ? await i.hooks.provideParser(e) : e ? b.parse : b.parseInline)(c, i);
          return i.hooks ? await i.hooks.postprocess(k) : k;
        })().catch(o);
      try {
        i.hooks && (n = i.hooks.preprocess(n));
        let a = (i.hooks ? i.hooks.provideLexer(e) : e ? x.lex : x.lexInline)(n, i);
        i.hooks && (a = i.hooks.processAllTokens(a)), i.walkTokens && this.walkTokens(a, i.walkTokens);
        let c = (i.hooks ? i.hooks.provideParser(e) : e ? b.parse : b.parseInline)(a, i);
        return i.hooks && (c = i.hooks.postprocess(c)), c;
      } catch (u) {
        return o(u);
      }
    };
  }
  onError(e, t) {
    return (n) => {
      if (n.message += `
Please report this to https://github.com/markedjs/marked.`, e) {
        let s = "<p>An error occurred:</p><pre>" + O(n.message + "", true) + "</pre>";
        return t ? Promise.resolve(s) : s;
      }
      if (t)
        return Promise.reject(n);
      throw n;
    };
  }
}, M, Kt, Wt, Xt, Jt, Vt, en, tn;
var init_marked_esm = __esm(() => {
  T = z();
  _ = { exec: () => null };
  Te = ((l = "") => {
    try {
      return !!new RegExp("(?<=1)(?<!1)" + l);
    } catch {
      return false;
    }
  })();
  m = { codeRemoveIndent: /^(?: {1,4}| {0,3}\t)/gm, outputLinkReplace: /\\([\[\]])/g, indentCodeCompensation: /^(\s+)(?:```)/, beginningSpace: /^\s+/, endingHash: /#$/, startingSpaceChar: /^ /, endingSpaceChar: / $/, nonSpaceChar: /[^ ]/, newLineCharGlobal: /\n/g, tabCharGlobal: /\t/g, multipleSpaceGlobal: /\s+/g, blankLine: /^[ \t]*$/, doubleBlankLine: /\n[ \t]*\n[ \t]*$/, blockquoteStart: /^ {0,3}>/, blockquoteSetextReplace: /\n {0,3}((?:=+|-+) *)(?=\n|$)/g, blockquoteSetextReplace2: /^ {0,3}>[ \t]?/gm, listReplaceNesting: /^ {1,4}(?=( {4})*[^ ])/g, listIsTask: /^\[[ xX]\] +\S/, listReplaceTask: /^\[[ xX]\] +/, listTaskCheckbox: /\[[ xX]\]/, anyLine: /\n.*\n/, hrefBrackets: /^<(.*)>$/, tableDelimiter: /[:|]/, tableAlignChars: /^\||\| *$/g, tableRowBlankLine: /\n[ \t]*$/, tableAlignRight: /^ *-+: *$/, tableAlignCenter: /^ *:-+: *$/, tableAlignLeft: /^ *:-+ *$/, startATag: /^<a /i, endATag: /^<\/a>/i, startPreScriptTag: /^<(pre|code|kbd|script)(\s|>)/i, endPreScriptTag: /^<\/(pre|code|kbd|script)(\s|>)/i, startAngleBracket: /^</, endAngleBracket: />$/, pedanticHrefTitle: /^([^'"]*[^\s])\s+(['"])(.*)\2/, unicodeAlphaNumeric: /[\p{L}\p{N}]/u, escapeTest: /[&<>"']/, escapeReplace: /[&<>"']/g, escapeTestNoEncode: /[<>"']|&(?!(#\d{1,7}|#[Xx][a-fA-F0-9]{1,6}|\w+);)/, escapeReplaceNoEncode: /[<>"']|&(?!(#\d{1,7}|#[Xx][a-fA-F0-9]{1,6}|\w+);)/g, caret: /(^|[^\[])\^/g, percentDecode: /%25/g, findPipe: /\|/g, splitPipe: / \|/, slashPipe: /\\\|/g, carriageReturn: /\r\n|\r/g, spaceLine: /^ +$/gm, notSpaceStart: /^\S*/, endingNewline: /\n$/, listItemRegex: (l) => new RegExp(`^( {0,3}${l})((?:[	 ][^\\n]*)?(?:\\n|$))`), nextBulletRegex: E((l) => new RegExp(`^ {0,${l}}(?:[*+-]|\\d{1,9}[.)])((?:[ 	][^\\n]*)?(?:\\n|$))`)), hrRegex: E((l) => new RegExp(`^ {0,${l}}((?:- *){3,}|(?:_ *){3,}|(?:\\* *){3,})(?:\\n+|$)`)), fencesBeginRegex: E((l) => new RegExp(`^ {0,${l}}(?:\`\`\`|~~~)`)), headingBeginRegex: E((l) => new RegExp(`^ {0,${l}}#`)), htmlBeginRegex: E((l) => new RegExp(`^ {0,${l}}<(?:[a-z].*>|!--)`, "i")), blockquoteBeginRegex: E((l) => new RegExp(`^ {0,${l}}>`)) };
  Oe = /^(?:[ \t]*(?:\n|$))+/;
  we = /^((?: {4}| {0,3}\t)[^\n]+(?:\n(?:[ \t]*(?:\n|$))*)?)+/;
  ye = /^ {0,3}(`{3,}(?=[^`\n]*(?:\n|$))|~{3,})([^\n]*)(?:\n|$)(?:|([\s\S]*?)(?:\n|$))(?: {0,3}\1[~`]* *(?=\n|$)|$)/;
  B = /^ {0,3}((?:-[\t ]*){3,}|(?:_[ \t]*){3,}|(?:\*[ \t]*){3,})(?:\n+|$)/;
  Pe = /^ {0,3}(#{1,6})(?=\s|$)(.*)(?:\n+|$)/;
  j = / {0,3}(?:[*+-]|\d{1,9}[.)])/;
  oe = /^(?!bull |blockCode|fences|blockquote|heading|html|table)((?:.|\n(?!\s*?\n|bull |blockCode|fences|blockquote|heading|html|table))+?)\n {0,3}(=+|-+) *(?:\n+|$)/;
  ae = d(oe).replace(/bull/g, j).replace(/blockCode/g, /(?: {4}| {0,3}\t)/).replace(/fences/g, / {0,3}(?:`{3,}|~{3,})/).replace(/blockquote/g, / {0,3}>/).replace(/heading/g, / {0,3}#{1,6}(?:\s|$)/).replace(/html/g, / {0,3}<[^\n>]+>\n/).replace(/\|table/g, "").getRegex();
  Se = d(oe).replace(/bull/g, j).replace(/blockCode/g, /(?: {4}| {0,3}\t)/).replace(/fences/g, / {0,3}(?:`{3,}|~{3,})/).replace(/blockquote/g, / {0,3}>/).replace(/heading/g, / {0,3}#{1,6}(?:\s|$)/).replace(/html/g, / {0,3}<[^\n>]+>\n/).replace(/table/g, / {0,3}\|?(?:[:\- ]*\|)+[\:\- ]*\n/).getRegex();
  F = /^([^\n]+(?:\n(?!hr|heading|lheading|blockquote|fences|list|html|table|[ \t]+\n)[^\n]+)*)/;
  $e = /^[^\n]+/;
  U = /(?!\s*\])(?:\\[\s\S]|[^\[\]\\])+/;
  Le = d(/^ {0,3}\[(label)\]: *(?:\n[ \t]*)?([^<\s][^\s]*|<.*?>)(?:(?: +(?:\n[ \t]*)?| *\n[ \t]*)(title))? *(?:\n+|$)/).replace("label", U).replace("title", /(?:"(?:\\"?|[^"\\])*"|'[^'\n]*(?:\n[^'\n]+)*\n?'|\([^()]*\))/).getRegex();
  _e = d(/^(bull)([ \t][^\n]*?)?(?:\n|$)/).replace(/bull/g, j).getRegex();
  K = /<!--(?:-?>|[\s\S]*?(?:-->|$))/;
  Me = d("^ {0,3}(?:<(script|pre|style|textarea)[\\s>][\\s\\S]*?(?:</\\1>[^\\n]*\\n*|$)|comment[^\\n]*(\\n+|$)|<\\?[\\s\\S]*?(?:\\?>[^\\n]*\\n*|$)|<![A-Z][\\s\\S]*?(?:>[^\\n]*\\n*|$)|<!\\[CDATA\\[[\\s\\S]*?(?:\\]\\]>[^\\n]*\\n*|$)|</?(tag)(?: +|\\n|/?>)[\\s\\S]*?(?:(?:\\n[ \t]*)+\\n|$)|<(?!script|pre|style|textarea)([a-z][\\w-]*)(?:attribute)*? */?>(?=[ \\t]*(?:\\n|$))[\\s\\S]*?(?:(?:\\n[ \t]*)+\\n|$)|</(?!script|pre|style|textarea)[a-z][\\w-]*\\s*>(?=[ \\t]*(?:\\n|$))[\\s\\S]*?(?:(?:\\n[ \t]*)+\\n|$))", "i").replace("comment", K).replace("tag", H).replace("attribute", / +[a-zA-Z:_][\w.:-]*(?: *= *"[^"\n]*"| *= *'[^'\n]*'| *= *[^\s"'=<>`]+)?/).getRegex();
  ze = le(/ {0,3}(?:[*+-]|1[.)])[ \t]+[^ \t\n]/);
  Ee = le(/ {0,3}(?:[*+-]|\d{1,9}[.)])(?:[ \t]|\n|$)/);
  Ce = d(/^( {0,3}> ?(paragraph|[^\n]*)(?:\n|$))+/).replace("paragraph", Ee).getRegex();
  W = { blockquote: Ce, code: we, def: Le, fences: ye, heading: Pe, hr: B, html: Me, lheading: ae, list: _e, newline: Oe, paragraph: ze, table: _, text: $e };
  se = d("^ *([^\\n ].*)\\n {0,3}((?:\\| *)?:?-+:? *(?:\\| *:?-+:? *)*(?:\\| *)?)(?:\\n((?:(?! *\\n|hr|heading|blockquote|code|fences|list|html).*(?:\\n|$))*)\\n*|$)").replace("hr", B).replace("heading", " {0,3}#{1,6}(?:\\s|$)").replace("blockquote", " {0,3}>").replace("code", "(?: {4}| {0,3}\t)[^\\n]").replace("fences", " {0,3}(?:`{3,}(?=[^`\\n]*\\n)|~~~)[^\\n]*\\n").replace("list", " {0,3}(?:[*+-]|1[.)])[ \\t]").replace("html", "</?(?:tag)(?: +|\\n|/?>)|<(?:script|pre|style|textarea|!--)").replace("tag", H).getRegex();
  Ae = { ...W, lheading: Se, table: se, paragraph: d(F).replace("hr", B).replace("heading", " {0,3}#{1,6}(?:\\s|$)").replace("|lheading", "").replace("table", se).replace("blockquote", " {0,3}>").replace("fences", " {0,3}(?:`{3,}(?=[^`\\n]*\\n)|~~~)[^\\n]*\\n").replace("list", " {0,3}(?:[*+-]|1[.)])[ \\t]+[^ \\t\\n]").replace("html", "</?(?:tag)(?: +|\\n|/?>)|<(?:script|pre|style|textarea|!--)").replace("tag", H).getRegex() };
  Ie = { ...W, html: d(`^ *(?:comment *(?:\\n|\\s*$)|<(tag)[\\s\\S]+?</\\1> *(?:\\n{2,}|\\s*$)|<tag(?:"[^"]*"|'[^']*'|\\s[^'"/>\\s]*)*?/?> *(?:\\n{2,}|\\s*$))`).replace("comment", K).replace(/tag/g, "(?!(?:a|em|strong|small|s|cite|q|dfn|abbr|data|time|code|var|samp|kbd|sub|sup|i|b|u|mark|ruby|rt|rp|bdi|bdo|span|br|wbr|ins|del|img)\\b)\\w+(?!:|[^\\w\\s@]*@)\\b").getRegex(), def: /^ *\[([^\]]+)\]: *<?([^\s>]+)>?(?: +(["(][^\n]+[")]))? *(?:\n+|$)/, heading: /^(#{1,6})(.*)(?:\n+|$)/, fences: _, lheading: /^(.+?)\n {0,3}(=+|-+) *(?:\n+|$)/, paragraph: d(F).replace("hr", B).replace("heading", ` *#{1,6} *[^
]`).replace("lheading", ae).replace("|table", "").replace("blockquote", " {0,3}>").replace("|fences", "").replace("|list", "").replace("|html", "").replace("|tag", "").getRegex() };
  Be = /^\\([!"#$%&'()*+,\-./:;<=>?@\[\]\\^_`{|}~])/;
  qe = /^(`+)([^`]|[^`][\s\S]*?[^`])\1(?!`)/;
  ue = /^( {2,}|\\)\n(?!\s*$)/;
  De = /^(`+|[^`])(?:(?= {2,}\n)|[\s\S]*?(?:(?=[\\<!\[`*_]|\b_|$)|[^ ](?= {2,}\n)))/;
  C = /[\p{P}\p{S}]/u;
  Z = /[\s\p{P}\p{S}]/u;
  X = /[^\s\p{P}\p{S}]/u;
  ve = d(/^((?![*_])punctSpace)/, "u").replace(/punctSpace/g, Z).getRegex();
  pe = /(?!~)[\p{P}\p{S}]/u;
  He = /(?!~)[\s\p{P}\p{S}]/u;
  Ze = /(?:[^\s\p{P}\p{S}]|~)/u;
  Ge = d(/link|precode-code|html/, "g").replace("link", /\[(?:[^\[\]`]|(?<a>`+)[^`]+\k<a>(?!`))*?\]\((?:\\[\s\S]|[^\\\(\)]|\((?:\\[\s\S]|[^\\\(\)])*\))*\)/).replace("precode-", Te ? "(?<!`)()" : "(^^|[^`])").replace("code", /(?<b>`+)[^`]+\k<b>(?!`)/).replace("html", /<(?! )[^<>]*?>/).getRegex();
  ce = /^(?:\*+(?:((?!\*)punct)|([^\s*]))?)|^_+(?:((?!_)punct)|([^\s_]))?/;
  Ne = d(ce, "u").replace(/punct/g, C).getRegex();
  Qe = d(ce, "u").replace(/punct/g, pe).getRegex();
  je = d(he, "gu").replace(/notPunctSpace/g, X).replace(/punctSpace/g, Z).replace(/punct/g, C).getRegex();
  Fe = d(he, "gu").replace(/notPunctSpace/g, Ze).replace(/punctSpace/g, He).replace(/punct/g, pe).getRegex();
  Ue = d("^[^_*]*?\\*\\*[^_*]*?_[^_*]*?(?=\\*\\*)|[^_]+(?=[^_])|(?!_)punct(_+)(?=[\\s]|$)|notPunctSpace(_+)(?!_)(?=punctSpace|$)|(?!_)punctSpace(_+)(?=notPunctSpace)|[\\s](_+)(?!_)(?=punct)|(?!_)punct(_+)(?!_)(?=punct)", "gu").replace(/notPunctSpace/g, X).replace(/punctSpace/g, Z).replace(/punct/g, C).getRegex();
  Ke = d(/^~~?(?:((?!~)punct)|[^\s~])/, "u").replace(/punct/g, C).getRegex();
  Xe = d(We, "gu").replace(/notPunctSpace/g, X).replace(/punctSpace/g, Z).replace(/punct/g, C).getRegex();
  Je = d(/\\(punct)/, "gu").replace(/punct/g, C).getRegex();
  Ve = d(/^<(scheme:[^\s\x00-\x1f<>]*|email)>/).replace("scheme", /[a-zA-Z][a-zA-Z0-9+.-]{1,31}/).replace("email", /[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+(@)[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+(?![-_])/).getRegex();
  Ye = d(K).replace("(?:-->|$)", "-->").getRegex();
  et = d("^comment|^</[a-zA-Z][\\w:-]*\\s*>|^<[a-zA-Z][\\w-]*(?:attribute)*?\\s*/?>|^<\\?[\\s\\S]*?\\?>|^<![a-zA-Z]+\\s[\\s\\S]*?>|^<!\\[CDATA\\[[\\s\\S]*?\\]\\]>").replace("comment", Ye).replace("attribute", /\s+[a-zA-Z:_][\w.:-]*(?:\s*=\s*"[^"]*"|\s*=\s*'[^']*'|\s*=\s*[^\s"'=<>`]+)?/).getRegex();
  v = /(?:\[(?:\\[\s\S]|[^\[\]\\])*\]|\\[\s\S]|`+(?!`)[^`]*?`+(?!`)|``+(?=\])|[^\[\]\\`])*?/;
  tt = d(/^!?\[(label)\]\(\s*(href)(?:(?:[ \t]+(?:\n[ \t]*)?|\n[ \t]*)(title))?\s*\)/).replace("label", v).replace("href", /<(?:\\.|[^\n<>\\])+>|[^ \t\n\x00-\x1f]+|(?=\))/).replace("title", /"(?:\\"?|[^"\\])*"|'(?:\\'?|[^'\\])*'|\((?:\\\)?|[^)\\])*\)/).getRegex();
  ke = d(/^!?\[(label)\]\[(ref)\]/).replace("label", v).replace("ref", U).getRegex();
  de = d(/^!?\[(ref)\](?:\[\])?/).replace("ref", U).getRegex();
  nt = d("reflink|nolink(?!\\()", "g").replace("reflink", ke).replace("nolink", de).getRegex();
  ie = /[hH][tT][tT][pP][sS]?|[fF][tT][pP]/;
  J = { _backpedal: _, anyPunctuation: Je, autolink: Ve, blockSkip: Ge, br: ue, code: qe, del: _, delLDelim: _, delRDelim: _, emStrongLDelim: Ne, emStrongRDelimAst: je, emStrongRDelimUnd: Ue, escape: Be, link: tt, nolink: de, punctuation: ve, reflink: ke, reflinkSearch: nt, tag: et, text: De, url: _ };
  rt = { ...J, link: d(/^!?\[(label)\]\((.*?)\)/).replace("label", v).getRegex(), reflink: d(/^!?\[(label)\]\s*\[([^\]]*)\]/).replace("label", v).getRegex() };
  Q = { ...J, emStrongRDelimAst: Fe, emStrongLDelim: Qe, delLDelim: Ke, delRDelim: Xe, url: d(/^((?:protocol):\/\/|www\.)(?:[a-zA-Z0-9\-]+\.?)+[^\s<]*|^email/).replace("protocol", ie).replace("email", /[A-Za-z0-9._+-]+(@)[a-zA-Z0-9-_]+(?:\.[a-zA-Z0-9-_]*[a-zA-Z0-9])+(?![-_])/).getRegex(), _backpedal: /(?:[^?!.,:;*_'"~()&]+|\([^)]*\)|&(?![a-zA-Z0-9]+;$)|[?!.,:;*_'"~)]+(?!$))+/, del: /^(~~?)(?=[^\s~])((?:\\[\s\S]|[^\\])*?(?:\\[\s\S]|[^\s~\\]))\1(?=[^~]|$)/, text: d(/^(`+|~+|[^`~])(?:(?=[`~])|(?= {2,}\n)|(?=[a-zA-Z0-9.!#$%&'*+\/=?_`{\|}~-]+@)|[\s\S]*?(?:(?=[\\<!\[`*~_]|\b_|protocol:\/\/|www\.|$)|[^ ](?= {2,}\n)|[^a-zA-Z0-9.!#$%&'*+\/=?_`{\|}~-](?=[a-zA-Z0-9.!#$%&'*+\/=?_`{\|}~-]+@)))/).replace("protocol", ie).getRegex() };
  st = { ...Q, br: d(ue).replace("{2,}", "*").getRegex(), text: d(Q.text).replace("\\b_", "\\b_| {2,}\\n").replace(/\{2,\}/g, "*").getRegex() };
  q = { normal: W, gfm: Ae, pedantic: Ie };
  A = { normal: J, gfm: Q, breaks: st, pedantic: rt };
  it = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };
  P = class {
    options;
    block;
    constructor(e) {
      this.options = e || T;
    }
    static passThroughHooks = new Set(["preprocess", "postprocess", "processAllTokens", "emStrongMask"]);
    static passThroughHooksRespectAsync = new Set(["preprocess", "postprocess", "processAllTokens"]);
    preprocess(e) {
      return e;
    }
    postprocess(e) {
      return e;
    }
    processAllTokens(e) {
      return e;
    }
    emStrongMask(e) {
      return e;
    }
    provideLexer(e = this.block) {
      return e ? x.lex : x.lexInline;
    }
    provideParser(e = this.block) {
      return e ? b.parse : b.parseInline;
    }
  };
  M = new D;
  g.options = g.setOptions = function(l3) {
    return M.setOptions(l3), g.defaults = M.defaults, N(g.defaults), g;
  };
  g.getDefaults = z;
  g.defaults = T;
  g.use = function(...l3) {
    return M.use(...l3), g.defaults = M.defaults, N(g.defaults), g;
  };
  g.walkTokens = function(l3, e) {
    return M.walkTokens(l3, e);
  };
  g.parseInline = M.parseInline;
  g.Parser = b;
  g.parser = b.parse;
  g.Renderer = y;
  g.TextRenderer = L;
  g.Lexer = x;
  g.lexer = x.lex;
  g.Tokenizer = w;
  g.Hooks = P;
  g.parse = g;
  Kt = g.options;
  Wt = g.setOptions;
  Xt = g.use;
  Jt = g.walkTokens;
  Vt = g.parseInline;
  en = b.parse;
  tn = x.lex;
});

// packages/core/dist/wiki/index.js
import { readFileSync as readFileSync3 } from "node:fs";

class WikiService {
  #db;
  constructor(database) {
    this.#db = database;
  }
  save(page) {
    const result = this.#db.run("INSERT INTO wiki_pages(path, content, updated_at) VALUES (?, ?, CURRENT_TIMESTAMP) ON CONFLICT(path) DO UPDATE SET content = excluded.content, updated_at = CURRENT_TIMESTAMP", [page.path, JSON.stringify(page)]);
    return result.isErr() ? result : ok(undefined);
  }
  get(path3) {
    const result = this.#db.get("SELECT content FROM wiki_pages WHERE path = ?", [path3]);
    if (result.isErr())
      return result;
    const page = result.value;
    if (!page)
      return ok(null);
    const parsed = safeCall(() => JSON.parse(page.content), () => ({ kind: -1 }));
    return ok(parsed.isOk() ? parsed.value : { path: path3, title: path3, summary: "", content: page.content });
  }
  list() {
    const result = this.#db.all("SELECT content FROM wiki_pages ORDER BY path");
    if (result.isErr())
      return result;
    return ok(result.value.map((row) => safeCall(() => JSON.parse(row.content), () => ({ kind: -1 })).unwrapOr(undefined)).filter((page) => page !== undefined));
  }
  remove(path3) {
    const result = this.#db.run("DELETE FROM wiki_pages WHERE path = ?", [
      path3
    ]);
    return result.isErr() ? result : ok(undefined);
  }
  render(markdown) {
    return g.parse(markdown, { async: false });
  }
  source(nodeId) {
    const result = this.#db.get("SELECT file_path,line_start,line_end,offset_start,offset_end,metadata_json FROM nodes WHERE id = ?", [nodeId]);
    if (result.isErr())
      return result;
    if (!result.value)
      return ok(null);
    try {
      const metadata = JSON.parse(result.value.metadata_json || "{}");
      if (metadata.source_code)
        return ok(metadata.source_code);
      const content = readFileSync3(result.value.file_path, "utf8");
      if (result.value.offset_start !== null && result.value.offset_end !== null && result.value.offset_start >= 0 && result.value.offset_end >= result.value.offset_start)
        return ok(content.slice(result.value.offset_start, result.value.offset_end));
      const lines = content.split(/\r?\n/);
      return ok(lines.slice(result.value.line_start - 1, result.value.line_end).join(`
`));
    } catch {
      return ok(null);
    }
  }
  generate(repoHash) {
    const cleared = this.#db.run("DELETE FROM wiki_pages WHERE path IN (SELECT id FROM nodes WHERE repo_hash = ?)", [repoHash]);
    if (cleared.isErr())
      return cleared;
    const nodes = this.#db.all("SELECT id,name,kind,file_path,line_start,line_end,hierarchy_level,metadata_json FROM nodes WHERE repo_hash = ? AND kind NOT IN ('module','export_statement','event')", [repoHash]);
    if (nodes.isErr())
      return nodes;
    let generated = 0;
    for (const node of nodes.value) {
      let metadata = {};
      try {
        metadata = JSON.parse(node.metadata_json || "{}");
      } catch {}
      const doc = typeof metadata.doc === "string" ? this.#cleanDocumentation(metadata.doc) : "";
      if (!doc)
        continue;
      const summary = doc.split(/\r?\n/).find((line) => line.trim()) ?? "";
      const content = [`# ${node.name}`, "", doc].join(`
`);
      const saved = this.save({
        path: node.id,
        title: node.name,
        summary,
        content
      });
      if (saved.isErr())
        return saved;
      generated++;
    }
    return ok(generated);
  }
  #cleanDocumentation(value) {
    return value.replace(/^\s*\/\*\*?/, "").replace(/\*\/\s*$/, "").split(/\r?\n/).map((line) => line.replace(/^\s*\* ?/, "").replace(/^\s*# ?/, "")).join(`
`).trim();
  }
}
var init_wiki = __esm(() => {
  init_marked_esm();
  init_esm();
  init_db();
});

// packages/core/dist/knowledge/index.js
class KnowledgeService {
  #db;
  constructor(database) {
    this.#db = database;
  }
  async answer(repoHash, question) {
    const search = new SearchService(this.#db).search(repoHash, question);
    if (search.isErr())
      return {
        answer: `Search failed: ${String(search.error)}`,
        sources: [],
        usedLlm: false
      };
    const repository = new GraphRepository(this.#db);
    const wiki = new WikiService(this.#db);
    const candidates = [];
    for (const item of search.value.slice(0, 8)) {
      const node = repository.getNode(item.id);
      if (node.isErr() || !node.value)
        continue;
      const source = wiki.source(item.id);
      candidates.push({
        node: node.value,
        source: source.isOk() ? source.value ?? "" : ""
      });
    }
    const sources = candidates.map(({ node }) => ({
      id: node.id,
      name: node.name,
      filePath: node.file_path
    }));
    if (!candidates.length)
      return {
        answer: "No matching symbols were found.",
        sources,
        usedLlm: false
      };
    const context = candidates.map(({ node, source }) => `## ${node.name} (${node.kind})
${node.file_path}:${node.line_start}-${node.line_end}
${String(node.metadata.summary ?? "")}
\`\`\`
${source.slice(0, 3000)}
\`\`\``).join(`

`);
    const llm = await this.#llm(`Answer the codebase question using only the supplied symbols. Cite symbol names and file paths.

Question: ${question}

${context}`);
    if (llm)
      return { answer: llm, sources, usedLlm: true };
    return {
      answer: candidates.map(({ node }) => `${node.name} (${node.kind}) — ${node.file_path}:${node.line_start}`).join(`
`),
      sources,
      usedLlm: false
    };
  }
  async concept(repoHash, nodeIds, question = "Explain how these symbols fit together.") {
    const repository = new GraphRepository(this.#db);
    const wiki = new WikiService(this.#db);
    const candidates = nodeIds.flatMap((id) => {
      const node = repository.getNode(id);
      if (node.isErr() || !node.value)
        return [];
      const source = wiki.source(id);
      return [
        { node: node.value, source: source.isOk() ? source.value ?? "" : "" }
      ];
    });
    const sources = candidates.map(({ node }) => ({
      id: node.id,
      name: node.name,
      filePath: node.file_path
    }));
    const prompt = `${question}

${candidates.map(({ node, source }) => `${node.name} ${node.file_path}
${source}`).join(`

`)}`;
    const answer = await this.#llm(prompt);
    return {
      answer: answer ?? sources.map((source) => `${source.name}: ${source.filePath}`).join(`
`),
      sources,
      usedLlm: Boolean(answer)
    };
  }
  async enrich(repoHash, options = {}) {
    if (!(process.env.VEDH_LLM_URL ?? process.env.OPENAI_BASE_URL))
      return 0;
    const rows = this.#db.all(`SELECT id,name,kind,file_path,metadata_json FROM nodes WHERE repo_hash=? ${options.importsExportsOnly ? "AND kind IN ('module','export_statement')" : "AND kind!='event'"}`, [repoHash]);
    if (rows.isErr())
      return 0;
    let cursor = 0;
    let enriched = 0;
    const worker = async () => {
      for (;; ) {
        const index = cursor++;
        if (index >= rows.value.length)
          return;
        const row = rows.value[index];
        let metadata = {};
        try {
          metadata = JSON.parse(row.metadata_json || "{}");
        } catch {}
        const source = String(metadata.source_code ?? "");
        if (!source)
          continue;
        const answer = await this.#llm(`Summarize this ${row.kind} in one precise sentence. Describe behavior, not syntax.

${source.slice(0, 8000)}`);
        if (!answer)
          continue;
        metadata.summary = answer;
        if (options.generateMissingDocs && !metadata.doc)
          metadata.generated_doc = await this.#llm(`Write a concise documentation comment for this ${row.kind}. Return only the comment text.

${source.slice(0, 8000)}`) ?? "";
        const updated = this.#db.run("UPDATE nodes SET metadata_json=? WHERE id=?", [JSON.stringify(metadata), row.id]);
        if (updated.isOk())
          enriched++;
      }
    };
    await Promise.all(Array.from({ length: Math.max(1, options.concurrency ?? 4) }, worker));
    return enriched;
  }
  async#llm(prompt) {
    const base = process.env.VEDH_LLM_URL ?? process.env.OPENAI_BASE_URL;
    if (!base)
      return null;
    const endpoint = base.endsWith("/chat/completions") ? base : `${base.replace(/\/$/, "")}/chat/completions`;
    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          ...process.env.OPENAI_API_KEY ? { authorization: `Bearer ${process.env.OPENAI_API_KEY}` } : {}
        },
        body: JSON.stringify({
          model: process.env.VEDH_LLM_MODEL ?? process.env.OPENAI_MODEL ?? "gpt-4.1-mini",
          messages: [{ role: "user", content: prompt }],
          temperature: 0.2
        })
      });
      if (!response.ok)
        return null;
      const body = await response.json();
      return body.choices?.[0]?.message?.content?.trim() || null;
    } catch {
      return null;
    }
  }
}
var init_knowledge = __esm(() => {
  init_db();
  init_repository();
  init_search();
  init_wiki();
});

// packages/core/dist/discovery/index.js
import { existsSync as existsSync3, readFileSync as readFileSync4, realpathSync, readdirSync, statSync as statSync2 } from "node:fs";
import { spawnSync as spawnSync2 } from "node:child_process";
import { join as join3, relative as relative2, resolve as resolve2, sep } from "node:path";

class ProjectDiscovery {
  discover(projectRoot, options) {
    const root = resolve2(projectRoot);
    const extensions = new Set(options.extensions.map((extension4) => extension4.toLowerCase()));
    const excludes = new Set(options.excludedDirectories ?? [
      ".git",
      ".vedh",
      ".michi",
      "node_modules",
      "dist",
      "build",
      "coverage",
      ".next",
      ".cache"
    ]);
    const patterns = this.#ignorePatterns(root);
    const visited = new Set;
    const files = [];
    const visit = (directory) => {
      let real;
      try {
        real = realpathSync(directory);
      } catch {
        return;
      }
      if (visited.has(real))
        return;
      visited.add(real);
      for (const entry of readdirSync(directory, { withFileTypes: true })) {
        if (excludes.has(entry.name))
          continue;
        const child = join3(directory, entry.name);
        const rel = relative2(root, child).split(sep).join("/");
        if (this.#ignored(rel, entry.isDirectory(), patterns))
          continue;
        if (entry.isSymbolicLink()) {
          try {
            const stat2 = statSync2(child);
            if (stat2.isDirectory())
              visit(child);
          } catch {}
        } else if (entry.isDirectory())
          visit(child);
        else if (extensions.has(this.#extension(entry.name)))
          files.push(resolve2(child));
      }
    };
    visit(root);
    const gitIgnored = this.#gitIgnored(root, files);
    const workspaces = this.#workspaces(root);
    return {
      files: files.filter((file) => !gitIgnored.has(file)).sort(),
      workspaces,
      workspacePackages: Object.fromEntries(workspaces.map((workspace) => [workspace.name, workspace.directory]))
    };
  }
  #gitIgnored(root, files) {
    if (!existsSync3(join3(root, ".git")) || !files.length)
      return new Set;
    const relativeFiles = files.map((file) => relative2(root, file).split(sep).join("/"));
    const result = spawnSync2("git", ["-C", root, "check-ignore", "--stdin", "-z"], { input: `${relativeFiles.join("\x00")}\x00`, encoding: "utf8" });
    if (result.status !== 0 && result.status !== 1)
      return new Set;
    return new Set(result.stdout.split("\x00").filter(Boolean).map((file) => resolve2(root, file)));
  }
  projectRootForFile(filePath, result, fallback) {
    return result.workspaces.filter((workspace) => filePath === workspace.directory || filePath.startsWith(`${workspace.directory}${sep}`)).sort((a, b2) => b2.directory.length - a.directory.length)[0]?.directory ?? fallback;
  }
  #extension(name) {
    const index = name.lastIndexOf(".");
    return index < 0 ? "" : name.slice(index).toLowerCase();
  }
  #ignorePatterns(root) {
    const patterns = [];
    for (const file of [".gitignore", ".vedhignore", ".michiignore"]) {
      const path3 = join3(root, file);
      if (!existsSync3(path3))
        continue;
      patterns.push(...readFileSync4(path3, "utf8").split(/\r?\n/).map((line) => line.trim()).filter((line) => line && !line.startsWith("#")));
    }
    return patterns;
  }
  #ignored(path3, directory, patterns) {
    let ignored = false;
    for (const raw of patterns) {
      const negated = raw.startsWith("!");
      const pattern = negated ? raw.slice(1) : raw;
      if (!pattern)
        continue;
      const directoryOnly = pattern.endsWith("/");
      if (directoryOnly && !directory)
        continue;
      const clean = pattern.replace(/^\//, "").replace(/\/$/, "");
      const regex = new RegExp(`^(?:.*/)?${clean.replace(/[.+^${}()|[\]\\]/g, "\\$&").replace(/\*\*/g, "§§").replace(/\*/g, "[^/]*").replace(/§§/g, ".*")}(?:/.*)?$`);
      if (regex.test(path3))
        ignored = !negated;
    }
    return ignored;
  }
  #workspaces(root) {
    const packageJson = join3(root, "package.json");
    if (!existsSync3(packageJson))
      return [];
    try {
      const parsed = JSON.parse(readFileSync4(packageJson, "utf8"));
      const patterns = Array.isArray(parsed.workspaces) ? parsed.workspaces : parsed.workspaces?.packages ?? [];
      const directories = new Set;
      for (const pattern of patterns) {
        const star = pattern.indexOf("*");
        if (star < 0)
          directories.add(resolve2(root, pattern));
        else {
          const parent = resolve2(root, pattern.slice(0, star).replace(/\/$/, ""));
          if (!existsSync3(parent))
            continue;
          for (const entry of readdirSync(parent, { withFileTypes: true }))
            if (entry.isDirectory())
              directories.add(join3(parent, entry.name, pattern.slice(star + 1)));
        }
      }
      return [...directories].flatMap((directory) => {
        const manifest = join3(directory, "package.json");
        if (!existsSync3(manifest))
          return [];
        try {
          const value = JSON.parse(readFileSync4(manifest, "utf8"));
          return value.name ? [{ name: value.name, directory: resolve2(directory) }] : [];
        } catch {
          return [];
        }
      });
    } catch {
      return [];
    }
  }
}
var init_discovery = () => {};

// packages/core/dist/callgraph/index.js
import { existsSync as existsSync4, readFileSync as readFileSync5, readdirSync as readdirSync2 } from "node:fs";
import { extname as extname2, join as join4, resolve as resolve3 } from "node:path";

class CallGraphService {
  #db;
  constructor(database) {
    this.#db = database;
  }
  chain(nodeId, maxDepth = 3) {
    const root = this.#node(nodeId);
    if (root.isErr())
      return root;
    const callers = [];
    const callees = [];
    const edgeMap = new Map;
    const walk = (id, depth, direction, visited) => {
      if (depth >= maxDepth || visited.has(id))
        return ok(undefined);
      visited.add(id);
      const edges = this.#db.all(direction === "caller" ? `SELECT * FROM edges WHERE target = ? AND type IN ('calls','constructor','fires_hook','dispatches')` : `SELECT * FROM edges WHERE source = ? AND type IN ('calls','constructor','fires_hook','dispatches')`, [id]);
      if (edges.isErr())
        return edges;
      for (const edge of edges.value) {
        edgeMap.set(`${edge.source}\x00${edge.target}\x00${edge.type}`, edge);
        const next = direction === "caller" ? edge.source : edge.target;
        if (visited.has(next))
          continue;
        const node = this.#node(next);
        if (node.isErr())
          return node;
        if (node.value)
          (direction === "caller" ? callers : callees).push({
            node: node.value,
            depth: depth + 1,
            direction,
            callSites: this.#sites(edge)
          });
        const nested = walk(next, depth + 1, direction, visited);
        if (nested.isErr())
          return nested;
      }
      return ok(undefined);
    };
    const incoming = walk(nodeId, 0, "caller", new Set);
    if (incoming.isErr())
      return incoming;
    const outgoing = walk(nodeId, 0, "callee", new Set);
    if (outgoing.isErr())
      return outgoing;
    return ok({
      root: root.value,
      callers,
      callees,
      edges: [...edgeMap.values()]
    });
  }
  entryNodes(repoHash) {
    const manifestFiles = this.#manifestEntryFiles(repoHash);
    if (manifestFiles.length) {
      const placeholders = manifestFiles.map(() => "?").join(",");
      const manifestEntries = this.#db.all(`SELECT n.* FROM nodes n
         WHERE n.repo_hash = ? AND n.file_path IN (${placeholders}) AND (
           (n.parent_id IS NULL AND (
             n.kind LIKE '%function%' OR n.kind LIKE '%class%' OR n.kind = 'variable_declarator'
           )) OR (
             n.kind = 'module' AND NOT EXISTS (
               SELECT 1 FROM nodes executable
               WHERE executable.repo_hash = n.repo_hash AND executable.file_path = n.file_path
                 AND executable.parent_id IS NULL AND (
                   executable.kind LIKE '%function%' OR executable.kind LIKE '%class%' OR executable.kind = 'variable_declarator'
                 )
             )
           )
         )
         ORDER BY n.hierarchy_level = 'god' DESC, n.file_path, n.line_start LIMIT 40`, [repoHash, ...manifestFiles]);
      if (manifestEntries.isErr())
        return manifestEntries;
      if (manifestEntries.value.length)
        return ok(manifestEntries.value.map((row) => ({
          node: this.#map(row),
          reason: "package-entry"
        })));
    }
    const conventional = this.#db.all(`SELECT n.* FROM nodes n WHERE n.repo_hash = ? AND n.kind != 'module' AND n.parent_id IS NULL AND
      (lower(n.file_path) GLOB '*main.*' OR lower(n.file_path) GLOB '*index.*' OR lower(n.file_path) GLOB '*server.*' OR lower(n.file_path) GLOB '*app.*')
      ORDER BY n.hierarchy_level = 'god' DESC, n.line_start LIMIT 20`, [repoHash]);
    if (conventional.isErr())
      return conventional;
    if (conventional.value.length)
      return ok(conventional.value.map((row) => ({
        node: this.#map(row),
        reason: "entry-file"
      })));
    const roots = this.#db.all(`SELECT n.* FROM nodes n WHERE n.repo_hash = ? AND n.kind != 'module' AND n.parent_id IS NULL AND n.hierarchy_level IN ('god','high') AND
      NOT EXISTS (SELECT 1 FROM edges e WHERE e.target = n.id AND e.type IN ('calls','constructor','fires_hook','dispatches')) ORDER BY n.hierarchy_level = 'god' DESC, n.file_path LIMIT 20`, [repoHash]);
    if (roots.isErr())
      return roots;
    return ok(roots.value.map((row) => ({ node: this.#map(row), reason: "no-callers" })));
  }
  flow(repoHash, maxDepth = 5) {
    const entries = this.entryNodes(repoHash);
    if (entries.isErr())
      return entries;
    const visited = new Set;
    const flow = [];
    const edgeMap = new Map;
    const queue = [];
    for (const entry of entries.value) {
      visited.add(entry.node.id);
      flow.push({ node: entry.node, depth: 0, callSites: [] });
      queue.push({ id: entry.node.id, depth: 0 });
    }
    for (let head = 0;head < queue.length && visited.size < 2000; head += 1) {
      const current = queue[head];
      if (current.depth >= maxDepth)
        continue;
      const edges = this.#db.all(`SELECT * FROM edges WHERE source = ? AND type IN ('calls','constructor','fires_hook','dispatches')`, [current.id]);
      if (edges.isErr())
        return edges;
      for (const edge of edges.value) {
        edgeMap.set(`${edge.source}\x00${edge.target}\x00${edge.type}`, edge);
        if (visited.has(edge.target))
          continue;
        const node = this.#node(edge.target);
        if (node.isErr())
          return node;
        if (!node.value)
          continue;
        visited.add(edge.target);
        flow.push({
          node: node.value,
          depth: current.depth + 1,
          parentId: current.id,
          callSites: this.#sites(edge)
        });
        queue.push({
          id: edge.target,
          depth: current.depth + 1,
          parentId: current.id
        });
      }
    }
    return ok({
      entries: entries.value,
      flow,
      edges: [...edgeMap.values()]
    });
  }
  #node(id) {
    const row = this.#db.get("SELECT * FROM nodes WHERE id = ?", [id]);
    return row.isErr() ? row : ok(row.value ? this.#map(row.value) : null);
  }
  #manifestEntryFiles(repoHash) {
    const repo = this.#db.get("SELECT url FROM repos WHERE repo_hash = ? LIMIT 1", [repoHash]);
    if (repo.isErr() || !repo.value?.url || !existsSync4(repo.value.url))
      return [];
    const root = repo.value.url;
    const rootManifest = this.#readManifest(join4(root, "package.json"));
    if (!rootManifest)
      return [];
    const manifests = [{ directory: root, value: rootManifest }];
    const workspacePatterns = Array.isArray(rootManifest.workspaces) ? rootManifest.workspaces : rootManifest.workspaces && typeof rootManifest.workspaces === "object" && Array.isArray(rootManifest.workspaces.packages) ? rootManifest.workspaces.packages : [];
    for (const pattern of workspacePatterns) {
      if (typeof pattern !== "string")
        continue;
      for (const directory of this.#expandWorkspace(root, pattern)) {
        const value = this.#readManifest(join4(directory, "package.json"));
        if (value)
          manifests.push({ directory, value });
      }
    }
    const indexedFiles = this.#db.all("SELECT DISTINCT file_path FROM nodes WHERE repo_hash = ?", [repoHash]);
    if (indexedFiles.isErr())
      return [];
    const known = new Set(indexedFiles.value.map((row) => row.file_path));
    const entries = new Set;
    for (const manifest of manifests) {
      const values = [
        ...this.#manifestStrings(manifest.value.main),
        ...this.#manifestStrings(manifest.value.module),
        ...this.#manifestStrings(manifest.value.bin),
        ...this.#manifestStrings(manifest.value.exports)
      ];
      const start = manifest.value.scripts?.start;
      if (typeof start === "string")
        values.push(...start.split(/\s+/).filter((part) => /^(?:\.\/)?[\w@/-]+\.[cm]?[jt]sx?$/.test(part)));
      for (const value of values) {
        for (const candidate of this.#entryCandidates(manifest.directory, value)) {
          if (known.has(candidate))
            entries.add(candidate);
        }
      }
    }
    return [...entries];
  }
  #readManifest(path3) {
    if (!existsSync4(path3))
      return null;
    try {
      return JSON.parse(readFileSync5(path3, "utf8"));
    } catch {
      return null;
    }
  }
  #expandWorkspace(root, pattern) {
    const segments = pattern.replaceAll("\\", "/").split("/").filter(Boolean);
    let directories = [root];
    for (const segment of segments) {
      const next = [];
      for (const directory of directories) {
        if (segment === "*") {
          if (!existsSync4(directory))
            continue;
          for (const entry of readdirSync2(directory, { withFileTypes: true }))
            if (entry.isDirectory())
              next.push(join4(directory, entry.name));
        } else if (!segment.includes("*")) {
          next.push(join4(directory, segment));
        }
      }
      directories = next;
    }
    return directories;
  }
  #manifestStrings(value) {
    if (typeof value === "string")
      return [value];
    if (Array.isArray(value))
      return value.flatMap((item) => this.#manifestStrings(item));
    if (!value || typeof value !== "object")
      return [];
    return Object.values(value).flatMap((item) => this.#manifestStrings(item));
  }
  #entryCandidates(directory, value) {
    const clean = value.replace(/^\.\//, "").split("#")[0];
    const exact = resolve3(directory, clean);
    const extension4 = extname2(exact);
    const stem = extension4 ? exact.slice(0, -extension4.length) : exact;
    const candidates = new Set([exact]);
    for (const suffix of [".ts", ".tsx", ".js", ".jsx", ".mts", ".cts"])
      candidates.add(`${stem}${suffix}`);
    if (clean.startsWith("dist/")) {
      const sourceStem = resolve3(directory, "src", clean.slice(5));
      const sourceExtension = extname2(sourceStem);
      const withoutExtension = sourceExtension ? sourceStem.slice(0, -sourceExtension.length) : sourceStem;
      for (const suffix of [".ts", ".tsx", ".js", ".jsx", ".mts", ".cts"])
        candidates.add(`${withoutExtension}${suffix}`);
    }
    if (!extension4)
      for (const suffix of ["index.ts", "index.tsx", "index.js", "index.jsx"])
        candidates.add(join4(exact, suffix));
    return [...candidates];
  }
  #map(row) {
    const parsed = safeCall(() => JSON.parse(row.metadata_json), () => ({ kind: -1 }));
    const node = {
      ...row
    };
    delete node.metadata_json;
    return { ...node, metadata: parsed.isOk() ? parsed.value : {} };
  }
  #sites(edge) {
    try {
      const metadata = JSON.parse(edge.metadata_json ?? "{}");
      return metadata.call_sites?.length ? metadata.call_sites : metadata.call_site ? [metadata.call_site] : [];
    } catch {
      return [];
    }
  }
}
var init_callgraph = __esm(() => {
  init_esm();
  init_db();
});

// packages/core/dist/index.js
var init_dist2 = __esm(() => {
  init_db();
  init_repository();
  init_graph();
  init_search();
  init_analysis();
  init_indexer();
  init_wiki();
  init_knowledge();
  init_discovery();
  init_callgraph();
});

// packages/mcp/dist/index.js
var exports_dist2 = {};
__export(exports_dist2, {
  startMcpServer: () => startMcpServer
});
import { createHash as createHash3 } from "node:crypto";
import { spawnSync as spawnSync4 } from "node:child_process";
import { resolve as resolve5 } from "node:path";
function schema(properties) {
  const required = Object.entries(properties).filter(([, type]) => !type.endsWith("?")).map(([name]) => name);
  return {
    type: "object",
    properties: Object.fromEntries(Object.entries(properties).map(([name, raw]) => {
      const type = raw.replace("?", "");
      return [name, { type }];
    })),
    ...required.length ? { required } : {}
  };
}
function startMcpServer(projectDirectory, dataDir) {
  const projectDir = resolve5(projectDirectory);
  const repoHash = createHash3("sha256").update(projectDir).digest("hex").slice(0, 16);
  const opened = CoreDatabase.open({ repoHash, projectDir, dataDir });
  if (opened.isErr())
    throw new Error("Unable to open Vedh graph database");
  const db = opened.value;
  const repository = new GraphRepository(db);
  const graph = new GraphService(db);
  const callGraph = new CallGraphService(db);
  const analysis = new AnalysisService(db);
  const wiki = new WikiService(db);
  const send = (message) => process.stdout.write(`${JSON.stringify(message)}
`);
  const result = (id, value) => send({ jsonrpc: "2.0", id, result: value });
  const error = (id, message) => send({ jsonrpc: "2.0", id, error: { code: -32000, message } });
  let buffer = "";
  process.stdin.setEncoding("utf8");
  process.stdin.on("data", (chunk) => {
    buffer += chunk;
    for (;; ) {
      const newline = buffer.indexOf(`
`);
      if (newline < 0)
        break;
      const line = buffer.slice(0, newline).trim();
      buffer = buffer.slice(newline + 1);
      if (!line)
        continue;
      (async () => {
        let request;
        try {
          request = JSON.parse(line);
        } catch {
          return error(undefined, "Invalid JSON");
        }
        try {
          if (request.method === "initialize")
            return result(request.id, {
              protocolVersion: "2025-03-26",
              capabilities: { tools: {} },
              serverInfo: { name: "vedh-mcp", version: "0.1.0" }
            });
          if (request.method === "notifications/initialized")
            return;
          if (request.method === "tools/list")
            return result(request.id, {
              tools: TOOLS.map(([name, description, properties]) => ({
                name,
                description,
                inputSchema: schema(properties)
              }))
            });
          if (request.method !== "tools/call")
            return error(request.id, `Unknown method: ${request.method}`);
          const params = request.params;
          const value = await callTool(params?.name ?? "", params?.arguments ?? {});
          return result(request.id, {
            content: [{ type: "text", text: JSON.stringify(value, null, 2) }]
          });
        } catch (cause) {
          return error(request.id, cause instanceof Error ? cause.message : String(cause));
        }
      })();
    }
  });
  process.on("exit", () => db.close());
  async function callTool(name, args) {
    const limit = Math.max(1, Number(args.limit) || 100);
    if (name === "search_nodes")
      return unwrap(new SearchService(db).search(repoHash, String(args.query ?? ""))).slice(0, limit);
    if (name === "get_node")
      return unwrap(repository.getNode(String(args.node_id)));
    if (name === "get_callers" || name === "get_callees") {
      const chain = unwrap(callGraph.chain(String(args.node_id), Number(args.depth) || 3));
      return name === "get_callers" ? chain.callers : chain.callees;
    }
    if (name === "read_source")
      return { source: unwrap(wiki.source(String(args.node_id))) };
    if (name === "get_wiki")
      return unwrap(wiki.get(String(args.node_id)));
    if (name === "get_god_nodes")
      return unwrap(analysis.godNodes(repoHash)).slice(0, limit);
    if (name === "get_shortest_path")
      return unwrap(graph.shortestPath(String(args.from_id), String(args.to_id)));
    if (name === "get_flow_from_entry")
      return unwrap(callGraph.flow(repoHash, Number(args.depth) || 5));
    if (name === "bfs_subgraph") {
      const traversal = args.mode === "dfs" ? graph.walk.bind(graph) : graph.impact.bind(graph);
      return unwrap(traversal(String(args.node_id), {
        maxDepth: Number(args.depth) || 2,
        edgeTypes: String(args.edge_types ?? "").split(",").filter(Boolean)
      }));
    }
    if (name === "get_dependency_tree") {
      const nodeId = String(args.node_id);
      const depth = Number(args.depth) || 3;
      if (args.direction === "both" || args.direction === undefined)
        return {
          dependencies: unwrap(graph.dependencyTree(nodeId, "out", depth, limit)),
          dependents: unwrap(graph.dependencyTree(nodeId, "in", depth, limit))
        };
      return unwrap(graph.dependencyTree(nodeId, args.direction === "in" ? "in" : "out", depth, limit));
    }
    if (name === "list_communities")
      return unwrap(analysis.communities(repoHash, limit));
    if (name === "get_community_members")
      return unwrap(analysis.communityMembers(repoHash, Number(args.community_id), limit));
    if (name === "get_cross_community_edges")
      return unwrap(analysis.crossCommunityEdges(repoHash, Number(args.community_a), Number(args.community_b), limit));
    if (name === "find_hook_callsites") {
      const hooks = unwrap(db.all("SELECT id,name FROM nodes WHERE repo_hash=? AND kind='event' AND name LIKE ? LIMIT ?", [repoHash, `%${String(args.pattern ?? "")}%`, limit]));
      return hooks.map((hook) => ({
        ...hook,
        edges: unwrap(db.all("SELECT * FROM edges WHERE source=? OR target=?", [
          hook.id,
          hook.id
        ]))
      }));
    }
    if (name === "find_call_sites") {
      const definitions = unwrap(db.all("SELECT id,name FROM nodes WHERE repo_hash=? AND name LIKE ? AND kind NOT IN ('module','event') LIMIT 50", [repoHash, `%${String(args.name)}%`]));
      return definitions.flatMap((definition) => unwrap(db.all("SELECT * FROM edges WHERE target=? AND type IN ('calls','constructor') LIMIT ?", [definition.id, limit])));
    }
    if (name === "get_snapshot") {
      const repo = unwrap(db.get("SELECT indexed_at,commit_hash,node_count,file_count,schema_version FROM repos WHERE repo_hash=?", [repoHash]));
      const head = spawnSync4("git", ["-C", projectDir, "rev-parse", "HEAD"], {
        encoding: "utf8"
      });
      const currentCommit = head.status === 0 ? head.stdout.trim() : null;
      return {
        ...repo,
        parserSchemaVersion: INDEX_SCHEMA_VERSION,
        currentCommit,
        schemaStale: Boolean(repo?.schema_version && repo.schema_version !== INDEX_SCHEMA_VERSION),
        stale: Boolean(repo?.commit_hash && currentCommit && repo.commit_hash !== currentCommit) || Boolean(repo?.schema_version && repo.schema_version !== INDEX_SCHEMA_VERSION)
      };
    }
    throw new Error(`Unknown tool: ${name}`);
  }
}
function unwrap(value) {
  if (value.isErr())
    throw new Error(String(value.error));
  return value.value;
}
var TOOLS;
var init_dist3 = __esm(() => {
  init_dist2();
  TOOLS = [
    [
      "search_nodes",
      "Search symbols by name, path, docs, or summary",
      { query: "string", limit: "number?" }
    ],
    ["get_node", "Get a symbol node by id", { node_id: "string" }],
    [
      "get_callers",
      "Get transitive callers",
      { node_id: "string", depth: "number?" }
    ],
    [
      "get_callees",
      "Get transitive callees",
      { node_id: "string", depth: "number?" }
    ],
    ["read_source", "Read source for a symbol", { node_id: "string" }],
    [
      "get_wiki",
      "Get generated documentation for a symbol",
      { node_id: "string" }
    ],
    [
      "get_god_nodes",
      "Get highly connected architectural nodes",
      { limit: "number?" }
    ],
    [
      "get_shortest_path",
      "Find a graph path between symbols",
      { from_id: "string", to_id: "string" }
    ],
    [
      "get_flow_from_entry",
      "Trace execution from detected entry points",
      { depth: "number?" }
    ],
    [
      "bfs_subgraph",
      "Traverse a bounded graph neighborhood with BFS or DFS",
      {
        node_id: "string",
        depth: "number?",
        mode: "string?",
        edge_types: "string?"
      }
    ],
    [
      "get_dependency_tree",
      "Get a nested dependency tree",
      {
        node_id: "string",
        direction: "string?",
        depth: "number?",
        limit: "number?"
      }
    ],
    ["list_communities", "List detected code communities", { limit: "number?" }],
    [
      "get_community_members",
      "List members of one community",
      { community_id: "number", limit: "number?" }
    ],
    [
      "get_cross_community_edges",
      "Show coupling between communities",
      { community_a: "number", community_b: "number", limit: "number?" }
    ],
    [
      "find_hook_callsites",
      "Find event fire and listener sites",
      { pattern: "string", limit: "number?" }
    ],
    [
      "find_call_sites",
      "Find every recorded call site by target name",
      { name: "string", limit: "number?" }
    ],
    ["get_snapshot", "Report graph freshness against the checkout", {}]
  ];
});

// packages/viz/dist/http/respond.js
function fromResult(response, result) {
  return result.isErr() ? json(response, { error: String(result.error) }, 500) : json(response, result.value);
}
function json(response, value, status = 200) {
  response.writeHead(status, {
    "access-control-allow-origin": "*",
    "content-type": "application/json; charset=utf-8"
  });
  response.end(JSON.stringify(value));
}
function readBody(request) {
  return new Promise((resolve6) => {
    let body = "";
    request.setEncoding("utf8");
    request.on("data", (chunk) => body += chunk);
    request.on("end", () => {
      try {
        resolve6(JSON.parse(body));
      } catch {
        resolve6({});
      }
    });
  });
}

// packages/viz/dist/http/router.js
async function routeApi(request, response, url, context) {
  const { pathname, searchParams } = url;
  const { repoHash, graph, repository, calls, analysis, wiki, search, knowledge } = context;
  if (pathname === "/api/health") {
    json(response, { status: "ok", repoHash });
    return true;
  }
  if (pathname === "/api/graph") {
    fromResult(response, graph.subgraph(repoHash));
    return true;
  }
  if (pathname === "/api/communities") {
    fromResult(response, analysis.communities(repoHash, Number(searchParams.get("limit")) || 50));
    return true;
  }
  if (pathname === "/api/report") {
    const gods = analysis.godNodes(repoHash);
    const communities = analysis.communities(repoHash);
    const subgraph2 = graph.subgraph(repoHash);
    if (gods.isErr() || communities.isErr() || subgraph2.isErr()) {
      json(response, { error: "Report unavailable" }, 500);
    } else {
      json(response, {
        godNodes: gods.value,
        communities: communities.value,
        totalNodes: subgraph2.value.nodes.length,
        totalEdges: subgraph2.value.edges.length
      });
    }
    return true;
  }
  if (pathname === "/api/execution/flow") {
    fromResult(response, calls.flow(repoHash, Number(searchParams.get("depth")) || 5));
    return true;
  }
  if (pathname === "/api/search") {
    fromResult(response, search.search(repoHash, searchParams.get("q") ?? ""));
    return true;
  }
  const chain = pathname.match(/^\/api\/call-chain\/(.+)$/);
  if (chain) {
    fromResult(response, calls.chain(decodeURIComponent(chain[1]), Number(searchParams.get("depth")) || 3));
    return true;
  }
  const node = pathname.match(/^\/api\/node\/(.+)$/);
  if (node) {
    const id = decodeURIComponent(node[1]);
    const record = repository.getNode(id);
    const edges = graph.neighbors(id);
    const page = wiki.get(id);
    const source = wiki.source(id);
    if (record.isErr() || edges.isErr() || page.isErr() || source.isErr()) {
      json(response, { error: "Node unavailable" }, 500);
    } else {
      json(response, {
        node: record.value,
        edges: edges.value,
        wiki: page.value,
        source: source.value
      });
    }
    return true;
  }
  const subgraph = pathname.match(/^\/api\/subgraph\/(.+)$/);
  if (subgraph) {
    fromResult(response, graph.impact(decodeURIComponent(subgraph[1]), {
      maxDepth: Number(searchParams.get("depth")) || 2
    }));
    return true;
  }
  if (request.method === "POST" && (pathname === "/api/query" || pathname === "/api/concept")) {
    const body = await readBody(request);
    json(response, pathname === "/api/query" ? await knowledge.answer(repoHash, String(body.question ?? "")) : await knowledge.concept(repoHash, Array.isArray(body.nodeIds) ? body.nodeIds.map(String) : [], String(body.question ?? "Explain these symbols.")));
    return true;
  }
  return false;
}
var init_router = () => {};

// packages/viz/dist/http/static.js
import { existsSync as existsSync6 } from "node:fs";
import { readFile as readFile3 } from "node:fs/promises";
import { fileURLToPath } from "node:url";
function resolveAsset(distributionPath, workspacePath) {
  const distributionAsset = new URL(distributionPath, import.meta.url);
  return existsSync6(fileURLToPath(distributionAsset)) ? distributionAsset : new URL(workspacePath, import.meta.url);
}
async function serveStatic(pathname, response) {
  const asset = assets[pathname];
  if (!asset)
    return false;
  const contents = await readFile3(fileURLToPath(asset.path));
  response.writeHead(200, {
    "cache-control": "no-cache",
    "content-type": asset.type,
    "x-content-type-options": "nosniff"
  });
  response.end(contents);
  return true;
}
var assets;
var init_static = __esm(() => {
  assets = {
    "/": {
      path: resolveAsset("./viz/index.html", "../../public/index.html"),
      type: "text/html; charset=utf-8"
    },
    "/assets/styles.css": {
      path: resolveAsset("./viz/styles.css", "../../public/styles.css"),
      type: "text/css; charset=utf-8"
    },
    "/assets/main.js": {
      path: resolveAsset("./viz/main.js", "../client/main.js"),
      type: "text/javascript; charset=utf-8"
    }
  };
});

// packages/viz/dist/server.js
import { createHash as createHash4 } from "node:crypto";
import { createServer } from "node:http";
import { resolve as resolve6 } from "node:path";
function startVizServer(projectDirectory, options = {}) {
  const projectDir = resolve6(projectDirectory);
  const repoHash = createHash4("sha256").update(projectDir).digest("hex").slice(0, 16);
  const opened = CoreDatabase.open({
    repoHash,
    projectDir,
    dataDir: options.dataDir
  });
  if (opened.isErr())
    throw new Error("Unable to open Vedh database");
  const db = opened.value;
  const context = {
    repoHash,
    graph: new GraphService(db),
    repository: new GraphRepository(db),
    calls: new CallGraphService(db),
    analysis: new AnalysisService(db),
    wiki: new WikiService(db),
    search: new SearchService(db),
    knowledge: new KnowledgeService(db)
  };
  const server = createServer(async (request, response) => {
    try {
      const url = new URL(request.url ?? "/", `http://${request.headers.host ?? "localhost"}`);
      if (await serveStatic(url.pathname, response))
        return;
      if (await routeApi(request, response, url, context))
        return;
      json(response, { error: "Not found" }, 404);
    } catch (cause) {
      json(response, { error: cause instanceof Error ? cause.message : String(cause) }, 500);
    }
  });
  const host = options.host ?? "0.0.0.0";
  const port = options.port ?? 3001;
  server.listen(port, host, () => console.log(`Vedh visualizer: http://${host}:${port}`));
  server.on("close", () => db.close());
  return server;
}
var init_server = __esm(() => {
  init_dist2();
  init_router();
  init_static();
});

// packages/viz/dist/index.js
var exports_dist3 = {};
__export(exports_dist3, {
  startVizServer: () => startVizServer
});
var init_dist4 = __esm(() => {
  init_server();
});

// packages/cli/src/index.ts
import { existsSync as existsSync7 } from "node:fs";
import { cp, mkdir, readFile as readFile4, rm, writeFile } from "node:fs/promises";
import { basename as basename4, join as join6, resolve as resolve7 } from "node:path";
import { createRequire } from "node:module";
import { pathToFileURL } from "node:url";
import { createHash as createHash5 } from "node:crypto";
import { clearLine, cursorTo, moveCursor } from "node:readline";
import { createInterface as createPrompt } from "node:readline/promises";
import { stdin, stdout } from "node:process";

// node_modules/.bun/commander@15.0.0/node_modules/commander/lib/error.js
class CommanderError extends Error {
  constructor(exitCode, code, message) {
    super(message);
    Error.captureStackTrace(this, this.constructor);
    this.name = this.constructor.name;
    this.code = code;
    this.exitCode = exitCode;
    this.nestedError = undefined;
  }
}

class InvalidArgumentError extends CommanderError {
  constructor(message) {
    super(1, "commander.invalidArgument", message);
    Error.captureStackTrace(this, this.constructor);
    this.name = this.constructor.name;
  }
}

// node_modules/.bun/commander@15.0.0/node_modules/commander/lib/argument.js
class Argument {
  constructor(name, description) {
    this.description = description || "";
    this.variadic = false;
    this.parseArg = undefined;
    this.defaultValue = undefined;
    this.defaultValueDescription = undefined;
    this.argChoices = undefined;
    switch (name[0]) {
      case "<":
        this.required = true;
        this._name = name.slice(1, -1);
        break;
      case "[":
        this.required = false;
        this._name = name.slice(1, -1);
        break;
      default:
        this.required = true;
        this._name = name;
        break;
    }
    if (this._name.endsWith("...")) {
      this.variadic = true;
      this._name = this._name.slice(0, -3);
    }
  }
  name() {
    return this._name;
  }
  _collectValue(value, previous) {
    if (previous === this.defaultValue || !Array.isArray(previous)) {
      return [value];
    }
    previous.push(value);
    return previous;
  }
  default(value, description) {
    this.defaultValue = value;
    this.defaultValueDescription = description;
    return this;
  }
  argParser(fn) {
    this.parseArg = fn;
    return this;
  }
  choices(values) {
    this.argChoices = values.slice();
    this.parseArg = (arg, previous) => {
      if (!this.argChoices.includes(arg)) {
        throw new InvalidArgumentError(`Allowed choices are ${this.argChoices.join(", ")}.`);
      }
      if (this.variadic) {
        return this._collectValue(arg, previous);
      }
      return arg;
    };
    return this;
  }
  argRequired() {
    this.required = true;
    return this;
  }
  argOptional() {
    this.required = false;
    return this;
  }
}
function humanReadableArgName(arg) {
  const nameOutput = arg.name() + (arg.variadic === true ? "..." : "");
  return arg.required ? "<" + nameOutput + ">" : "[" + nameOutput + "]";
}

// node_modules/.bun/commander@15.0.0/node_modules/commander/lib/command.js
import { EventEmitter } from "node:events";
import childProcess from "node:child_process";
import path from "node:path";
import fs from "node:fs";
import process2 from "node:process";
import { stripVTControlCharacters as stripVTControlCharacters2 } from "node:util";

// node_modules/.bun/commander@15.0.0/node_modules/commander/lib/help.js
import { stripVTControlCharacters } from "node:util";

class Help {
  constructor() {
    this.helpWidth = undefined;
    this.minWidthToWrap = 40;
    this.sortSubcommands = false;
    this.sortOptions = false;
    this.showGlobalOptions = false;
  }
  prepareContext(contextOptions) {
    this.helpWidth = this.helpWidth ?? contextOptions.helpWidth ?? 80;
  }
  visibleCommands(cmd) {
    const visibleCommands = cmd.commands.filter((cmd2) => !cmd2._hidden);
    const helpCommand = cmd._getHelpCommand();
    if (helpCommand && !helpCommand._hidden) {
      visibleCommands.push(helpCommand);
    }
    if (this.sortSubcommands) {
      visibleCommands.sort((a, b) => {
        return a.name().localeCompare(b.name());
      });
    }
    return visibleCommands;
  }
  compareOptions(a, b) {
    const getSortKey = (option) => {
      return option.short ? option.short.replace(/^-/, "") : option.long.replace(/^--/, "");
    };
    return getSortKey(a).localeCompare(getSortKey(b));
  }
  visibleOptions(cmd) {
    const visibleOptions = cmd.options.filter((option) => !option.hidden);
    const helpOption = cmd._getHelpOption();
    if (helpOption && !helpOption.hidden) {
      const removeShort = helpOption.short && cmd._findOption(helpOption.short);
      const removeLong = helpOption.long && cmd._findOption(helpOption.long);
      if (!removeShort && !removeLong) {
        visibleOptions.push(helpOption);
      } else if (helpOption.long && !removeLong) {
        visibleOptions.push(cmd.createOption(helpOption.long, helpOption.description));
      } else if (helpOption.short && !removeShort) {
        visibleOptions.push(cmd.createOption(helpOption.short, helpOption.description));
      }
    }
    if (this.sortOptions) {
      visibleOptions.sort(this.compareOptions);
    }
    return visibleOptions;
  }
  visibleGlobalOptions(cmd) {
    if (!this.showGlobalOptions)
      return [];
    const globalOptions = [];
    for (let ancestorCmd = cmd.parent;ancestorCmd; ancestorCmd = ancestorCmd.parent) {
      const visibleOptions = ancestorCmd.options.filter((option) => !option.hidden);
      globalOptions.push(...visibleOptions);
    }
    if (this.sortOptions) {
      globalOptions.sort(this.compareOptions);
    }
    return globalOptions;
  }
  visibleArguments(cmd) {
    if (cmd._argsDescription) {
      cmd.registeredArguments.forEach((argument) => {
        argument.description = argument.description || cmd._argsDescription[argument.name()] || "";
      });
    }
    if (cmd.registeredArguments.find((argument) => argument.description)) {
      return cmd.registeredArguments;
    }
    return [];
  }
  subcommandTerm(cmd) {
    const args = cmd.registeredArguments.map((arg) => humanReadableArgName(arg)).join(" ");
    return cmd._name + (cmd._aliases[0] ? "|" + cmd._aliases[0] : "") + (cmd.options.length ? " [options]" : "") + (args ? " " + args : "");
  }
  optionTerm(option) {
    return option.flags;
  }
  argumentTerm(argument) {
    return argument.name();
  }
  longestSubcommandTermLength(cmd, helper) {
    return helper.visibleCommands(cmd).reduce((max, command) => {
      return Math.max(max, this.displayWidth(helper.styleSubcommandTerm(helper.subcommandTerm(command))));
    }, 0);
  }
  longestOptionTermLength(cmd, helper) {
    return helper.visibleOptions(cmd).reduce((max, option) => {
      return Math.max(max, this.displayWidth(helper.styleOptionTerm(helper.optionTerm(option))));
    }, 0);
  }
  longestGlobalOptionTermLength(cmd, helper) {
    return helper.visibleGlobalOptions(cmd).reduce((max, option) => {
      return Math.max(max, this.displayWidth(helper.styleOptionTerm(helper.optionTerm(option))));
    }, 0);
  }
  longestArgumentTermLength(cmd, helper) {
    return helper.visibleArguments(cmd).reduce((max, argument) => {
      return Math.max(max, this.displayWidth(helper.styleArgumentTerm(helper.argumentTerm(argument))));
    }, 0);
  }
  commandUsage(cmd) {
    let cmdName = cmd._name;
    if (cmd._aliases[0]) {
      cmdName = cmdName + "|" + cmd._aliases[0];
    }
    let ancestorCmdNames = "";
    for (let ancestorCmd = cmd.parent;ancestorCmd; ancestorCmd = ancestorCmd.parent) {
      ancestorCmdNames = ancestorCmd.name() + " " + ancestorCmdNames;
    }
    return ancestorCmdNames + cmdName + " " + cmd.usage();
  }
  commandDescription(cmd) {
    return cmd.description();
  }
  subcommandDescription(cmd) {
    return cmd.summary() || cmd.description();
  }
  optionDescription(option) {
    const extraInfo = [];
    if (option.argChoices) {
      extraInfo.push(`choices: ${option.argChoices.map((choice) => JSON.stringify(choice)).join(", ")}`);
    }
    if (option.defaultValue !== undefined) {
      const showDefault = option.required || option.optional || option.isBoolean() && typeof option.defaultValue === "boolean";
      if (showDefault) {
        extraInfo.push(`default: ${option.defaultValueDescription || JSON.stringify(option.defaultValue)}`);
      }
    }
    if (option.presetArg !== undefined && option.optional) {
      extraInfo.push(`preset: ${JSON.stringify(option.presetArg)}`);
    }
    if (option.envVar !== undefined) {
      extraInfo.push(`env: ${option.envVar}`);
    }
    if (extraInfo.length > 0) {
      const extraDescription = `(${extraInfo.join(", ")})`;
      if (option.description) {
        return `${option.description} ${extraDescription}`;
      }
      return extraDescription;
    }
    return option.description;
  }
  argumentDescription(argument) {
    const extraInfo = [];
    if (argument.argChoices) {
      extraInfo.push(`choices: ${argument.argChoices.map((choice) => JSON.stringify(choice)).join(", ")}`);
    }
    if (argument.defaultValue !== undefined) {
      extraInfo.push(`default: ${argument.defaultValueDescription || JSON.stringify(argument.defaultValue)}`);
    }
    if (extraInfo.length > 0) {
      const extraDescription = `(${extraInfo.join(", ")})`;
      if (argument.description) {
        return `${argument.description} ${extraDescription}`;
      }
      return extraDescription;
    }
    return argument.description;
  }
  formatItemList(heading, items, helper) {
    if (items.length === 0)
      return [];
    return [helper.styleTitle(heading), ...items, ""];
  }
  groupItems(unsortedItems, visibleItems, getGroup) {
    const result = new Map;
    unsortedItems.forEach((item) => {
      const group = getGroup(item);
      if (!result.has(group))
        result.set(group, []);
    });
    visibleItems.forEach((item) => {
      const group = getGroup(item);
      if (!result.has(group)) {
        result.set(group, []);
      }
      result.get(group).push(item);
    });
    return result;
  }
  formatHelp(cmd, helper) {
    const termWidth = helper.padWidth(cmd, helper);
    const helpWidth = helper.helpWidth ?? 80;
    function callFormatItem(term, description) {
      return helper.formatItem(term, termWidth, description, helper);
    }
    let output = [
      `${helper.styleTitle("Usage:")} ${helper.styleUsage(helper.commandUsage(cmd))}`,
      ""
    ];
    const commandDescription = helper.commandDescription(cmd);
    if (commandDescription.length > 0) {
      output = output.concat([
        helper.boxWrap(helper.styleCommandDescription(commandDescription), helpWidth),
        ""
      ]);
    }
    const argumentList = helper.visibleArguments(cmd).map((argument) => {
      return callFormatItem(helper.styleArgumentTerm(helper.argumentTerm(argument)), helper.styleArgumentDescription(helper.argumentDescription(argument)));
    });
    output = output.concat(this.formatItemList("Arguments:", argumentList, helper));
    const optionGroups = this.groupItems(cmd.options, helper.visibleOptions(cmd), (option) => option.helpGroupHeading ?? "Options:");
    optionGroups.forEach((options, group) => {
      const optionList = options.map((option) => {
        return callFormatItem(helper.styleOptionTerm(helper.optionTerm(option)), helper.styleOptionDescription(helper.optionDescription(option)));
      });
      output = output.concat(this.formatItemList(group, optionList, helper));
    });
    if (helper.showGlobalOptions) {
      const globalOptionList = helper.visibleGlobalOptions(cmd).map((option) => {
        return callFormatItem(helper.styleOptionTerm(helper.optionTerm(option)), helper.styleOptionDescription(helper.optionDescription(option)));
      });
      output = output.concat(this.formatItemList("Global Options:", globalOptionList, helper));
    }
    const commandGroups = this.groupItems(cmd.commands, helper.visibleCommands(cmd), (sub) => sub.helpGroup() || "Commands:");
    commandGroups.forEach((commands, group) => {
      const commandList = commands.map((sub) => {
        return callFormatItem(helper.styleSubcommandTerm(helper.subcommandTerm(sub)), helper.styleSubcommandDescription(helper.subcommandDescription(sub)));
      });
      output = output.concat(this.formatItemList(group, commandList, helper));
    });
    return output.join(`
`);
  }
  displayWidth(str) {
    return stripVTControlCharacters(str).length;
  }
  styleTitle(str) {
    return str;
  }
  styleUsage(str) {
    return str.split(" ").map((word) => {
      if (word === "[options]")
        return this.styleOptionText(word);
      if (word === "[command]")
        return this.styleSubcommandText(word);
      if (word[0] === "[" || word[0] === "<")
        return this.styleArgumentText(word);
      return this.styleCommandText(word);
    }).join(" ");
  }
  styleCommandDescription(str) {
    return this.styleDescriptionText(str);
  }
  styleOptionDescription(str) {
    return this.styleDescriptionText(str);
  }
  styleSubcommandDescription(str) {
    return this.styleDescriptionText(str);
  }
  styleArgumentDescription(str) {
    return this.styleDescriptionText(str);
  }
  styleDescriptionText(str) {
    return str;
  }
  styleOptionTerm(str) {
    return this.styleOptionText(str);
  }
  styleSubcommandTerm(str) {
    return str.split(" ").map((word) => {
      if (word === "[options]")
        return this.styleOptionText(word);
      if (word[0] === "[" || word[0] === "<")
        return this.styleArgumentText(word);
      return this.styleSubcommandText(word);
    }).join(" ");
  }
  styleArgumentTerm(str) {
    return this.styleArgumentText(str);
  }
  styleOptionText(str) {
    return str;
  }
  styleArgumentText(str) {
    return str;
  }
  styleSubcommandText(str) {
    return str;
  }
  styleCommandText(str) {
    return str;
  }
  padWidth(cmd, helper) {
    return Math.max(helper.longestOptionTermLength(cmd, helper), helper.longestGlobalOptionTermLength(cmd, helper), helper.longestSubcommandTermLength(cmd, helper), helper.longestArgumentTermLength(cmd, helper));
  }
  preformatted(str) {
    return /\n[^\S\r\n]/.test(str);
  }
  formatItem(term, termWidth, description, helper) {
    const itemIndent = 2;
    const itemIndentStr = " ".repeat(itemIndent);
    if (!description)
      return itemIndentStr + term;
    const paddedTerm = term.padEnd(termWidth + term.length - helper.displayWidth(term));
    const spacerWidth = 2;
    const helpWidth = this.helpWidth ?? 80;
    const remainingWidth = helpWidth - termWidth - spacerWidth - itemIndent;
    let formattedDescription;
    if (remainingWidth < this.minWidthToWrap || helper.preformatted(description)) {
      formattedDescription = description;
    } else {
      const wrappedDescription = helper.boxWrap(description, remainingWidth);
      formattedDescription = wrappedDescription.replace(/\n/g, `
` + " ".repeat(termWidth + spacerWidth));
    }
    return itemIndentStr + paddedTerm + " ".repeat(spacerWidth) + formattedDescription.replace(/\n/g, `
${itemIndentStr}`);
  }
  boxWrap(str, width) {
    if (width < this.minWidthToWrap)
      return str;
    const rawLines = str.split(/\r\n|\n/);
    const chunkPattern = /[\s]*[^\s]+/g;
    const wrappedLines = [];
    rawLines.forEach((line) => {
      const chunks = line.match(chunkPattern);
      if (chunks === null) {
        wrappedLines.push("");
        return;
      }
      let sumChunks = [chunks.shift()];
      let sumWidth = this.displayWidth(sumChunks[0]);
      chunks.forEach((chunk) => {
        const visibleWidth = this.displayWidth(chunk);
        if (sumWidth + visibleWidth <= width) {
          sumChunks.push(chunk);
          sumWidth += visibleWidth;
          return;
        }
        wrappedLines.push(sumChunks.join(""));
        const nextChunk = chunk.trimStart();
        sumChunks = [nextChunk];
        sumWidth = this.displayWidth(nextChunk);
      });
      wrappedLines.push(sumChunks.join(""));
    });
    return wrappedLines.join(`
`);
  }
}

// node_modules/.bun/commander@15.0.0/node_modules/commander/lib/option.js
class Option {
  constructor(flags, description) {
    this.flags = flags;
    this.description = description || "";
    this.required = flags.includes("<");
    this.optional = flags.includes("[");
    this.variadic = /\w\.\.\.[>\]]$/.test(flags);
    this.mandatory = false;
    const optionFlags = splitOptionFlags(flags);
    this.short = optionFlags.shortFlag;
    this.long = optionFlags.longFlag;
    this.negate = false;
    if (this.long) {
      this.negate = this.long.startsWith("--no-");
    }
    this.defaultValue = undefined;
    this.defaultValueDescription = undefined;
    this.presetArg = undefined;
    this.envVar = undefined;
    this.parseArg = undefined;
    this.hidden = false;
    this.argChoices = undefined;
    this.conflictsWith = [];
    this.implied = undefined;
    this.helpGroupHeading = undefined;
  }
  default(value, description) {
    this.defaultValue = value;
    this.defaultValueDescription = description;
    return this;
  }
  preset(arg) {
    this.presetArg = arg;
    return this;
  }
  conflicts(names) {
    this.conflictsWith = this.conflictsWith.concat(names);
    return this;
  }
  implies(impliedOptionValues) {
    let newImplied = impliedOptionValues;
    if (typeof impliedOptionValues === "string") {
      newImplied = { [impliedOptionValues]: true };
    }
    this.implied = Object.assign(this.implied || {}, newImplied);
    return this;
  }
  env(name) {
    this.envVar = name;
    return this;
  }
  argParser(fn) {
    this.parseArg = fn;
    return this;
  }
  makeOptionMandatory(mandatory = true) {
    this.mandatory = !!mandatory;
    return this;
  }
  hideHelp(hide = true) {
    this.hidden = !!hide;
    return this;
  }
  _collectValue(value, previous) {
    if (previous === this.defaultValue || !Array.isArray(previous)) {
      return [value];
    }
    previous.push(value);
    return previous;
  }
  choices(values) {
    this.argChoices = values.slice();
    this.parseArg = (arg, previous) => {
      if (!this.argChoices.includes(arg)) {
        throw new InvalidArgumentError(`Allowed choices are ${this.argChoices.join(", ")}.`);
      }
      if (this.variadic) {
        return this._collectValue(arg, previous);
      }
      return arg;
    };
    return this;
  }
  name() {
    if (this.long) {
      return this.long.replace(/^--/, "");
    }
    return this.short.replace(/^-/, "");
  }
  attributeName() {
    if (this.negate) {
      return camelcase(this.name().replace(/^no-/, ""));
    }
    return camelcase(this.name());
  }
  helpGroup(heading) {
    this.helpGroupHeading = heading;
    return this;
  }
  is(arg) {
    return this.short === arg || this.long === arg;
  }
  isBoolean() {
    return !this.required && !this.optional && !this.negate;
  }
}

class DualOptions {
  constructor(options) {
    this.positiveOptions = new Map;
    this.negativeOptions = new Map;
    this.dualOptions = new Set;
    options.forEach((option) => {
      if (option.negate) {
        this.negativeOptions.set(option.attributeName(), option);
      } else {
        this.positiveOptions.set(option.attributeName(), option);
      }
    });
    this.negativeOptions.forEach((value, key) => {
      if (this.positiveOptions.has(key)) {
        this.dualOptions.add(key);
      }
    });
  }
  valueFromOption(value, option) {
    const optionKey = option.attributeName();
    if (!this.dualOptions.has(optionKey))
      return true;
    const preset = this.negativeOptions.get(optionKey).presetArg;
    const negativeValue = preset !== undefined ? preset : false;
    return option.negate === (negativeValue === value);
  }
}
function camelcase(str) {
  return str.split("-").reduce((str2, word) => {
    return str2 + word[0].toUpperCase() + word.slice(1);
  });
}
function splitOptionFlags(flags) {
  let shortFlag;
  let longFlag;
  const shortFlagExp = /^-[^-]$/;
  const longFlagExp = /^--[^-]/;
  const flagParts = flags.split(/[ |,]+/).concat("guard");
  if (shortFlagExp.test(flagParts[0]))
    shortFlag = flagParts.shift();
  if (longFlagExp.test(flagParts[0]))
    longFlag = flagParts.shift();
  if (!shortFlag && shortFlagExp.test(flagParts[0]))
    shortFlag = flagParts.shift();
  if (!shortFlag && longFlagExp.test(flagParts[0])) {
    shortFlag = longFlag;
    longFlag = flagParts.shift();
  }
  if (flagParts[0].startsWith("-")) {
    const unsupportedFlag = flagParts[0];
    const baseError = `option creation failed due to '${unsupportedFlag}' in option flags '${flags}'`;
    if (/^-[^-][^-]/.test(unsupportedFlag))
      throw new Error(`${baseError}
- a short flag is a single dash and a single character
  - either use a single dash and a single character (for a short flag)
  - or use a double dash for a long option (and can have two, like '--ws, --workspace')`);
    if (shortFlagExp.test(unsupportedFlag))
      throw new Error(`${baseError}
- too many short flags`);
    if (longFlagExp.test(unsupportedFlag))
      throw new Error(`${baseError}
- too many long flags`);
    throw new Error(`${baseError}
- unrecognised flag format`);
  }
  if (shortFlag === undefined && longFlag === undefined)
    throw new Error(`option creation failed due to no flags found in '${flags}'.`);
  return { shortFlag, longFlag };
}

// node_modules/.bun/commander@15.0.0/node_modules/commander/lib/suggestSimilar.js
var maxDistance = 3;
function editDistance(a, b) {
  if (Math.abs(a.length - b.length) > maxDistance)
    return Math.max(a.length, b.length);
  const d = [];
  for (let i = 0;i <= a.length; i++) {
    d[i] = [i];
  }
  for (let j = 0;j <= b.length; j++) {
    d[0][j] = j;
  }
  for (let j = 1;j <= b.length; j++) {
    for (let i = 1;i <= a.length; i++) {
      let cost;
      if (a[i - 1] === b[j - 1]) {
        cost = 0;
      } else {
        cost = 1;
      }
      d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + cost);
      if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) {
        d[i][j] = Math.min(d[i][j], d[i - 2][j - 2] + 1);
      }
    }
  }
  return d[a.length][b.length];
}
function suggestSimilar(word, candidates) {
  if (!candidates || candidates.length === 0)
    return "";
  candidates = Array.from(new Set(candidates));
  const searchingOptions = word.startsWith("--");
  if (searchingOptions) {
    word = word.slice(2);
    candidates = candidates.map((candidate) => candidate.slice(2));
  }
  let similar = [];
  let bestDistance = maxDistance;
  const minSimilarity = 0.4;
  candidates.forEach((candidate) => {
    if (candidate.length <= 1)
      return;
    const distance = editDistance(word, candidate);
    const length = Math.max(word.length, candidate.length);
    const similarity = (length - distance) / length;
    if (similarity > minSimilarity) {
      if (distance < bestDistance) {
        bestDistance = distance;
        similar = [candidate];
      } else if (distance === bestDistance) {
        similar.push(candidate);
      }
    }
  });
  similar.sort((a, b) => a.localeCompare(b));
  if (searchingOptions) {
    similar = similar.map((candidate) => `--${candidate}`);
  }
  if (similar.length > 1) {
    return `
(Did you mean one of ${similar.join(", ")}?)`;
  }
  if (similar.length === 1) {
    return `
(Did you mean ${similar[0]}?)`;
  }
  return "";
}

// node_modules/.bun/commander@15.0.0/node_modules/commander/lib/command.js
class Command extends EventEmitter {
  constructor(name) {
    super();
    this.commands = [];
    this.options = [];
    this.parent = null;
    this._allowUnknownOption = false;
    this._allowExcessArguments = false;
    this.registeredArguments = [];
    this._args = this.registeredArguments;
    this.args = [];
    this.rawArgs = [];
    this.processedArgs = [];
    this._scriptPath = null;
    this._name = name || "";
    this._optionValues = {};
    this._optionValueSources = {};
    this._storeOptionsAsProperties = false;
    this._actionHandler = null;
    this._executableHandler = false;
    this._executableFile = null;
    this._executableDir = null;
    this._defaultCommandName = null;
    this._exitCallback = null;
    this._aliases = [];
    this._combineFlagAndOptionalValue = true;
    this._description = "";
    this._summary = "";
    this._argsDescription = undefined;
    this._enablePositionalOptions = false;
    this._passThroughOptions = false;
    this._lifeCycleHooks = {};
    this._showHelpAfterError = false;
    this._showSuggestionAfterError = true;
    this._savedState = null;
    this._outputConfiguration = {
      writeOut: (str) => process2.stdout.write(str),
      writeErr: (str) => process2.stderr.write(str),
      outputError: (str, write) => write(str),
      getOutHelpWidth: () => process2.stdout.isTTY ? process2.stdout.columns : undefined,
      getErrHelpWidth: () => process2.stderr.isTTY ? process2.stderr.columns : undefined,
      getOutHasColors: () => useColor() ?? (process2.stdout.isTTY && process2.stdout.hasColors?.()),
      getErrHasColors: () => useColor() ?? (process2.stderr.isTTY && process2.stderr.hasColors?.()),
      stripColor: (str) => stripVTControlCharacters2(str)
    };
    this._hidden = false;
    this._helpOption = undefined;
    this._addImplicitHelpCommand = undefined;
    this._helpCommand = undefined;
    this._helpConfiguration = {};
    this._helpGroupHeading = undefined;
    this._defaultCommandGroup = undefined;
    this._defaultOptionGroup = undefined;
  }
  copyInheritedSettings(sourceCommand) {
    this._outputConfiguration = sourceCommand._outputConfiguration;
    this._helpOption = sourceCommand._helpOption;
    this._helpCommand = sourceCommand._helpCommand;
    this._helpConfiguration = sourceCommand._helpConfiguration;
    this._exitCallback = sourceCommand._exitCallback;
    this._storeOptionsAsProperties = sourceCommand._storeOptionsAsProperties;
    this._combineFlagAndOptionalValue = sourceCommand._combineFlagAndOptionalValue;
    this._allowExcessArguments = sourceCommand._allowExcessArguments;
    this._enablePositionalOptions = sourceCommand._enablePositionalOptions;
    this._showHelpAfterError = sourceCommand._showHelpAfterError;
    this._showSuggestionAfterError = sourceCommand._showSuggestionAfterError;
    return this;
  }
  _getCommandAndAncestors() {
    const result = [];
    for (let command = this;command; command = command.parent) {
      result.push(command);
    }
    return result;
  }
  command(nameAndArgs, actionOptsOrExecDesc, execOpts) {
    let desc = actionOptsOrExecDesc;
    let opts = execOpts;
    if (typeof desc === "object" && desc !== null) {
      opts = desc;
      desc = null;
    }
    opts = opts || {};
    const [, name, args] = nameAndArgs.match(/([^ ]+) *(.*)/);
    const cmd = this.createCommand(name);
    if (desc) {
      cmd.description(desc);
      cmd._executableHandler = true;
    }
    if (opts.isDefault)
      this._defaultCommandName = cmd._name;
    cmd._hidden = !!(opts.noHelp || opts.hidden);
    cmd._executableFile = opts.executableFile || null;
    if (args)
      cmd.arguments(args);
    this._registerCommand(cmd);
    cmd.parent = this;
    cmd.copyInheritedSettings(this);
    if (desc)
      return this;
    return cmd;
  }
  createCommand(name) {
    return new Command(name);
  }
  createHelp() {
    return Object.assign(new Help, this.configureHelp());
  }
  configureHelp(configuration) {
    if (configuration === undefined)
      return this._helpConfiguration;
    this._helpConfiguration = configuration;
    return this;
  }
  configureOutput(configuration) {
    if (configuration === undefined)
      return this._outputConfiguration;
    this._outputConfiguration = {
      ...this._outputConfiguration,
      ...configuration
    };
    return this;
  }
  showHelpAfterError(displayHelp = true) {
    if (typeof displayHelp !== "string")
      displayHelp = !!displayHelp;
    this._showHelpAfterError = displayHelp;
    return this;
  }
  showSuggestionAfterError(displaySuggestion = true) {
    this._showSuggestionAfterError = !!displaySuggestion;
    return this;
  }
  addCommand(cmd, opts) {
    if (!cmd._name) {
      throw new Error(`Command passed to .addCommand() must have a name
- specify the name in Command constructor or using .name()`);
    }
    opts = opts || {};
    if (opts.isDefault)
      this._defaultCommandName = cmd._name;
    if (opts.noHelp || opts.hidden)
      cmd._hidden = true;
    this._registerCommand(cmd);
    cmd.parent = this;
    cmd._checkForBrokenPassThrough();
    return this;
  }
  createArgument(name, description) {
    return new Argument(name, description);
  }
  argument(name, description, parseArg, defaultValue) {
    const argument = this.createArgument(name, description);
    if (typeof parseArg === "function") {
      argument.default(defaultValue).argParser(parseArg);
    } else {
      argument.default(parseArg);
    }
    this.addArgument(argument);
    return this;
  }
  arguments(names) {
    names.trim().split(/ +/).forEach((detail) => {
      this.argument(detail);
    });
    return this;
  }
  addArgument(argument) {
    const previousArgument = this.registeredArguments.slice(-1)[0];
    if (previousArgument?.variadic) {
      throw new Error(`only the last argument can be variadic '${previousArgument.name()}'`);
    }
    if (argument.required && argument.defaultValue !== undefined && argument.parseArg === undefined) {
      throw new Error(`a default value for a required argument is never used: '${argument.name()}'`);
    }
    this.registeredArguments.push(argument);
    return this;
  }
  helpCommand(enableOrNameAndArgs, description) {
    if (typeof enableOrNameAndArgs === "boolean") {
      this._addImplicitHelpCommand = enableOrNameAndArgs;
      if (enableOrNameAndArgs && this._defaultCommandGroup) {
        this._initCommandGroup(this._getHelpCommand());
      }
      return this;
    }
    const nameAndArgs = enableOrNameAndArgs ?? "help [command]";
    const [, helpName, helpArgs] = nameAndArgs.match(/([^ ]+) *(.*)/);
    const helpDescription = description ?? "display help for command";
    const helpCommand = this.createCommand(helpName);
    helpCommand.helpOption(false);
    if (helpArgs)
      helpCommand.arguments(helpArgs);
    if (helpDescription)
      helpCommand.description(helpDescription);
    this._addImplicitHelpCommand = true;
    this._helpCommand = helpCommand;
    if (enableOrNameAndArgs || description)
      this._initCommandGroup(helpCommand);
    return this;
  }
  addHelpCommand(helpCommand, deprecatedDescription) {
    if (typeof helpCommand !== "object") {
      this.helpCommand(helpCommand, deprecatedDescription);
      return this;
    }
    this._addImplicitHelpCommand = true;
    this._helpCommand = helpCommand;
    this._initCommandGroup(helpCommand);
    return this;
  }
  _getHelpCommand() {
    const hasImplicitHelpCommand = this._addImplicitHelpCommand ?? (this.commands.length && !this._actionHandler && !this._findCommand("help"));
    if (hasImplicitHelpCommand) {
      if (this._helpCommand === undefined) {
        this.helpCommand(undefined, undefined);
      }
      return this._helpCommand;
    }
    return null;
  }
  hook(event, listener) {
    const allowedValues = ["preSubcommand", "preAction", "postAction"];
    if (!allowedValues.includes(event)) {
      throw new Error(`Unexpected value for event passed to hook : '${event}'.
Expecting one of '${allowedValues.join("', '")}'`);
    }
    if (this._lifeCycleHooks[event]) {
      this._lifeCycleHooks[event].push(listener);
    } else {
      this._lifeCycleHooks[event] = [listener];
    }
    return this;
  }
  exitOverride(fn) {
    if (fn) {
      this._exitCallback = fn;
    } else {
      this._exitCallback = (err) => {
        if (err.code !== "commander.executeSubCommandAsync") {
          throw err;
        }
      };
    }
    return this;
  }
  _exit(exitCode, code, message) {
    if (this._exitCallback) {
      this._exitCallback(new CommanderError(exitCode, code, message));
    }
    process2.exit(exitCode);
  }
  action(fn) {
    const listener = (args) => {
      const expectedArgsCount = this.registeredArguments.length;
      const actionArgs = args.slice(0, expectedArgsCount);
      if (this._storeOptionsAsProperties) {
        actionArgs[expectedArgsCount] = this;
      } else {
        actionArgs[expectedArgsCount] = this.opts();
      }
      actionArgs.push(this);
      return fn.apply(this, actionArgs);
    };
    this._actionHandler = listener;
    return this;
  }
  createOption(flags, description) {
    return new Option(flags, description);
  }
  _callParseArg(target, value, previous, invalidArgumentMessage) {
    try {
      return target.parseArg(value, previous);
    } catch (err) {
      if (err.code === "commander.invalidArgument") {
        const message = `${invalidArgumentMessage} ${err.message}`;
        this.error(message, { exitCode: err.exitCode, code: err.code });
      }
      throw err;
    }
  }
  _registerOption(option) {
    const matchingOption = option.short && this._findOption(option.short) || option.long && this._findOption(option.long);
    if (matchingOption) {
      const matchingFlag = option.long && this._findOption(option.long) ? option.long : option.short;
      throw new Error(`Cannot add option '${option.flags}'${this._name && ` to command '${this._name}'`} due to conflicting flag '${matchingFlag}'
-  already used by option '${matchingOption.flags}'`);
    }
    this._initOptionGroup(option);
    this.options.push(option);
  }
  _registerCommand(command) {
    const knownBy = (cmd) => {
      return [cmd.name()].concat(cmd.aliases());
    };
    const alreadyUsed = knownBy(command).find((name) => this._findCommand(name));
    if (alreadyUsed) {
      const existingCmd = knownBy(this._findCommand(alreadyUsed)).join("|");
      const newCmd = knownBy(command).join("|");
      throw new Error(`cannot add command '${newCmd}' as already have command '${existingCmd}'`);
    }
    this._initCommandGroup(command);
    this.commands.push(command);
  }
  addOption(option) {
    this._registerOption(option);
    const oname = option.name();
    const name = option.attributeName();
    if (option.defaultValue !== undefined) {
      this.setOptionValueWithSource(name, option.defaultValue, "default");
    }
    const handleOptionValue = (val, invalidValueMessage, valueSource) => {
      if (val == null && option.presetArg !== undefined) {
        val = option.presetArg;
      }
      const oldValue = this.getOptionValue(name);
      if (val !== null && option.parseArg) {
        val = this._callParseArg(option, val, oldValue, invalidValueMessage);
      } else if (val !== null && option.variadic) {
        val = option._collectValue(val, oldValue);
      }
      if (val == null) {
        if (option.negate) {
          val = false;
        } else if (option.isBoolean() || option.optional) {
          val = true;
        } else {
          val = "";
        }
      }
      this.setOptionValueWithSource(name, val, valueSource);
    };
    this.on("option:" + oname, (val) => {
      const invalidValueMessage = `error: option '${option.flags}' argument '${val}' is invalid.`;
      handleOptionValue(val, invalidValueMessage, "cli");
    });
    if (option.envVar) {
      this.on("optionEnv:" + oname, (val) => {
        const invalidValueMessage = `error: option '${option.flags}' value '${val}' from env '${option.envVar}' is invalid.`;
        handleOptionValue(val, invalidValueMessage, "env");
      });
    }
    return this;
  }
  _optionEx(config, flags, description, fn, defaultValue) {
    if (typeof flags === "object" && flags instanceof Option) {
      throw new Error("To add an Option object use addOption() instead of option() or requiredOption()");
    }
    const option = this.createOption(flags, description);
    option.makeOptionMandatory(!!config.mandatory);
    if (typeof fn === "function") {
      option.default(defaultValue).argParser(fn);
    } else if (fn instanceof RegExp) {
      const regex = fn;
      fn = (val, def) => {
        const m = regex.exec(val);
        return m ? m[0] : def;
      };
      option.default(defaultValue).argParser(fn);
    } else {
      option.default(fn);
    }
    return this.addOption(option);
  }
  option(flags, description, parseArg, defaultValue) {
    return this._optionEx({}, flags, description, parseArg, defaultValue);
  }
  requiredOption(flags, description, parseArg, defaultValue) {
    return this._optionEx({ mandatory: true }, flags, description, parseArg, defaultValue);
  }
  combineFlagAndOptionalValue(combine = true) {
    this._combineFlagAndOptionalValue = !!combine;
    return this;
  }
  allowUnknownOption(allowUnknown = true) {
    this._allowUnknownOption = !!allowUnknown;
    return this;
  }
  allowExcessArguments(allowExcess = true) {
    this._allowExcessArguments = !!allowExcess;
    return this;
  }
  enablePositionalOptions(positional = true) {
    this._enablePositionalOptions = !!positional;
    return this;
  }
  passThroughOptions(passThrough = true) {
    this._passThroughOptions = !!passThrough;
    this._checkForBrokenPassThrough();
    return this;
  }
  _checkForBrokenPassThrough() {
    if (this.parent && this._passThroughOptions && !this.parent._enablePositionalOptions) {
      throw new Error(`passThroughOptions cannot be used for '${this._name}' without turning on enablePositionalOptions for parent command(s)`);
    }
  }
  storeOptionsAsProperties(storeAsProperties = true) {
    if (this.options.length) {
      throw new Error("call .storeOptionsAsProperties() before adding options");
    }
    if (Object.keys(this._optionValues).length) {
      throw new Error("call .storeOptionsAsProperties() before setting option values");
    }
    this._storeOptionsAsProperties = !!storeAsProperties;
    return this;
  }
  getOptionValue(key) {
    if (this._storeOptionsAsProperties) {
      return this[key];
    }
    return this._optionValues[key];
  }
  setOptionValue(key, value) {
    return this.setOptionValueWithSource(key, value, undefined);
  }
  setOptionValueWithSource(key, value, source) {
    if (this._storeOptionsAsProperties) {
      this[key] = value;
    } else {
      this._optionValues[key] = value;
    }
    this._optionValueSources[key] = source;
    return this;
  }
  getOptionValueSource(key) {
    return this._optionValueSources[key];
  }
  getOptionValueSourceWithGlobals(key) {
    let source;
    this._getCommandAndAncestors().forEach((cmd) => {
      if (cmd.getOptionValueSource(key) !== undefined) {
        source = cmd.getOptionValueSource(key);
      }
    });
    return source;
  }
  _prepareUserArgs(argv, parseOptions) {
    if (argv !== undefined && !Array.isArray(argv)) {
      throw new Error("first parameter to parse must be array or undefined");
    }
    parseOptions = parseOptions || {};
    if (argv === undefined && parseOptions.from === undefined) {
      if (process2.versions?.electron) {
        parseOptions.from = "electron";
      }
      const execArgv = process2.execArgv ?? [];
      if (execArgv.includes("-e") || execArgv.includes("--eval") || execArgv.includes("-p") || execArgv.includes("--print")) {
        parseOptions.from = "eval";
      }
    }
    if (argv === undefined) {
      argv = process2.argv;
    }
    this.rawArgs = argv.slice();
    let userArgs;
    switch (parseOptions.from) {
      case undefined:
      case "node":
        this._scriptPath = argv[1];
        userArgs = argv.slice(2);
        break;
      case "electron":
        if (process2.defaultApp) {
          this._scriptPath = argv[1];
          userArgs = argv.slice(2);
        } else {
          userArgs = argv.slice(1);
        }
        break;
      case "user":
        userArgs = argv.slice(0);
        break;
      case "eval":
        userArgs = argv.slice(1);
        break;
      default:
        throw new Error(`unexpected parse option { from: '${parseOptions.from}' }`);
    }
    if (!this._name && this._scriptPath)
      this.nameFromFilename(this._scriptPath);
    this._name = this._name || "program";
    return userArgs;
  }
  parse(argv, parseOptions) {
    this._prepareForParse();
    const userArgs = this._prepareUserArgs(argv, parseOptions);
    this._parseCommand([], userArgs);
    return this;
  }
  async parseAsync(argv, parseOptions) {
    this._prepareForParse();
    const userArgs = this._prepareUserArgs(argv, parseOptions);
    await this._parseCommand([], userArgs);
    return this;
  }
  _prepareForParse() {
    if (this._savedState === null) {
      this.options.filter((option) => option.negate && option.defaultValue === undefined && this.getOptionValue(option.attributeName()) === undefined).forEach((option) => {
        const positiveLongFlag = option.long.replace(/^--no-/, "--");
        if (!this._findOption(positiveLongFlag)) {
          this.setOptionValueWithSource(option.attributeName(), true, "default");
        }
      });
      this.saveStateBeforeParse();
    } else {
      this.restoreStateBeforeParse();
    }
  }
  saveStateBeforeParse() {
    this._savedState = {
      _name: this._name,
      _optionValues: { ...this._optionValues },
      _optionValueSources: { ...this._optionValueSources }
    };
  }
  restoreStateBeforeParse() {
    if (this._storeOptionsAsProperties)
      throw new Error(`Can not call parse again when storeOptionsAsProperties is true.
- either make a new Command for each call to parse, or stop storing options as properties`);
    this._name = this._savedState._name;
    this._scriptPath = null;
    this.rawArgs = [];
    this._optionValues = { ...this._savedState._optionValues };
    this._optionValueSources = { ...this._savedState._optionValueSources };
    this.args = [];
    this.processedArgs = [];
  }
  _checkForMissingExecutable(executableFile, executableDir, subcommandName) {
    if (fs.existsSync(executableFile))
      return;
    const executableDirMessage = executableDir ? `searched for local subcommand relative to directory '${executableDir}'` : "no directory for search for local subcommand, use .executableDir() to supply a custom directory";
    const executableMissing = `'${executableFile}' does not exist
 - if '${subcommandName}' is not meant to be an executable command, remove description parameter from '.command()' and use '.description()' instead
 - if the default executable name is not suitable, use the executableFile option to supply a custom name or path
 - ${executableDirMessage}`;
    throw new Error(executableMissing);
  }
  _executeSubCommand(subcommand, args) {
    args = args.slice();
    const sourceExt = [".js", ".ts", ".tsx", ".mjs", ".cjs"];
    function findFile(baseDir, baseName) {
      const localBin = path.resolve(baseDir, baseName);
      if (fs.existsSync(localBin))
        return localBin;
      if (sourceExt.includes(path.extname(baseName)))
        return;
      const foundExt = sourceExt.find((ext) => fs.existsSync(`${localBin}${ext}`));
      if (foundExt)
        return `${localBin}${foundExt}`;
      return;
    }
    this._checkForMissingMandatoryOptions();
    this._checkForConflictingOptions();
    let executableFile = subcommand._executableFile || `${this._name}-${subcommand._name}`;
    let executableDir = this._executableDir || "";
    if (this._scriptPath) {
      let resolvedScriptPath;
      try {
        resolvedScriptPath = fs.realpathSync(this._scriptPath);
      } catch {
        resolvedScriptPath = this._scriptPath;
      }
      executableDir = path.resolve(path.dirname(resolvedScriptPath), executableDir);
    }
    if (executableDir) {
      let localFile = findFile(executableDir, executableFile);
      if (!localFile && !subcommand._executableFile && this._scriptPath) {
        const legacyName = path.basename(this._scriptPath, path.extname(this._scriptPath));
        if (legacyName !== this._name) {
          localFile = findFile(executableDir, `${legacyName}-${subcommand._name}`);
        }
      }
      executableFile = localFile || executableFile;
    }
    const launchWithNode = sourceExt.includes(path.extname(executableFile));
    let proc;
    if (process2.platform !== "win32") {
      if (launchWithNode) {
        args.unshift(executableFile);
        args = incrementNodeInspectorPort(process2.execArgv).concat(args);
        proc = childProcess.spawn(process2.argv[0], args, { stdio: "inherit" });
      } else {
        proc = childProcess.spawn(executableFile, args, { stdio: "inherit" });
      }
    } else {
      this._checkForMissingExecutable(executableFile, executableDir, subcommand._name);
      args.unshift(executableFile);
      args = incrementNodeInspectorPort(process2.execArgv).concat(args);
      proc = childProcess.spawn(process2.execPath, args, { stdio: "inherit" });
    }
    if (!proc.killed) {
      const signals = ["SIGUSR1", "SIGUSR2", "SIGTERM", "SIGINT", "SIGHUP"];
      signals.forEach((signal) => {
        process2.on(signal, () => {
          if (proc.killed === false && proc.exitCode === null) {
            proc.kill(signal);
          }
        });
      });
    }
    const exitCallback = this._exitCallback;
    proc.on("close", (code) => {
      code = code ?? 1;
      if (!exitCallback) {
        process2.exit(code);
      } else {
        exitCallback(new CommanderError(code, "commander.executeSubCommandAsync", "(close)"));
      }
    });
    proc.on("error", (err) => {
      if (err.code === "ENOENT") {
        this._checkForMissingExecutable(executableFile, executableDir, subcommand._name);
      } else if (err.code === "EACCES") {
        throw new Error(`'${executableFile}' not executable`);
      }
      if (!exitCallback) {
        process2.exit(1);
      } else {
        const wrappedError = new CommanderError(1, "commander.executeSubCommandAsync", "(error)");
        wrappedError.nestedError = err;
        exitCallback(wrappedError);
      }
    });
    this.runningCommand = proc;
  }
  _dispatchSubcommand(commandName, operands, unknown) {
    const subCommand = this._findCommand(commandName);
    if (!subCommand)
      this.help({ error: true });
    subCommand._prepareForParse();
    let promiseChain;
    promiseChain = this._chainOrCallSubCommandHook(promiseChain, subCommand, "preSubcommand");
    promiseChain = this._chainOrCall(promiseChain, () => {
      if (subCommand._executableHandler) {
        this._executeSubCommand(subCommand, operands.concat(unknown));
      } else {
        return subCommand._parseCommand(operands, unknown);
      }
    });
    return promiseChain;
  }
  _dispatchHelpCommand(subcommandName) {
    if (!subcommandName) {
      this.help();
    }
    const subCommand = this._findCommand(subcommandName);
    if (subCommand && !subCommand._executableHandler) {
      subCommand.help();
    }
    return this._dispatchSubcommand(subcommandName, [], [this._getHelpOption()?.long ?? this._getHelpOption()?.short ?? "--help"]);
  }
  _checkNumberOfArguments() {
    this.registeredArguments.forEach((arg, i) => {
      if (arg.required && this.args[i] == null) {
        this.missingArgument(arg.name());
      }
    });
    if (this.registeredArguments.length > 0 && this.registeredArguments[this.registeredArguments.length - 1].variadic) {
      return;
    }
    if (this.args.length > this.registeredArguments.length) {
      this._excessArguments(this.args);
    }
  }
  _processArguments() {
    const myParseArg = (argument, value, previous) => {
      let parsedValue = value;
      if (value !== null && argument.parseArg) {
        const invalidValueMessage = `error: command-argument value '${value}' is invalid for argument '${argument.name()}'.`;
        parsedValue = this._callParseArg(argument, value, previous, invalidValueMessage);
      }
      return parsedValue;
    };
    this._checkNumberOfArguments();
    const processedArgs = [];
    this.registeredArguments.forEach((declaredArg, index) => {
      let value = declaredArg.defaultValue;
      if (declaredArg.variadic) {
        if (index < this.args.length) {
          value = this.args.slice(index);
          if (declaredArg.parseArg) {
            value = value.reduce((processed, v) => {
              return myParseArg(declaredArg, v, processed);
            }, declaredArg.defaultValue);
          }
        } else if (value === undefined) {
          value = [];
        }
      } else if (index < this.args.length) {
        value = this.args[index];
        if (declaredArg.parseArg) {
          value = myParseArg(declaredArg, value, declaredArg.defaultValue);
        }
      }
      processedArgs[index] = value;
    });
    this.processedArgs = processedArgs;
  }
  _chainOrCall(promise, fn) {
    if (promise?.then && typeof promise.then === "function") {
      return promise.then(() => fn());
    }
    return fn();
  }
  _chainOrCallHooks(promise, event) {
    let result = promise;
    const hooks = [];
    this._getCommandAndAncestors().reverse().filter((cmd) => cmd._lifeCycleHooks[event] !== undefined).forEach((hookedCommand) => {
      hookedCommand._lifeCycleHooks[event].forEach((callback) => {
        hooks.push({ hookedCommand, callback });
      });
    });
    if (event === "postAction") {
      hooks.reverse();
    }
    hooks.forEach((hookDetail) => {
      result = this._chainOrCall(result, () => {
        return hookDetail.callback(hookDetail.hookedCommand, this);
      });
    });
    return result;
  }
  _chainOrCallSubCommandHook(promise, subCommand, event) {
    let result = promise;
    if (this._lifeCycleHooks[event] !== undefined) {
      this._lifeCycleHooks[event].forEach((hook) => {
        result = this._chainOrCall(result, () => {
          return hook(this, subCommand);
        });
      });
    }
    return result;
  }
  _parseCommand(operands, unknown) {
    const parsed = this.parseOptions(unknown);
    this._parseOptionsEnv();
    this._parseOptionsImplied();
    operands = operands.concat(parsed.operands);
    unknown = parsed.unknown;
    this.args = operands.concat(unknown);
    if (operands && this._findCommand(operands[0])) {
      return this._dispatchSubcommand(operands[0], operands.slice(1), unknown);
    }
    if (this._getHelpCommand() && operands[0] === this._getHelpCommand().name()) {
      return this._dispatchHelpCommand(operands[1]);
    }
    if (this._defaultCommandName) {
      this._outputHelpIfRequested(unknown);
      return this._dispatchSubcommand(this._defaultCommandName, operands, unknown);
    }
    if (this.commands.length && this.args.length === 0 && !this._actionHandler && !this._defaultCommandName) {
      this.help({ error: true });
    }
    this._outputHelpIfRequested(parsed.unknown);
    this._checkForMissingMandatoryOptions();
    this._checkForConflictingOptions();
    const checkForUnknownOptions = () => {
      if (parsed.unknown.length > 0) {
        this.unknownOption(parsed.unknown[0]);
      }
    };
    const commandEvent = `command:${this.name()}`;
    if (this._actionHandler) {
      checkForUnknownOptions();
      this._processArguments();
      let promiseChain;
      promiseChain = this._chainOrCallHooks(promiseChain, "preAction");
      promiseChain = this._chainOrCall(promiseChain, () => this._actionHandler(this.processedArgs));
      if (this.parent) {
        promiseChain = this._chainOrCall(promiseChain, () => {
          this.parent.emit(commandEvent, operands, unknown);
        });
      }
      promiseChain = this._chainOrCallHooks(promiseChain, "postAction");
      return promiseChain;
    }
    if (this.parent?.listenerCount(commandEvent)) {
      checkForUnknownOptions();
      this._processArguments();
      this.parent.emit(commandEvent, operands, unknown);
    } else if (operands.length) {
      if (this._findCommand("*")) {
        return this._dispatchSubcommand("*", operands, unknown);
      }
      if (this.listenerCount("command:*")) {
        this.emit("command:*", operands, unknown);
      } else if (this.commands.length) {
        this.unknownCommand();
      } else {
        checkForUnknownOptions();
        this._processArguments();
      }
    } else if (this.commands.length) {
      checkForUnknownOptions();
      this.help({ error: true });
    } else {
      checkForUnknownOptions();
      this._processArguments();
    }
  }
  _findCommand(name) {
    if (!name)
      return;
    return this.commands.find((cmd) => cmd._name === name || cmd._aliases.includes(name));
  }
  _findOption(arg) {
    return this.options.find((option) => option.is(arg));
  }
  _checkForMissingMandatoryOptions() {
    this._getCommandAndAncestors().forEach((cmd) => {
      cmd.options.forEach((anOption) => {
        if (anOption.mandatory && cmd.getOptionValue(anOption.attributeName()) === undefined) {
          cmd.missingMandatoryOptionValue(anOption);
        }
      });
    });
  }
  _checkForConflictingLocalOptions() {
    const definedNonDefaultOptions = this.options.filter((option) => {
      const optionKey = option.attributeName();
      if (this.getOptionValue(optionKey) === undefined) {
        return false;
      }
      return this.getOptionValueSource(optionKey) !== "default";
    });
    const optionsWithConflicting = definedNonDefaultOptions.filter((option) => option.conflictsWith.length > 0);
    optionsWithConflicting.forEach((option) => {
      const conflictingAndDefined = definedNonDefaultOptions.find((defined) => option.conflictsWith.includes(defined.attributeName()));
      if (conflictingAndDefined) {
        this._conflictingOption(option, conflictingAndDefined);
      }
    });
  }
  _checkForConflictingOptions() {
    this._getCommandAndAncestors().forEach((cmd) => {
      cmd._checkForConflictingLocalOptions();
    });
  }
  parseOptions(args) {
    const operands = [];
    const unknown = [];
    let dest = operands;
    function maybeOption(arg) {
      return arg.length > 1 && arg[0] === "-";
    }
    const negativeNumberArg = (arg) => {
      if (!/^-(\d+|\d*\.\d+)(e[+-]?\d+)?$/.test(arg))
        return false;
      return !this._getCommandAndAncestors().some((cmd) => cmd.options.map((opt) => opt.short).some((short) => /^-\d$/.test(short)));
    };
    let activeVariadicOption = null;
    let activeGroup = null;
    let i = 0;
    while (i < args.length || activeGroup) {
      const arg = activeGroup ?? args[i++];
      activeGroup = null;
      if (arg === "--") {
        if (dest === unknown)
          dest.push(arg);
        dest.push(...args.slice(i));
        break;
      }
      if (activeVariadicOption && (!maybeOption(arg) || negativeNumberArg(arg))) {
        this.emit(`option:${activeVariadicOption.name()}`, arg);
        continue;
      }
      activeVariadicOption = null;
      if (maybeOption(arg)) {
        const option = this._findOption(arg);
        if (option) {
          if (option.required) {
            const value = args[i++];
            if (value === undefined)
              this.optionMissingArgument(option);
            this.emit(`option:${option.name()}`, value);
          } else if (option.optional) {
            let value = null;
            if (i < args.length && (!maybeOption(args[i]) || negativeNumberArg(args[i]))) {
              value = args[i++];
            }
            this.emit(`option:${option.name()}`, value);
          } else {
            this.emit(`option:${option.name()}`);
          }
          activeVariadicOption = option.variadic ? option : null;
          continue;
        }
      }
      if (arg.length > 2 && arg[0] === "-" && arg[1] !== "-") {
        const option = this._findOption(`-${arg[1]}`);
        if (option) {
          if (option.required || option.optional && this._combineFlagAndOptionalValue) {
            this.emit(`option:${option.name()}`, arg.slice(2));
          } else {
            this.emit(`option:${option.name()}`);
            activeGroup = `-${arg.slice(2)}`;
          }
          continue;
        }
      }
      if (/^--[^=]+=/.test(arg)) {
        const index = arg.indexOf("=");
        const option = this._findOption(arg.slice(0, index));
        if (option && (option.required || option.optional)) {
          this.emit(`option:${option.name()}`, arg.slice(index + 1));
          continue;
        }
      }
      if (dest === operands && maybeOption(arg) && !(this.commands.length === 0 && negativeNumberArg(arg))) {
        dest = unknown;
      }
      if ((this._enablePositionalOptions || this._passThroughOptions) && operands.length === 0 && unknown.length === 0) {
        if (this._findCommand(arg)) {
          operands.push(arg);
          unknown.push(...args.slice(i));
          break;
        } else if (this._getHelpCommand() && arg === this._getHelpCommand().name()) {
          operands.push(arg, ...args.slice(i));
          break;
        } else if (this._defaultCommandName) {
          unknown.push(arg, ...args.slice(i));
          break;
        }
      }
      if (this._passThroughOptions) {
        dest.push(arg, ...args.slice(i));
        break;
      }
      dest.push(arg);
    }
    return { operands, unknown };
  }
  opts() {
    if (this._storeOptionsAsProperties) {
      const result = {};
      const len = this.options.length;
      for (let i = 0;i < len; i++) {
        const key = this.options[i].attributeName();
        result[key] = key === this._versionOptionName ? this._version : this[key];
      }
      return result;
    }
    return this._optionValues;
  }
  optsWithGlobals() {
    return this._getCommandAndAncestors().reduce((combinedOptions, cmd) => Object.assign(combinedOptions, cmd.opts()), {});
  }
  error(message, errorOptions) {
    this._outputConfiguration.outputError(`${message}
`, this._outputConfiguration.writeErr);
    if (typeof this._showHelpAfterError === "string") {
      this._outputConfiguration.writeErr(`${this._showHelpAfterError}
`);
    } else if (this._showHelpAfterError) {
      this._outputConfiguration.writeErr(`
`);
      this.outputHelp({ error: true });
    }
    const config = errorOptions || {};
    const exitCode = config.exitCode || 1;
    const code = config.code || "commander.error";
    this._exit(exitCode, code, message);
  }
  _parseOptionsEnv() {
    this.options.forEach((option) => {
      if (option.envVar && option.envVar in process2.env) {
        const optionKey = option.attributeName();
        if (this.getOptionValue(optionKey) === undefined || ["default", "config", "env"].includes(this.getOptionValueSource(optionKey))) {
          if (option.required || option.optional) {
            this.emit(`optionEnv:${option.name()}`, process2.env[option.envVar]);
          } else {
            this.emit(`optionEnv:${option.name()}`);
          }
        }
      }
    });
  }
  _parseOptionsImplied() {
    const dualHelper = new DualOptions(this.options);
    const hasCustomOptionValue = (optionKey) => {
      return this.getOptionValue(optionKey) !== undefined && !["default", "implied"].includes(this.getOptionValueSource(optionKey));
    };
    this.options.filter((option) => option.implied !== undefined && hasCustomOptionValue(option.attributeName()) && dualHelper.valueFromOption(this.getOptionValue(option.attributeName()), option)).forEach((option) => {
      Object.keys(option.implied).filter((impliedKey) => !hasCustomOptionValue(impliedKey)).forEach((impliedKey) => {
        this.setOptionValueWithSource(impliedKey, option.implied[impliedKey], "implied");
      });
    });
  }
  missingArgument(name) {
    const message = `error: missing required argument '${name}'`;
    this.error(message, { code: "commander.missingArgument" });
  }
  optionMissingArgument(option) {
    const message = `error: option '${option.flags}' argument missing`;
    this.error(message, { code: "commander.optionMissingArgument" });
  }
  missingMandatoryOptionValue(option) {
    const message = `error: required option '${option.flags}' not specified`;
    this.error(message, { code: "commander.missingMandatoryOptionValue" });
  }
  _conflictingOption(option, conflictingOption) {
    const findBestOptionFromValue = (option2) => {
      const optionKey = option2.attributeName();
      const optionValue = this.getOptionValue(optionKey);
      const negativeOption = this.options.find((target) => target.negate && optionKey === target.attributeName());
      const positiveOption = this.options.find((target) => !target.negate && optionKey === target.attributeName());
      if (negativeOption && (negativeOption.presetArg === undefined && optionValue === false || negativeOption.presetArg !== undefined && optionValue === negativeOption.presetArg)) {
        return negativeOption;
      }
      return positiveOption || option2;
    };
    const getErrorMessage = (option2) => {
      const bestOption = findBestOptionFromValue(option2);
      const optionKey = bestOption.attributeName();
      const source = this.getOptionValueSource(optionKey);
      if (source === "env") {
        return `environment variable '${bestOption.envVar}'`;
      }
      return `option '${bestOption.flags}'`;
    };
    const message = `error: ${getErrorMessage(option)} cannot be used with ${getErrorMessage(conflictingOption)}`;
    this.error(message, { code: "commander.conflictingOption" });
  }
  unknownOption(flag) {
    if (this._allowUnknownOption)
      return;
    let suggestion = "";
    if (flag.startsWith("--") && this._showSuggestionAfterError) {
      let candidateFlags = [];
      let command = this;
      do {
        const moreFlags = command.createHelp().visibleOptions(command).filter((option) => option.long).map((option) => option.long);
        candidateFlags = candidateFlags.concat(moreFlags);
        command = command.parent;
      } while (command && !command._enablePositionalOptions);
      suggestion = suggestSimilar(flag, candidateFlags);
    }
    const message = `error: unknown option '${flag}'${suggestion}`;
    this.error(message, { code: "commander.unknownOption" });
  }
  _excessArguments(receivedArgs) {
    if (this._allowExcessArguments)
      return;
    const expected = this.registeredArguments.length;
    const s = expected === 1 ? "" : "s";
    const received = receivedArgs.length;
    const forSubcommand = this.parent ? ` for '${this.name()}'` : "";
    const details = receivedArgs.join(", ");
    const message = `error: too many arguments${forSubcommand}. Expected ${expected} argument${s} but got ${received}: ${details}.`;
    this.error(message, { code: "commander.excessArguments" });
  }
  unknownCommand() {
    const unknownName = this.args[0];
    let suggestion = "";
    if (this._showSuggestionAfterError) {
      const candidateNames = [];
      this.createHelp().visibleCommands(this).forEach((command) => {
        candidateNames.push(command.name());
        if (command.alias())
          candidateNames.push(command.alias());
      });
      suggestion = suggestSimilar(unknownName, candidateNames);
    }
    const message = `error: unknown command '${unknownName}'${suggestion}`;
    this.error(message, { code: "commander.unknownCommand" });
  }
  version(str, flags, description) {
    if (str === undefined)
      return this._version;
    this._version = str;
    flags = flags || "-V, --version";
    description = description || "output the version number";
    const versionOption = this.createOption(flags, description);
    this._versionOptionName = versionOption.attributeName();
    this._registerOption(versionOption);
    this.on("option:" + versionOption.name(), () => {
      this._outputConfiguration.writeOut(`${str}
`);
      this._exit(0, "commander.version", str);
    });
    return this;
  }
  description(str, argsDescription) {
    if (str === undefined && argsDescription === undefined)
      return this._description;
    this._description = str;
    if (argsDescription) {
      this._argsDescription = argsDescription;
    }
    return this;
  }
  summary(str) {
    if (str === undefined)
      return this._summary;
    this._summary = str;
    return this;
  }
  alias(alias) {
    if (alias === undefined)
      return this._aliases[0];
    let command = this;
    if (this.commands.length !== 0 && this.commands[this.commands.length - 1]._executableHandler) {
      command = this.commands[this.commands.length - 1];
    }
    if (alias === command._name)
      throw new Error("Command alias can't be the same as its name");
    const matchingCommand = this.parent?._findCommand(alias);
    if (matchingCommand) {
      const existingCmd = [matchingCommand.name()].concat(matchingCommand.aliases()).join("|");
      throw new Error(`cannot add alias '${alias}' to command '${this.name()}' as already have command '${existingCmd}'`);
    }
    command._aliases.push(alias);
    return this;
  }
  aliases(aliases) {
    if (aliases === undefined)
      return this._aliases;
    aliases.forEach((alias) => this.alias(alias));
    return this;
  }
  usage(str) {
    if (str === undefined) {
      if (this._usage)
        return this._usage;
      const args = this.registeredArguments.map((arg) => {
        return humanReadableArgName(arg);
      });
      return [].concat(this.options.length || this._helpOption !== null ? "[options]" : [], this.commands.length ? "[command]" : [], this.registeredArguments.length ? args : []).join(" ");
    }
    this._usage = str;
    return this;
  }
  name(str) {
    if (str === undefined)
      return this._name;
    this._name = str;
    return this;
  }
  helpGroup(heading) {
    if (heading === undefined)
      return this._helpGroupHeading ?? "";
    this._helpGroupHeading = heading;
    return this;
  }
  commandsGroup(heading) {
    if (heading === undefined)
      return this._defaultCommandGroup ?? "";
    this._defaultCommandGroup = heading;
    return this;
  }
  optionsGroup(heading) {
    if (heading === undefined)
      return this._defaultOptionGroup ?? "";
    this._defaultOptionGroup = heading;
    return this;
  }
  _initOptionGroup(option) {
    if (this._defaultOptionGroup && !option.helpGroupHeading)
      option.helpGroup(this._defaultOptionGroup);
  }
  _initCommandGroup(cmd) {
    if (this._defaultCommandGroup && !cmd.helpGroup())
      cmd.helpGroup(this._defaultCommandGroup);
  }
  nameFromFilename(filename) {
    this._name = path.basename(filename, path.extname(filename));
    return this;
  }
  executableDir(path2) {
    if (path2 === undefined)
      return this._executableDir;
    this._executableDir = path2;
    return this;
  }
  helpInformation(contextOptions) {
    const helper = this.createHelp();
    const context = this._getOutputContext(contextOptions);
    helper.prepareContext({
      error: context.error,
      helpWidth: context.helpWidth,
      outputHasColors: context.hasColors
    });
    const text = helper.formatHelp(this, helper);
    if (context.hasColors)
      return text;
    return this._outputConfiguration.stripColor(text);
  }
  _getOutputContext(contextOptions) {
    contextOptions = contextOptions || {};
    const error = !!contextOptions.error;
    let baseWrite;
    let hasColors;
    let helpWidth;
    if (error) {
      baseWrite = (str) => this._outputConfiguration.writeErr(str);
      hasColors = this._outputConfiguration.getErrHasColors();
      helpWidth = this._outputConfiguration.getErrHelpWidth();
    } else {
      baseWrite = (str) => this._outputConfiguration.writeOut(str);
      hasColors = this._outputConfiguration.getOutHasColors();
      helpWidth = this._outputConfiguration.getOutHelpWidth();
    }
    const write = (str) => {
      if (!hasColors)
        str = this._outputConfiguration.stripColor(str);
      return baseWrite(str);
    };
    return { error, write, hasColors, helpWidth };
  }
  outputHelp(contextOptions) {
    let deprecatedCallback;
    if (typeof contextOptions === "function") {
      deprecatedCallback = contextOptions;
      contextOptions = undefined;
    }
    const outputContext = this._getOutputContext(contextOptions);
    const eventContext = {
      error: outputContext.error,
      write: outputContext.write,
      command: this
    };
    this._getCommandAndAncestors().reverse().forEach((command) => command.emit("beforeAllHelp", eventContext));
    this.emit("beforeHelp", eventContext);
    let helpInformation = this.helpInformation({ error: outputContext.error });
    if (deprecatedCallback) {
      helpInformation = deprecatedCallback(helpInformation);
      if (typeof helpInformation !== "string" && !Buffer.isBuffer(helpInformation)) {
        throw new Error("outputHelp callback must return a string or a Buffer");
      }
    }
    outputContext.write(helpInformation);
    if (this._getHelpOption()?.long) {
      this.emit(this._getHelpOption().long);
    }
    this.emit("afterHelp", eventContext);
    this._getCommandAndAncestors().forEach((command) => command.emit("afterAllHelp", eventContext));
  }
  helpOption(flags, description) {
    if (typeof flags === "boolean") {
      if (flags) {
        if (this._helpOption === null)
          this._helpOption = undefined;
        if (this._defaultOptionGroup) {
          this._initOptionGroup(this._getHelpOption());
        }
      } else {
        this._helpOption = null;
      }
      return this;
    }
    this._helpOption = this.createOption(flags ?? "-h, --help", description ?? "display help for command");
    if (flags || description)
      this._initOptionGroup(this._helpOption);
    return this;
  }
  _getHelpOption() {
    if (this._helpOption === undefined) {
      this.helpOption(undefined, undefined);
    }
    return this._helpOption;
  }
  addHelpOption(option) {
    this._helpOption = option;
    this._initOptionGroup(option);
    return this;
  }
  help(contextOptions) {
    this.outputHelp(contextOptions);
    let exitCode = Number(process2.exitCode ?? 0);
    if (exitCode === 0 && contextOptions && typeof contextOptions !== "function" && contextOptions.error) {
      exitCode = 1;
    }
    this._exit(exitCode, "commander.help", "(outputHelp)");
  }
  addHelpText(position, text) {
    const allowedValues = ["beforeAll", "before", "after", "afterAll"];
    if (!allowedValues.includes(position)) {
      throw new Error(`Unexpected value for position to addHelpText.
Expecting one of '${allowedValues.join("', '")}'`);
    }
    const helpEvent = `${position}Help`;
    this.on(helpEvent, (context) => {
      let helpStr;
      if (typeof text === "function") {
        helpStr = text({ error: context.error, command: context.command });
      } else {
        helpStr = text;
      }
      if (helpStr) {
        context.write(`${helpStr}
`);
      }
    });
    return this;
  }
  _outputHelpIfRequested(args) {
    const helpOption = this._getHelpOption();
    const helpRequested = helpOption && args.find((arg) => helpOption.is(arg));
    if (helpRequested) {
      this.outputHelp();
      this._exit(0, "commander.helpDisplayed", "(outputHelp)");
    }
  }
}
function incrementNodeInspectorPort(args) {
  return args.map((arg) => {
    if (!arg.startsWith("--inspect")) {
      return arg;
    }
    let debugOption;
    let debugHost = "127.0.0.1";
    let debugPort = "9229";
    let match;
    if ((match = arg.match(/^(--inspect(-brk)?)$/)) !== null) {
      debugOption = match[1];
    } else if ((match = arg.match(/^(--inspect(-brk|-port)?)=([^:]+)$/)) !== null) {
      debugOption = match[1];
      if (/^\d+$/.test(match[3])) {
        debugPort = match[3];
      } else {
        debugHost = match[3];
      }
    } else if ((match = arg.match(/^(--inspect(-brk|-port)?)=([^:]+):(\d+)$/)) !== null) {
      debugOption = match[1];
      debugHost = match[3];
      debugPort = match[4];
    }
    if (debugOption && debugPort !== "0") {
      return `${debugOption}=${debugHost}:${parseInt(debugPort) + 1}`;
    }
    return arg;
  });
}
function useColor() {
  if (process2.env.NO_COLOR || process2.env.FORCE_COLOR === "0" || process2.env.FORCE_COLOR === "false")
    return false;
  if (process2.env.FORCE_COLOR || process2.env.CLICOLOR_FORCE !== undefined)
    return true;
  return;
}

// node_modules/.bun/commander@15.0.0/node_modules/commander/index.js
var program = new Command;

// packages/cli/src/index.ts
init_esm();

// packages/extensions/js-ts/dist/index.js
init_dist();
var extension = {
  id: "vedh.js-ts",
  name: "JavaScript and TypeScript",
  version: "1.0.0",
  languageAdapters: [
    new TypeScriptLanguageAdapter("typescript"),
    new TypeScriptLanguageAdapter("tsx"),
    new TypeScriptLanguageAdapter("javascript"),
    new TypeScriptLanguageAdapter("jsx")
  ]
};
var dist_default = extension;

// packages/extensions/php/dist/index.js
init_dist();
var extension2 = {
  id: "vedh.php",
  name: "PHP",
  version: "1.0.0",
  languageAdapters: [new PhpLanguageAdapter]
};
var dist_default2 = extension2;

// packages/extensions/python/dist/index.js
init_dist();
var extension3 = {
  id: "vedh.python",
  name: "Python",
  version: "1.0.0",
  languageAdapters: [new PythonLanguageAdapter]
};
var dist_default3 = extension3;

// packages/cli/src/index.ts
init_dist2();

// packages/cli/src/error.ts
init_esm();
function toCliError(kind, details) {
  return { kind, ...details };
}

// packages/cli/src/explore.ts
init_esm();
init_dist2();
import { existsSync as existsSync5, readFileSync as readFileSync6, readdirSync as readdirSync3 } from "node:fs";
import { homedir as homedir2 } from "node:os";
import { spawnSync as spawnSync3 } from "node:child_process";
import { createHash as createHash2 } from "node:crypto";
import { join as join5, resolve as resolve4 } from "node:path";
class ExploreCommand {
  #dataDir;
  #stdout;
  constructor(dataDir, stdout) {
    this.#dataDir = dataDir;
    this.#stdout = stdout;
  }
  async run(projectDirectory, operation, args, options = {}) {
    const projectDir = resolve4(projectDirectory);
    const repoHash = createHash2("sha256").update(projectDir).digest("hex").slice(0, 16);
    if (operation === "hash") {
      this.#stdout(repoHash);
      return ok(undefined);
    }
    if (operation === "repos") {
      const root = this.#dataDir ?? process.env.VEDH_DATA_DIR ?? join5(homedir2(), ".vedh");
      const repos = existsSync5(root) ? readdirSync3(root, { withFileTypes: true }).filter((entry) => entry.isDirectory()).map((entry) => {
        const directory = join5(root, entry.name);
        const pointer = join5(directory, "local-path");
        return {
          repoHash: entry.name,
          projectDir: existsSync5(pointer) ? readFileSync6(pointer, "utf8").trim() : null,
          database: join5(directory, "kb.sqlite")
        };
      }) : [];
      this.#stdout(JSON.stringify({ repos }, null, 2));
      return ok(undefined);
    }
    const opened = CoreDatabase.open({
      repoHash,
      projectDir,
      dataDir: this.#dataDir
    });
    if (opened.isErr())
      return err(toCliError(2 /* CoreFailed */, { cause: opened.error }));
    const db = opened.value;
    const repository = new GraphRepository(db);
    const graph = new GraphService(db);
    const analysis = new AnalysisService(db);
    const callGraph = new CallGraphService(db);
    const wiki = new WikiService(db);
    const limit = Math.max(1, Number(options.limit) || 100);
    const emit = (value) => {
      this.#stdout(JSON.stringify(value, null, 2));
      db.close();
      return ok(undefined);
    };
    const fail = (cause) => {
      db.close();
      return err(toCliError(2 /* CoreFailed */, { cause }));
    };
    const required = (message) => {
      db.close();
      return err(toCliError(0 /* InvalidArguments */, { message }));
    };
    if (operation === "search") {
      const result = new SearchService(db).search(repoHash, args.join(" "));
      if (result.isErr())
        return fail(result.error);
      return emit({
        results: result.value.filter((item) => this.#allowed(item.filePath, projectDir, options)).slice(0, limit)
      });
    }
    if (operation === "node") {
      if (!args[0])
        return required("Usage: vedh explore <path> node <id>");
      const node = repository.getNode(args[0]);
      if (node.isErr())
        return fail(node.error);
      return emit({ node: node.value });
    }
    if (operation === "source") {
      if (!args[0])
        return required("Usage: vedh explore <path> source <id>");
      const source = wiki.source(args[0]);
      if (source.isErr())
        return fail(source.error);
      return emit({ id: args[0], source: source.value });
    }
    if (operation === "wiki") {
      if (!args[0])
        return required("Usage: vedh explore <path> wiki <id>");
      const page = wiki.get(args[0]);
      if (page.isErr())
        return fail(page.error);
      return emit({ wiki: page.value });
    }
    if (operation === "callers" || operation === "callees" || operation === "chain") {
      if (!args[0])
        return required(`Usage: vedh explore <path> ${operation} <id> [depth]`);
      const chain = callGraph.chain(args[0], Number(args[1]) || 3);
      if (chain.isErr())
        return fail(chain.error);
      const filtered = this.#filterChain(chain.value, projectDir, options);
      return emit(operation === "chain" ? filtered : {
        root: filtered.root,
        [operation]: filtered[operation].slice(0, limit)
      });
    }
    if (operation === "flow") {
      const result = callGraph.flow(repoHash, Number(args[0]) || 5);
      if (result.isErr())
        return fail(result.error);
      return emit(this.#filterFlow(result.value, projectDir, options, limit));
    }
    if (operation === "path") {
      if (!args[0] || !args[1])
        return required("Usage: vedh explore <path> path <from-id> <to-id>");
      const result = graph.shortestPath(args[0], args[1]);
      if (result.isErr())
        return fail(result.error);
      return emit({ path: result.value });
    }
    if (operation === "neighbors") {
      if (!args[0])
        return required("Usage: vedh explore <path> neighbors <id>");
      const result = graph.neighbors(args[0]);
      if (result.isErr())
        return fail(result.error);
      const edges = this.#filterEdges(result.value, repository, projectDir, options);
      return emit({ edges: edges.slice(0, limit) });
    }
    if (operation === "bfs") {
      if (!args[0])
        return required("Usage: vedh explore <path> bfs <id> [depth] [bfs|dfs] [limit] [edge-types]");
      const mode = args[2] === "dfs" ? "dfs" : "bfs";
      const edgeTypes = args[2] === "bfs" || args[2] === "dfs" ? args[4] : args[2];
      const traversalLimit = args[2] === "bfs" || args[2] === "dfs" ? Math.max(1, Number(args[3]) || limit) : limit;
      const result = (mode === "dfs" ? graph.walk : graph.impact).call(graph, args[0], {
        maxDepth: Number(args[1]) || 2,
        edgeTypes: edgeTypes?.split(",").filter(Boolean)
      });
      if (result.isErr())
        return fail(result.error);
      return emit(this.#filterSubgraph(result.value, projectDir, options, traversalLimit));
    }
    if (operation === "deps") {
      if (!args[0])
        return required("Usage: vedh explore <path> deps <id> [both|in|out] [depth]");
      const direction = ["in", "out", "both"].includes(args[1] ?? "") ? args[1] : "both";
      const depth = Number(args[2]) || 3;
      const load = (value) => graph.dependencyTree(args[0], value, depth, limit);
      if (direction === "both") {
        const outgoing = load("out");
        if (outgoing.isErr())
          return fail(outgoing.error);
        const incoming = load("in");
        if (incoming.isErr())
          return fail(incoming.error);
        return emit({
          dependencies: this.#filterDependencyTree(outgoing.value.tree, projectDir, options),
          dependents: this.#filterDependencyTree(incoming.value.tree, projectDir, options),
          dependenciesTruncated: outgoing.value.truncated,
          dependentsTruncated: incoming.value.truncated
        });
      }
      const result = load(direction);
      if (result.isErr())
        return fail(result.error);
      return emit({
        ...result.value,
        tree: this.#filterDependencyTree(result.value.tree, projectDir, options)
      });
    }
    if (operation === "god") {
      const ids = analysis.godNodes(repoHash);
      if (ids.isErr())
        return fail(ids.error);
      const nodes = ids.value.flatMap((id) => {
        const node = repository.getNode(id);
        return node.isOk() && node.value && this.#allowed(node.value.file_path, projectDir, options) ? [node.value] : [];
      });
      return emit({ nodes: nodes.slice(0, limit) });
    }
    if (operation === "nodes") {
      const result = repository.getNodes(repoHash);
      if (result.isErr())
        return fail(result.error);
      return emit({
        nodes: result.value.filter((node) => this.#allowed(node.file_path, projectDir, options)).slice(0, limit)
      });
    }
    if (operation === "communities") {
      let result = analysis.communities(repoHash, limit);
      if (result.isErr())
        return fail(result.error);
      if (!result.value.length)
        result = analysis.detectCommunities(repoHash);
      if (result.isErr())
        return fail(result.error);
      return emit({ communities: result.value.slice(0, limit) });
    }
    if (operation === "community") {
      const id = Number(args[0]);
      if (!Number.isFinite(id))
        return required("Usage: vedh explore <path> community <id>");
      const result = analysis.communityMembers(repoHash, id, limit);
      if (result.isErr())
        return fail(result.error);
      return emit({
        id,
        members: result.value.filter((member) => this.#allowed(member.filePath, projectDir, options))
      });
    }
    if (operation === "cross-community") {
      const a = Number(args[0]);
      const b2 = Number(args[1]);
      if (!Number.isFinite(a) || !Number.isFinite(b2))
        return required("Usage: vedh explore <path> cross-community <a> <b>");
      const result = analysis.crossCommunityEdges(repoHash, a, b2, limit);
      if (result.isErr())
        return fail(result.error);
      const edges = result.value.filter((edge) => {
        const source = repository.getNode(edge.source);
        const target = repository.getNode(edge.target);
        return source.isOk() && target.isOk() && source.value && target.value && this.#allowed(source.value.file_path, projectDir, options) && this.#allowed(target.value.file_path, projectDir, options);
      });
      return emit({ edges });
    }
    if (operation === "hooks") {
      const pattern = args[0] ?? "";
      const hooks = db.all("SELECT id,name,metadata_json FROM nodes WHERE repo_hash=? AND kind='event' AND name LIKE ? LIMIT ?", [repoHash, `%${pattern}%`, limit]);
      if (hooks.isErr())
        return fail(hooks.error);
      const result = hooks.value.map((hook) => {
        const edges = db.all("SELECT * FROM edges WHERE source=? OR target=?", [hook.id, hook.id]);
        return {
          ...hook,
          edges: edges.isOk() ? this.#filterEdges(edges.value, repository, projectDir, options, true) : []
        };
      }).filter((hook) => hook.edges.length > 0 || !options.scope && !options.exclude && !options.tier);
      return emit({ hooks: result });
    }
    if (operation === "calls") {
      if (!args[0])
        return required("Usage: vedh explore <path> calls <name>");
      const definitions = db.all("SELECT id,name,kind,file_path FROM nodes WHERE repo_hash=? AND name LIKE ? AND kind NOT IN ('module','event') LIMIT 50", [repoHash, `%${args[0]}%`]);
      if (definitions.isErr())
        return fail(definitions.error);
      const scopedDefinitions = definitions.value.filter((definition) => this.#allowed(definition.file_path, projectDir, options));
      const callSites = scopedDefinitions.flatMap((definition) => {
        const edges = db.all("SELECT * FROM edges WHERE target=? AND type IN ('calls','constructor')", [definition.id]);
        return edges.isOk() ? this.#filterEdges(edges.value, repository, projectDir, options) : [];
      });
      return emit({
        definitions: scopedDefinitions,
        callSites: callSites.slice(0, limit)
      });
    }
    if (operation === "snapshot") {
      const repo = db.get("SELECT indexed_at,commit_hash,node_count,file_count,schema_version FROM repos WHERE repo_hash=?", [repoHash]);
      if (repo.isErr())
        return fail(repo.error);
      const current = spawnSync3("git", ["-C", projectDir, "rev-parse", "HEAD"], { encoding: "utf8" });
      const currentCommit = current.status === 0 ? current.stdout.trim() : null;
      return emit({
        repoHash,
        ...repo.value,
        parserSchemaVersion: INDEX_SCHEMA_VERSION,
        currentCommit,
        schemaStale: Boolean(repo.value?.schema_version && repo.value.schema_version !== INDEX_SCHEMA_VERSION),
        stale: Boolean(repo.value?.commit_hash && currentCommit && repo.value.commit_hash !== currentCommit) || Boolean(repo.value?.schema_version && repo.value.schema_version !== INDEX_SCHEMA_VERSION)
      });
    }
    if (operation === "query") {
      const question = args.join(" ").trim();
      const callers = question.match(/(?:what|who)\s+calls\s+(.+?)[?]?$/i);
      const callees = question.match(/what\s+does\s+(.+?)\s+call[?]?$/i);
      const trace = question.match(/trace\s+(.+?)[?]?$/i);
      const neighbors = question.match(/neighbors?(?:\s+of)?\s+(.+?)[?]?$/i);
      const dependencies = question.match(/(?:dependencies|deps)(?:\s+of)?\s+(.+?)[?]?$/i);
      const dependents = question.match(/dependents(?:\s+of)?\s+(.+?)[?]?$/i);
      const path3 = question.match(/(?:path|route)\s+from\s+(.+?)\s+to\s+(.+?)[?]?$/i);
      const findNode = (name) => {
        const found = new SearchService(db).search(repoHash, name.trim());
        if (found.isErr())
          return found;
        return ok(found.value.find((item) => this.#allowed(item.filePath, projectDir, options))?.id ?? null);
      };
      if (path3) {
        const from = findNode(path3[1]);
        if (from.isErr())
          return fail(from.error);
        const to = findNode(path3[2]);
        if (to.isErr())
          return fail(to.error);
        if (!from.value || !to.value)
          return emit({
            answer: "One or both symbols were not found.",
            path: []
          });
        const result = graph.shortestPath(from.value, to.value);
        if (result.isErr())
          return fail(result.error);
        return emit({ from: from.value, to: to.value, path: result.value });
      }
      const graphNamed = neighbors?.[1] ?? dependencies?.[1] ?? dependents?.[1];
      if (graphNamed) {
        const found = findNode(graphNamed);
        if (found.isErr())
          return fail(found.error);
        if (!found.value)
          return emit({ answer: "No matching symbol was found.", sources: [] });
        if (neighbors) {
          const result2 = graph.neighbors(found.value);
          if (result2.isErr())
            return fail(result2.error);
          return emit({
            root: found.value,
            edges: this.#filterEdges(result2.value, repository, projectDir, options).slice(0, limit)
          });
        }
        const result = graph.dependencyTree(found.value, dependents ? "in" : "out", 3, limit);
        if (result.isErr())
          return fail(result.error);
        return emit({
          root: found.value,
          direction: dependents ? "in" : "out",
          ...result.value,
          tree: this.#filterDependencyTree(result.value.tree, projectDir, options)
        });
      }
      const named = callers?.[1] ?? callees?.[1] ?? trace?.[1];
      if (named) {
        const found = findNode(named);
        if (found.isErr())
          return fail(found.error);
        const id = found.value;
        if (!id)
          return emit({ answer: "No matching symbol was found.", sources: [] });
        const chain = callGraph.chain(id, 4);
        if (chain.isErr())
          return fail(chain.error);
        const filtered = this.#filterChain(chain.value, projectDir, options);
        return emit(callers ? { root: filtered.root, callers: filtered.callers } : callees ? { root: filtered.root, callees: filtered.callees } : filtered);
      }
      if (/\b(?:execution\s+)?flow\b/i.test(question)) {
        const flow = callGraph.flow(repoHash, 5);
        if (flow.isErr())
          return fail(flow.error);
        return emit(this.#filterFlow(flow.value, projectDir, options, limit));
      }
      if (/\b(?:overview|summary|stats|statistics)\b/i.test(question)) {
        const counts = db.get(`SELECT
            (SELECT COUNT(*) FROM nodes WHERE repo_hash=?) AS nodes,
            (SELECT COUNT(*) FROM edges e JOIN nodes n ON n.id=e.source WHERE n.repo_hash=?) AS edges,
            (SELECT COUNT(DISTINCT file_path) FROM nodes WHERE repo_hash=?) AS files`, [repoHash, repoHash, repoHash]);
        if (counts.isErr())
          return fail(counts.error);
        return emit({ repoHash, ...counts.value });
      }
      const answer = await new KnowledgeService(db).answer(repoHash, question);
      return emit(answer);
    }
    return required(`Unknown explore operation: ${operation}`);
  }
  #filterSubgraph(graph, projectDir, options, limit) {
    const nodes = graph.nodes.filter((node) => this.#allowed(node.file_path, projectDir, options)).slice(0, limit);
    const ids = new Set(nodes.map((node) => node.id));
    return {
      nodes,
      edges: graph.edges.filter((edge) => ids.has(edge.source) && ids.has(edge.target))
    };
  }
  #filterChain(chain, projectDir, options) {
    const rootAllowed = !chain.root || this.#allowed(chain.root.file_path, projectDir, options);
    const callers = chain.callers.filter((entry) => this.#allowed(entry.node.file_path, projectDir, options));
    const callees = chain.callees.filter((entry) => this.#allowed(entry.node.file_path, projectDir, options));
    const ids = new Set([
      ...rootAllowed && chain.root ? [chain.root.id] : [],
      ...callers.map((entry) => entry.node.id),
      ...callees.map((entry) => entry.node.id)
    ]);
    return {
      root: rootAllowed ? chain.root : null,
      callers,
      callees,
      edges: chain.edges.filter((edge) => ids.has(edge.source) && ids.has(edge.target))
    };
  }
  #filterFlow(flow, projectDir, options, limit) {
    const entries = flow.entries.filter((entry) => this.#allowed(entry.node.file_path, projectDir, options));
    const nodes = flow.flow.filter((entry) => this.#allowed(entry.node.file_path, projectDir, options)).slice(0, limit);
    const ids = new Set(nodes.map((entry) => entry.node.id));
    return {
      entries,
      flow: nodes,
      edges: flow.edges.filter((edge) => ids.has(edge.source) && ids.has(edge.target))
    };
  }
  #filterDependencyTree(tree, projectDir, options) {
    return tree.flatMap((entry) => {
      const children = this.#filterDependencyTree(entry.children, projectDir, options);
      return this.#allowed(entry.node.file_path, projectDir, options) ? [{ ...entry, children }] : children;
    });
  }
  #filterEdges(edges, repository, projectDir, options, allowVirtual = false) {
    const cache = new Map;
    const node = (id) => {
      if (!cache.has(id)) {
        const result = repository.getNode(id);
        cache.set(id, result.isOk() ? result.value : null);
      }
      return cache.get(id) ?? null;
    };
    const allowedNode = (value) => Boolean(value && (allowVirtual && value.file_path.startsWith("<") || this.#allowed(value.file_path, projectDir, options)));
    return edges.filter((edge) => allowedNode(node(edge.source)) && allowedNode(node(edge.target)));
  }
  #allowed(filePath, projectDir, options) {
    const path3 = filePath.startsWith(projectDir) ? filePath.slice(projectDir.length + 1).replaceAll("\\", "/") : filePath.replaceAll("\\", "/");
    let scopes = options.scope?.split(",").filter(Boolean) ?? [];
    const excludes = options.exclude?.split(",").filter(Boolean) ?? [];
    if (options.tier) {
      const tierFile = join5(projectDir, ".vedh", "tiers.json");
      if (existsSync5(tierFile))
        try {
          const tiers = JSON.parse(readFileSync6(tierFile, "utf8"));
          scopes = tiers[options.tier] ?? scopes;
        } catch {}
    }
    const matches = (pattern) => new RegExp(`^${pattern.replace(/[.+^${}()|[\]\\]/g, "\\$&").replace(/\*\*/g, "§").replace(/\*/g, "[^/]*").replace(/§/g, ".*")}$`).test(path3);
    return (!scopes.length || scopes.some(matches)) && !excludes.some(matches);
  }
}

// packages/cli/src/index.ts
class VedhCli {
  #cwd;
  #dataDir;
  #stdout;
  constructor(options = {}) {
    this.#cwd = options.cwd ?? process.cwd();
    this.#dataDir = options.dataDir;
    this.#stdout = options.stdout ?? console.log;
  }
  async run(argv) {
    const normalizedArgv = argv.at(-1) === "help" ? [...argv.slice(0, -1), "--help"] : argv;
    const program2 = new Command().name("vedh").description("Build and query a codebase knowledge graph.").version("0.1.0").showHelpAfterError().addHelpText("after", `
Examples:
  vedh init .
  vedh index .
  vedh search "ParserEngine"
  vedh extensions add @acme/vedh-extension-go`);
    program2.command("init [directory]").description("Initialize .vedh configuration in a project.").action(async (directory) => {
      const result = await this.#init(directory ? [directory] : []);
      if (result.isErr())
        this.#printError(result.error);
    });
    program2.command("index [directory]").description("Parse source files and build the project graph.").option("--full", "Force a clean rebuild and ignore the parse cache.").option("--llm", "Generate optional LLM summaries after deterministic indexing.").option("--generate-missing-docs", "Generate missing documentation metadata; implies --llm.").option("--imports-exports-only", "Limit LLM enrichment to module/import/export structure.").action(async (directory, options) => {
      const result = await this.#index(directory ? [directory] : [], options);
      if (result.isErr())
        this.#printError(result.error);
    });
    program2.command("search <query>").description("Search indexed declarations and file paths.").action(async (query) => {
      const result = await this.#search([query]);
      if (result.isErr())
        this.#printError(result.error);
    });
    program2.command("graph <node-id>").description("Print the connected graph for a node.").action(async (nodeId) => {
      const result = await this.#graph([nodeId]);
      if (result.isErr())
        this.#printError(result.error);
    });
    program2.command("hierarchy").description("Calculate hierarchy and print high-impact nodes.").action(async () => {
      const result = await this.#hierarchy();
      if (result.isErr())
        this.#printError(result.error);
    });
    program2.command("explore <directory> <operation> [args...]").description("Query the graph as structured JSON for people and agents.").option("--scope <globs>", "Comma-separated file globs to include.").option("--exclude <globs>", "Comma-separated file globs to exclude.").option("--tier <name>", "Named scope from .vedh/tiers.json.").option("--limit <number>", "Maximum returned records.", "100").addHelpText("after", `
Operations:
  search <query>                 Lexical symbol/path search
  node|source|wiki <id>          Inspect a symbol and its generated docs
  callers|callees|chain <id>     Traverse executable relations
  flow [depth]                   Discover entry points and execution flow
  path <from-id> <to-id>         Find a shortest graph path
  neighbors <id>                 List adjacent edges
  bfs <id> [depth] [bfs|dfs] [limit] [edge-types]
  deps <id> [both|in|out] [depth]
  god|nodes|communities|community|cross-community
  hooks [pattern]|calls <name>   Inspect event hooks and call sites
  snapshot|query <question>      Check freshness or query deterministically`).action(async (directory, operation, args, options) => {
      const result = await this.#explore(directory, operation, args, options);
      if (result.isErr())
        this.#printError(result.error);
    });
    program2.command("query <directory> <question...>").description("Ask a question using lexical retrieval and optional LLM synthesis.").action(async (directory, question) => {
      const result = await this.#explore(directory, "query", question, {});
      if (result.isErr())
        this.#printError(result.error);
    });
    program2.command("snapshot [directory]").description("Compare the indexed commit with the current checkout.").action(async (directory) => {
      const result = await this.#explore(directory ?? this.#cwd, "snapshot", [], {});
      if (result.isErr())
        this.#printError(result.error);
    });
    program2.command("wiki-generate [directory]").description("Generate deterministic per-symbol wiki pages.").action(async (directory) => {
      const projectDir = resolve7(directory ?? this.#cwd);
      const db = this.#open(projectDir);
      if (db.isErr())
        return this.#printError(db.error);
      const generated = new WikiService(db.value).generate(this.#hash(projectDir));
      db.value.close();
      if (generated.isErr())
        this.#printError(toCliError(2 /* CoreFailed */, { cause: generated.error }));
      else
        this.#stdout(`Generated ${generated.value} wiki pages.`);
    });
    program2.command("mcp [directory]").description("Start the stdio MCP server for an indexed project.").action(async (directory) => {
      const { startMcpServer: startMcpServer2 } = await Promise.resolve().then(() => (init_dist3(), exports_dist2));
      startMcpServer2(resolve7(directory ?? this.#cwd), this.#dataDir);
    });
    const skill = program2.command("skill").description("Install the Vedh agent skill.");
    skill.command("install").description("Install the Vedh skill for a project, user, or globally.").option("--agent <agent>", "Target agent: claude, codex, opencode, pi, or all.").option("--scope <scope>", "Installation scope: project, user, or global.").action(async (options) => {
      const result = await this.#installSkill(options);
      if (result.isErr())
        this.#printError(result.error);
    });
    program2.command("viz [directory]").description("Start the interactive graph visualizer and HTTP API.").option("--port <number>", "HTTP port.", "3001").option("--host <host>", "Bind address.", "0.0.0.0").action(async (directory, options) => {
      const { startVizServer: startVizServer2 } = await Promise.resolve().then(() => (init_dist4(), exports_dist3));
      const values = options;
      startVizServer2(resolve7(directory ?? this.#cwd), {
        dataDir: this.#dataDir,
        port: Number(values.port) || 3001,
        host: values.host
      });
    });
    program2.command("wiki-import <markdown-file>").description("Store a Markdown file in the project wiki.").action(async (filePath) => {
      const result = await this.#wikiImport([filePath]);
      if (result.isErr())
        this.#printError(result.error);
    });
    const extensions = program2.command("extensions").description("Manage project extension packages.");
    extensions.command("add <package>").description("Register an installed extension package.").action(async (specifier) => {
      const result = await this.#extensions(["add", specifier]);
      if (result.isErr())
        this.#printError(result.error);
    });
    extensions.command("list").description("List registered project extension packages.").action(async () => {
      const result = await this.#extensions(["list"]);
      if (result.isErr())
        this.#printError(result.error);
    });
    program2.action(() => program2.outputHelp());
    await program2.parseAsync(["node", "vedh", ...normalizedArgv]);
    return ok(undefined);
  }
  async#init(args) {
    const projectDir = resolve7(args[0] ?? this.#cwd);
    if (!existsSync7(projectDir))
      return err(toCliError(1 /* ProjectNotFound */, { projectDir }));
    return fromAsync(async () => {
      await mkdir(join6(projectDir, ".vedh"), { recursive: true });
      const configPath = join6(projectDir, ".vedh", "config.json");
      if (!existsSync7(configPath))
        await writeFile(configPath, JSON.stringify({ local: true }, null, 2) + `
`);
      this.#stdout(`Initialized ${configPath}`);
    }, (cause) => toCliError(3 /* IoFailed */, { path: projectDir, cause }));
  }
  async#installSkill(options) {
    let agent = options.agent?.toLowerCase();
    let scope = options.scope?.toLowerCase();
    if (!agent) {
      agent = await this.#select("Install the skill for which agent?", [
        ["all", "All supported agents (.agents/skills)"],
        ["claude", "Claude Code (.claude/skills)"],
        ["codex", "Codex (.agents/skills)"],
        ["opencode", "OpenCode (.opencode/skills)"],
        ["pi", "Pi (.pi/skills)"]
      ]);
      if (!agent) {
        this.#stdout("Skill installation cancelled.");
        return ok(undefined);
      }
    }
    if (agent !== "claude" && agent !== "codex" && agent !== "opencode" && agent !== "pi" && agent !== "all")
      return err(toCliError(0 /* InvalidArguments */, {
        message: "Agent must be claude, codex, opencode, pi, or all."
      }));
    if (!scope) {
      scope = await this.#select("Where should the skill be installed?", [
        ["project", "Project (current repository)"],
        ["user", "User (your home directory)"],
        ["global", "Global (shared user skill directory)"]
      ]);
      if (!scope) {
        this.#stdout("Skill installation cancelled.");
        return ok(undefined);
      }
    }
    if (scope !== "project" && scope !== "user" && scope !== "global")
      return err(toCliError(0 /* InvalidArguments */, {
        message: "Skill scope must be project, user, or global."
      }));
    const home = process.env.HOME ?? process.env.USERPROFILE;
    if (!home)
      return err(toCliError(3 /* IoFailed */, {
        path: "HOME",
        cause: new Error("Unable to determine the home directory.")
      }));
    const targets = agent === "all" ? [join6(this.#skillBase("shared", scope, home), "vedh")] : [join6(this.#skillBase(agent, scope, home), "vedh")];
    return fromAsync(async () => {
      const source = this.#skillDirectory();
      for (const target of targets) {
        await mkdir(resolve7(target, ".."), { recursive: true });
        for (const obsolete of [
          join6("agents", "openai.yaml"),
          join6("references", "architecture.md"),
          join6("references", "integrations.md")
        ])
          await rm(join6(target, obsolete), { force: true });
        await cp(source, target, { recursive: true, force: true });
        this.#stdout(`Installed Vedh skill (${agent}, ${scope}) at ${target}`);
      }
    }, (cause) => toCliError(3 /* IoFailed */, { path: targets.join(", "), cause }));
  }
  async#select(question, options) {
    if (!stdin.isTTY || !stdout.isTTY) {
      const prompt = createPrompt({ input: stdin, output: stdout });
      const answer = await prompt.question(`${question} `);
      prompt.close();
      const selected2 = options.find(([value]) => value === answer.trim().toLowerCase());
      if (selected2)
        return selected2[0];
      throw new Error(`Choose one of: ${options.map(([value]) => value).join(", ")}`);
    }
    let selected = 0;
    const draw = () => {
      stdout.write(`${question}
`);
      for (let index = 0;index < options.length; index += 1)
        stdout.write(`${index === selected ? "❯" : " "} ${options[index][1]}
`);
    };
    draw();
    stdin.setRawMode(true);
    stdin.resume();
    return new Promise((resolve8) => {
      const cleanup = () => {
        stdin.off("data", onData);
        stdin.setRawMode(false);
        stdin.pause();
        clearLine(stdout, 0);
        cursorTo(stdout, 0);
      };
      const onData = (chunk) => {
        const key = chunk.toString();
        if (key === "\x03" || key === "\x1B" || key === "q") {
          cleanup();
          resolve8(undefined);
          return;
        }
        if (key === "\x1B[A" || key === "k")
          selected = (selected + options.length - 1) % options.length;
        else if (key === "\x1B[B" || key === "j")
          selected = (selected + 1) % options.length;
        else if (key === "\r" || key === `
`) {
          cleanup();
          resolve8(options[selected][0]);
          return;
        } else
          return;
        moveCursor(stdout, 0, -(options.length + 1));
        draw();
      };
      stdin.on("data", onData);
    });
  }
  #skillBase(agent, scope, home) {
    if (agent === "shared") {
      return scope === "project" ? join6(this.#cwd, ".agents", "skills") : join6(home, ".agents", "skills");
    }
    if (scope === "project") {
      return join6(this.#cwd, agent === "claude" ? ".claude" : agent === "codex" ? ".agents" : agent === "opencode" ? ".opencode" : ".pi", "skills");
    }
    if (agent === "claude")
      return join6(home, ".claude", "skills");
    if (agent === "codex")
      return join6(process.env.CODEX_HOME ?? join6(home, ".codex"), "skills");
    return join6(agent === "opencode" ? process.env.XDG_CONFIG_HOME ?? join6(home, ".config") : join6(home, ".pi", "agent"), ...agent === "opencode" ? ["opencode"] : [], "skills");
  }
  #skillDirectory() {
    const candidates = [
      join6(import.meta.dirname, "skill"),
      join6(resolve7(import.meta.dirname, ".."), "skill")
    ];
    const candidate = candidates.find((path3) => existsSync7(join6(path3, "SKILL.md")));
    if (candidate)
      return candidate;
    throw new Error("Bundled Vedh skill was not found.");
  }
  async#index(args, flags = {}) {
    const projectDir = resolve7(args[0] ?? this.#cwd);
    const config = CoreDatabase.readProjectConfig(projectDir);
    const database = this.#open(projectDir);
    if (database.isErr())
      return database;
    const repoHash = this.#hash(projectDir);
    const extensions = await this.#loadExtensions(projectDir);
    if (extensions.isErr())
      return extensions;
    const parser = await fromAsync(async () => {
      const { ParserEngine: ParserEngine2 } = await Promise.resolve().then(() => (init_dist(), exports_dist));
      return new ParserEngine2({
        languageAdapters: extensions.value.flatMap((extension4) => extension4.languageAdapters ?? []),
        eventCalls: this.#eventCalls(extensions.value)
      });
    }, (cause) => toCliError(2 /* CoreFailed */, { cause }));
    if (parser.isErr())
      return parser;
    const discovery = new ProjectDiscovery;
    const discovered = discovery.discover(projectDir, {
      extensions: parser.value.supportedExtensions()
    });
    if (discovered.workspaces.length > 0)
      this.#stdout(`◇  Monorepo detected: ${discovered.workspaces.length} workspace package(s).`);
    this.#stdout(`◇  Indexing ${discovered.files.length} supported source file(s).`);
    const indexer = new ProjectIndexer(new GraphRepository(database.value), parser.value);
    const result = await indexer.index({
      repoHash,
      projectDir,
      files: discovered.files,
      url: projectDir,
      name: basename4(projectDir),
      fullRebuild: flags.full,
      sourceInlineMaxLines: this.#sourceInlineMaxLines(config),
      workspacePackages: discovered.workspacePackages,
      onProgress: ({ message }) => this.#stdout(`◇  ${message}`)
    });
    if (result.isErr())
      return err(toCliError(2 /* CoreFailed */, { cause: result.error }));
    this.#stdout(`◆  ${result.value.fullRebuild ? "Full rebuild" : "Incremental update"}: parsed ${result.value.indexedFiles}, cached ${result.value.cachedFiles}, deleted ${result.value.deletedFiles}.`);
    this.#stdout(`◇  Wrote ${result.value.indexedNodes} nodes and ${result.value.indexedEdges} dependency edges.`);
    this.#stdout("◇  Assigned hierarchy levels based on centrality...");
    const analysis = new AnalysisService(database.value);
    const hierarchy = analysis.detectHierarchy();
    if (hierarchy.isErr()) {
      database.value.close();
      return err(toCliError(2 /* CoreFailed */, { cause: hierarchy.error }));
    }
    const godNodes = analysis.godNodes(repoHash);
    if (godNodes.isErr()) {
      database.value.close();
      return err(toCliError(2 /* CoreFailed */, { cause: godNodes.error }));
    }
    this.#stdout("◇  Detecting file communities...");
    const communities = analysis.detectCommunities(repoHash);
    if (communities.isErr()) {
      database.value.close();
      return err(toCliError(2 /* CoreFailed */, { cause: communities.error }));
    }
    this.#stdout("◇  Assigning architectural domains...");
    const domains = analysis.detectDomains(repoHash, config.domains);
    if (domains.isErr()) {
      database.value.close();
      return err(toCliError(2 /* CoreFailed */, { cause: domains.error }));
    }
    let enriched = 0;
    if (flags.llm || flags.generateMissingDocs)
      enriched = await new KnowledgeService(database.value).enrich(repoHash, {
        generateMissingDocs: flags.generateMissingDocs,
        importsExportsOnly: flags.importsExportsOnly
      });
    this.#stdout("◇  Rebuilding wiki pages and search index...");
    const wiki = new WikiService(database.value).generate(repoHash);
    if (wiki.isErr()) {
      database.value.close();
      return err(toCliError(2 /* CoreFailed */, { cause: wiki.error }));
    }
    const search = new SearchService(database.value).populate(repoHash);
    database.value.close();
    if (search.isErr())
      return err(toCliError(2 /* CoreFailed */, { cause: search.error }));
    this.#stdout(`●  Found ${godNodes.value.length} "god" nodes (highly connected).`);
    this.#stdout(`◇  Detected ${domains.value.length} domains and ${communities.value.length} communities; generated ${wiki.value} wiki pages.`);
    if (flags.llm || flags.generateMissingDocs)
      this.#stdout(`◇  Added optional LLM enrichment to ${enriched} symbols.`);
    return ok(undefined);
  }
  async#search(args) {
    const query = args.join(" ");
    if (!query)
      return err(toCliError(0 /* InvalidArguments */, {
        message: "Usage: vedh search <query>"
      }));
    const projectDir = this.#cwd;
    const db = this.#open(projectDir);
    if (db.isErr())
      return db;
    const result = new SearchService(db.value).search(this.#hash(projectDir), query);
    db.value.close();
    if (result.isErr())
      return err(toCliError(2 /* CoreFailed */, { cause: result.error }));
    for (const item of result.value)
      this.#stdout(`${item.id}	${item.kind}	${item.filePath}	${item.label}`);
    return ok(undefined);
  }
  async#graph(args) {
    const id = args[0];
    if (!id)
      return err(toCliError(0 /* InvalidArguments */, {
        message: "Usage: vedh graph <node-id>"
      }));
    const db = this.#open(this.#cwd);
    if (db.isErr())
      return db;
    const graph = new GraphService(db.value).walk(id);
    db.value.close();
    if (graph.isErr())
      return err(toCliError(2 /* CoreFailed */, { cause: graph.error }));
    this.#stdout(JSON.stringify(graph.value, null, 2));
    return ok(undefined);
  }
  async#hierarchy() {
    const db = this.#open(this.#cwd);
    if (db.isErr())
      return db;
    const analysis = new AnalysisService(db.value);
    const detected = analysis.detectHierarchy();
    const gods = detected.isOk() ? analysis.godNodes(this.#hash(this.#cwd)) : detected;
    db.value.close();
    if (gods.isErr())
      return err(toCliError(2 /* CoreFailed */, { cause: gods.error }));
    this.#stdout(gods.value.join(`
`));
    return ok(undefined);
  }
  async#wikiImport(args) {
    const filePath = resolve7(args[0] ?? "");
    if (!args[0])
      return err(toCliError(0 /* InvalidArguments */, {
        message: "Usage: vedh wiki-import <markdown-file>"
      }));
    const content = await fromAsync(() => readFile4(filePath, "utf8"), (cause) => toCliError(3 /* IoFailed */, { path: filePath, cause }));
    if (content.isErr())
      return content;
    const db = this.#open(this.#cwd);
    if (db.isErr())
      return db;
    const saved = new WikiService(db.value).save({
      path: basename4(filePath),
      title: basename4(filePath).replace(/\.md$/, ""),
      summary: "",
      content: content.value
    });
    db.value.close();
    if (saved.isErr())
      return err(toCliError(2 /* CoreFailed */, { cause: saved.error }));
    this.#stdout(`Imported ${filePath}`);
    return ok(undefined);
  }
  async#explore(directory, operation, args, options) {
    return new ExploreCommand(this.#dataDir, this.#stdout).run(directory, operation, args, options);
  }
  async#extensions(args) {
    const [action, specifier] = args;
    const configPath = join6(this.#cwd, ".vedh", "extensions.json");
    if (action === "list") {
      const configured2 = await this.#configuredExtensions(configPath);
      if (configured2.isErr())
        return configured2;
      for (const extension4 of configured2.value)
        this.#stdout(extension4);
      return ok(undefined);
    }
    if (action !== "add" || !specifier)
      return err(toCliError(0 /* InvalidArguments */, {
        message: "Usage: vedh extensions <add <package>|list>"
      }));
    const configured = await this.#configuredExtensions(configPath);
    if (configured.isErr())
      return configured;
    const extensions = [...new Set([...configured.value, specifier])];
    const written = await fromAsync(async () => {
      await mkdir(join6(this.#cwd, ".vedh"), { recursive: true });
      await writeFile(configPath, JSON.stringify({ extensions }, null, 2) + `
`);
    }, (cause) => toCliError(3 /* IoFailed */, { path: configPath, cause }));
    if (written.isErr())
      return written;
    this.#stdout(`Registered extension ${specifier}`);
    return ok(undefined);
  }
  async#configuredExtensions(configPath) {
    if (!existsSync7(configPath))
      return ok([]);
    const content = await fromAsync(() => readFile4(configPath, "utf8"), (cause) => toCliError(3 /* IoFailed */, { path: configPath, cause }));
    if (content.isErr())
      return content;
    return safeCall(() => {
      const value = JSON.parse(content.value);
      return Array.isArray(value.extensions) ? value.extensions.filter((item) => typeof item === "string") : [];
    }, (cause) => toCliError(3 /* IoFailed */, { path: configPath, cause }));
  }
  async#loadExtensions(projectDir) {
    const configPath = join6(projectDir, ".vedh", "extensions.json");
    const configured = await this.#configuredExtensions(configPath);
    if (configured.isErr())
      return configured;
    const extensions = [
      dist_default,
      dist_default3,
      dist_default2
    ];
    const projectRequire = createRequire(join6(projectDir, "package.json"));
    for (const specifier of configured.value) {
      const loaded = await fromAsync(async () => {
        let importTarget = specifier;
        try {
          importTarget = pathToFileURL(projectRequire.resolve(specifier)).href;
        } catch {}
        return await import(importTarget);
      }, (cause) => toCliError(4 /* ExtensionLoadFailed */, { specifier, cause }));
      if (loaded.isErr())
        return loaded;
      if (!loaded.value.default)
        return err(toCliError(4 /* ExtensionLoadFailed */, {
          specifier,
          cause: "Extension has no default export"
        }));
      extensions.push(loaded.value.default);
    }
    return ok(extensions);
  }
  #sourceInlineMaxLines(config) {
    const configured = process.env.VEDH_SOURCE_INLINE_MAX_LINES;
    const value = configured === undefined ? config.sourceInlineMaxLines : Number(configured);
    return typeof value === "number" && Number.isFinite(value) && value >= 0 ? Math.floor(value) : undefined;
  }
  #eventCalls(extensions) {
    return extensions.reduce((merged, extension4) => ({
      fires: { ...merged.fires, ...extension4.eventCalls?.fires },
      listens: { ...merged.listens, ...extension4.eventCalls?.listens }
    }), { fires: {}, listens: {} });
  }
  #open(projectDir) {
    const result = CoreDatabase.open({
      repoHash: this.#hash(projectDir),
      projectDir,
      dataDir: this.#dataDir
    });
    return result.isErr() ? err(toCliError(2 /* CoreFailed */, { cause: result.error })) : result;
  }
  #hash(value) {
    return createHash5("sha256").update(value).digest("hex").slice(0, 16);
  }
  #printError(error) {
    const message = error.kind === 0 /* InvalidArguments */ ? error.message : error.kind === 1 /* ProjectNotFound */ ? `Project directory does not exist: ${error.projectDir}` : error.kind === 3 /* IoFailed */ ? `Unable to access ${error.path}` : error.kind === 4 /* ExtensionLoadFailed */ ? `Unable to load extension: ${error.specifier}` : "Vedh could not complete the command.";
    const cause = error.kind === 2 /* CoreFailed */ || error.kind === 4 /* ExtensionLoadFailed */ ? `
${this.#describeCause(error.cause)}` : "";
    console.error(`Error: ${message}${cause}`);
    process.exitCode = 1;
  }
  #describeCause(cause) {
    if (cause instanceof Error)
      return cause.message;
    if (!cause || typeof cause !== "object")
      return String(cause);
    if ("filePath" in cause && typeof cause.filePath === "string") {
      const nested = "cause" in cause ? `
${this.#describeCause(cause.cause)}` : "";
      return `Failed while processing ${cause.filePath}.${nested}`;
    }
    if ("databasePath" in cause && typeof cause.databasePath === "string") {
      const nested = "cause" in cause ? `
${this.#describeCause(cause.cause)}` : "";
      return `Database failure at ${cause.databasePath}.${nested}`;
    }
    if ("sql" in cause && typeof cause.sql === "string") {
      const nested = "cause" in cause ? `
${this.#describeCause(cause.cause)}` : "";
      return `Database query failed: ${cause.sql}.${nested}`;
    }
    return "An internal Vedh operation failed.";
  }
}

// packages/cli/src/bin.ts
await new VedhCli().run(process.argv.slice(2));

//# debugId=665EC5D2552F1FFC64756E2164756E21
