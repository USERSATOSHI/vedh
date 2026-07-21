import { err } from '@usersatoshi/results';
import type { IndexerError } from './type.js';
export function toIndexerError<K extends IndexerError['kind']>(
  kind: K,
  details: Omit<Extract<IndexerError, { kind: K }>, 'kind'>,
): Extract<IndexerError, { kind: K }> {
  return { kind, ...details } as Extract<IndexerError, { kind: K }>;
}
export const toIndexerErr = <
  K extends IndexerError['kind'],
  D extends Omit<Extract<IndexerError, { kind: K }>, 'kind'>,
>(
  kind: K,
  details: D,
) => err(toIndexerError(kind, details));
