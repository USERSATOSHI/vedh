/** Built-ins use stable IDs; extensions may contribute any non-empty string ID. */
export type LanguageId = string;

export interface SourcePosition {
  /** One-based line number. */
  line: number;
  /** Zero-based column reported by node-tree-sitter. */
  column: number;
  /** Zero-based JavaScript UTF-16 code-unit offset, when available. */
  offset?: number;
}

export interface SourceRange {
  start: SourcePosition;
  end: SourcePosition;
}

export interface SourceFile {
  /** Absolute path for a real file or a stable name for in-memory source. */
  filePath: string;
  source: string;
  /** Detected from filePath when omitted. */
  language?: LanguageId;
  /** Used for repository-relative declaration IDs and module names. */
  projectRoot?: string;
}

export interface Declaration {
  /** `${relativeFilePath}:${startLine}:${startColumn}`. */
  id: string;
  name: string;
  /** Tree-sitter declaration node type. */
  kind: string;
  filePath: string;
  range: SourceRange;
  parentId: string | null;
  depth: number;
  metadata: Record<string, unknown>;
}

export interface RelationBase {
  filePath: string;
  range: SourceRange;
}

export interface ImportRelation extends RelationBase {
  kind: 'import';
  /** Raw module specifier before filesystem resolution. */
  module: string;
  /** Imported symbol when it is statically identifiable. */
  specifier?: string;
}

export interface ExportRelation extends RelationBase {
  kind: 'export';
  /** Exported symbol or re-exported module. */
  target: string;
}

export interface ReferenceRelation extends RelationBase {
  kind: 'reference';
  target: string;
  role: 'call' | 'constructor' | 'extends' | 'implements' | 'return-type';
  receiver?: string;
}

export interface EventRelation extends RelationBase {
  kind: 'event';
  direction: 'fire' | 'listen';
  eventName: string;
  /** Framework-provided label such as filter, action, or event. */
  eventKind?: string;
  callback?: {
    name?: string;
    receiver?: string;
  };
  priority?: number;
  acceptedArguments?: number;
}

export type Relation =
  ImportRelation | ExportRelation | ReferenceRelation | EventRelation;

export type ParseDiagnosticCode =
  | 'unsupported-language'
  | 'syntax-error'
  | 'file-read-failed'
  | 'grammar-load-failed'
  | 'worker-failed'
  | 'parse-failed'
  | 'aborted';

export interface ParseDiagnostic {
  code: ParseDiagnosticCode;
  severity: 'warning' | 'error';
  message: string;
  filePath: string;
  range?: SourceRange;
}

export interface ParseResult {
  filePath: string;
  language: LanguageId;
  declarations: Declaration[];
  relations: Relation[];
  diagnostics: ParseDiagnostic[];
  hasSyntaxErrors: boolean;
}

export interface ParseBatchResult {
  results: Map<string, ParseResult>;
  diagnostics: ParseDiagnostic[];
}
