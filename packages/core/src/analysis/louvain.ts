export interface WeightedNeighbor {
  target: string;
  weight: number;
}

type WeightedGraph = Map<string, Map<string, number>>;

/**
 * Deterministic, multi-level Louvain clustering for a weighted undirected graph.
 * The final connectivity pass prevents a community from containing disconnected
 * islands, which is particularly confusing in an architecture visualization.
 */
export function computeLouvain(
  nodeIds: string[],
  adjacency: Map<string, WeightedNeighbor[]>,
  _totalWeight?: number,
  resolution = 1,
): Map<string, number> {
  const originals = [...new Set(nodeIds)].sort((a, b) => a.localeCompare(b));
  if (!originals.length) return new Map();

  const originalGraph = normalizeGraph(originals, adjacency);
  let graph = originalGraph;
  let members = new Map(originals.map((id) => [id, [id]]));
  let finalGroups = originals.map((id) => [id]);

  for (let level = 0; level < 12; level += 1) {
    const assignment = localMove(graph, resolution);
    const grouped = groupMembers(assignment, members);
    finalGroups = [...grouped.values()];
    if (grouped.size === graph.size) break;
    const aggregated = aggregateGraph(graph, assignment, grouped);
    graph = aggregated.graph;
    members = aggregated.members;
  }

  return stableConnectedAssignments(originals, originalGraph, finalGroups);
}

function normalizeGraph(
  nodeIds: string[],
  adjacency: Map<string, WeightedNeighbor[]>,
): WeightedGraph {
  const allowed = new Set(nodeIds);
  const graph: WeightedGraph = new Map(
    nodeIds.map((id) => [id, new Map<string, number>()]),
  );
  for (const source of nodeIds) {
    for (const edge of adjacency.get(source) ?? []) {
      if (!allowed.has(edge.target) || !Number.isFinite(edge.weight)) continue;
      const weight = Math.max(0, edge.weight);
      if (!weight) continue;
      const neighbors = graph.get(source)!;
      neighbors.set(edge.target, (neighbors.get(edge.target) ?? 0) + weight);
    }
  }
  return graph;
}

function localMove(
  graph: WeightedGraph,
  resolution: number,
): Map<string, number> {
  const nodes = [...graph.keys()].sort((a, b) => a.localeCompare(b));
  const community = new Map(nodes.map((id, index) => [id, index]));
  const degrees = new Map(
    nodes.map((id) => [
      id,
      [...(graph.get(id) ?? new Map()).values()].reduce(
        (sum, weight) => sum + weight,
        0,
      ),
    ]),
  );
  const totalDegree = Math.max(
    1,
    [...degrees.values()].reduce((sum, degree) => sum + degree, 0),
  );
  const communityDegree = new Map<number, number>(
    nodes.map((id, index) => [index, degrees.get(id) ?? 0]),
  );

  for (let iteration = 0; iteration < 50; iteration += 1) {
    let moves = 0;
    for (const node of nodes) {
      const current = community.get(node)!;
      const degree = degrees.get(node) ?? 0;
      communityDegree.set(
        current,
        (communityDegree.get(current) ?? 0) - degree,
      );

      const weights = new Map<number, number>();
      for (const [target, weight] of graph.get(node) ?? []) {
        const candidate = community.get(target);
        if (candidate === undefined) continue;
        weights.set(candidate, (weights.get(candidate) ?? 0) + weight);
      }

      let best = current;
      let bestGain = 0;
      const candidates = [...weights.keys()].sort((a, b) => a - b);
      for (const candidate of candidates) {
        const gain =
          (weights.get(candidate) ?? 0) -
          (resolution * degree * (communityDegree.get(candidate) ?? 0)) /
            totalDegree;
        if (
          gain > bestGain + 1e-10 ||
          (Math.abs(gain - bestGain) <= 1e-10 &&
            gain > 1e-10 &&
            candidate < best)
        ) {
          best = candidate;
          bestGain = gain;
        }
      }

      community.set(node, best);
      communityDegree.set(best, (communityDegree.get(best) ?? 0) + degree);
      if (best !== current) moves += 1;
    }
    if (!moves) break;
  }
  return community;
}

function groupMembers(
  assignment: Map<string, number>,
  members: Map<string, string[]>,
): Map<number, string[]> {
  const grouped = new Map<number, string[]>();
  for (const node of [...assignment.keys()].sort((a, b) =>
    a.localeCompare(b),
  )) {
    const id = assignment.get(node)!;
    const group = grouped.get(id) ?? [];
    group.push(...(members.get(node) ?? [node]));
    grouped.set(id, group);
  }
  for (const group of grouped.values())
    group.sort((a, b) => a.localeCompare(b));
  return grouped;
}

function aggregateGraph(
  graph: WeightedGraph,
  assignment: Map<string, number>,
  grouped: Map<number, string[]>,
): { graph: WeightedGraph; members: Map<string, string[]> } {
  const communityIds = [...grouped.keys()].sort((a, b) => a - b);
  const key = new Map(communityIds.map((id, index) => [id, `level:${index}`]));
  const next: WeightedGraph = new Map(
    communityIds.map((id) => [key.get(id)!, new Map<string, number>()]),
  );
  for (const [source, neighbors] of graph) {
    const sourceKey = key.get(assignment.get(source)!);
    if (!sourceKey) continue;
    for (const [target, weight] of neighbors) {
      const targetKey = key.get(assignment.get(target)!);
      if (!targetKey) continue;
      const nextNeighbors = next.get(sourceKey)!;
      nextNeighbors.set(
        targetKey,
        (nextNeighbors.get(targetKey) ?? 0) + weight,
      );
    }
  }
  return {
    graph: next,
    members: new Map(
      communityIds.map((id) => [key.get(id)!, grouped.get(id)!]),
    ),
  };
}

function stableConnectedAssignments(
  nodeIds: string[],
  graph: WeightedGraph,
  groups: string[][],
): Map<string, number> {
  const components: string[][] = [];
  for (const group of groups) {
    const allowed = new Set(group);
    const unseen = new Set(group);
    while (unseen.size) {
      const first = [...unseen].sort((a, b) => a.localeCompare(b))[0]!;
      unseen.delete(first);
      const component = [first];
      const queue = [first];
      for (let head = 0; head < queue.length; head += 1) {
        for (const target of graph.get(queue[head]!)?.keys() ?? []) {
          if (!allowed.has(target) || !unseen.has(target)) continue;
          unseen.delete(target);
          component.push(target);
          queue.push(target);
        }
      }
      component.sort((a, b) => a.localeCompare(b));
      components.push(component);
    }
  }
  components.sort((a, b) => a[0]!.localeCompare(b[0]!));
  const result = new Map<string, number>();
  components.forEach((component, id) => {
    for (const node of component) result.set(node, id);
  });
  // Defensive fallback for malformed input adjacency.
  for (const node of nodeIds)
    if (!result.has(node)) result.set(node, result.size);
  return result;
}
