export interface NodeInfo {
  id: string;
  name: string;
  kind: string;
  file_path: string;
  line_start: number;
  line_end: number;
  column_start?: number;
  column_end?: number;
  /** Inclusive zero-based JavaScript UTF-16 code-unit offset. */
  offset_start?: number;
  /** Exclusive zero-based JavaScript UTF-16 code-unit offset. */
  offset_end?: number;
  repo_hash: string;
  parent_id: string | null;
  hierarchy_level: string;
  metadata: Record<string, unknown>;
  depth?: number;
}

export interface EdgeInfo {
  source: string;
  target: string;
  type: string;
  weight: number;
  metadata_json?: string;
}

export interface WikiPage {
  path: string;
  title: string;
  summary: string;
  content: string;
}

export interface RepoInfo {
  repo_hash: string;
  name: string;
  url: string;
  languages: string[];
  indexed_at: string;
  status: string;
}

export type HierarchyLevel = 'god' | 'high' | 'mid' | 'low';

export interface Relation {
  type: string;
  target: string;
  line: number;
  column_start?: number;
  column_end?: number;
  file_path?: string;
  sub_kind?: 'extends' | 'implements' | 'return_type' | 'call_target';
  specifier_name?: string;
  receiver?: string;
  hook_type?: 'filter' | 'action';
  priority?: number;
  accepted_args?: number;
}

export interface Subgraph {
  nodes: NodeInfo[];
  edges: EdgeInfo[];
}

export interface CentralityResult {
  nodeId: string;
  degree: number;
  inDegree: number;
  outDegree: number;
}

export interface CommunityInfo {
  id: number;
  nodeCount: number;
  cohesion: number;
  topNodes: string[];
}

export interface CommunityReport {
  godNodes: string[];
  communities: CommunityInfo[];
  totalNodes: number;
  totalEdges: number;
}
