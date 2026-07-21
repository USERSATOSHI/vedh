import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { computeLouvain, type WeightedNeighbor } from './louvain.js';

function graph(edges: Array<[string, string, number]>) {
  const adjacency = new Map<string, WeightedNeighbor[]>();
  for (const [source, target, weight] of edges) {
    adjacency.set(source, [
      ...(adjacency.get(source) ?? []),
      { target, weight },
    ]);
    adjacency.set(target, [
      ...(adjacency.get(target) ?? []),
      { target: source, weight },
    ]);
  }
  return adjacency;
}

describe('computeLouvain', () => {
  test('separates dense modules connected by a weak bridge deterministically', () => {
    const nodes = ['a', 'b', 'c', 'x', 'y', 'z'];
    const adjacency = graph([
      ['a', 'b', 8],
      ['b', 'c', 8],
      ['a', 'c', 8],
      ['x', 'y', 8],
      ['y', 'z', 8],
      ['x', 'z', 8],
      ['c', 'x', 0.1],
    ]);
    const first = computeLouvain(nodes, adjacency);
    const second = computeLouvain([...nodes].reverse(), adjacency);
    assert.equal(first.get('a'), first.get('b'));
    assert.equal(first.get('b'), first.get('c'));
    assert.equal(first.get('x'), first.get('y'));
    assert.equal(first.get('y'), first.get('z'));
    assert.notEqual(first.get('a'), first.get('x'));
    assert.deepEqual([...first], [...second]);
  });

  test('never leaves disconnected islands in one community', () => {
    const nodes = ['a', 'b', 'x', 'y', 'isolated'];
    const result = computeLouvain(
      nodes,
      graph([
        ['a', 'b', 2],
        ['x', 'y', 2],
      ]),
    );
    assert.equal(result.get('a'), result.get('b'));
    assert.equal(result.get('x'), result.get('y'));
    assert.notEqual(result.get('a'), result.get('x'));
    assert.notEqual(result.get('isolated'), result.get('a'));
    assert.notEqual(result.get('isolated'), result.get('x'));
  });
});
