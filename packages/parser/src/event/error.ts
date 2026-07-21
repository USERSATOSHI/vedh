import { err } from '@usersatoshi/results';

export const enum EventCallErrorKind {
  InvalidConfiguration,
}

export type EventCallError = {
  kind: EventCallErrorKind.InvalidConfiguration;
  message: string;
};

export function toEventCallError<K extends EventCallError['kind']>(
  kind: K,
  details: Omit<Extract<EventCallError, { kind: K }>, 'kind'>,
): Extract<EventCallError, { kind: K }> {
  return { kind, ...details } as Extract<EventCallError, { kind: K }>;
}

export const toEventCallErr = <
  K extends EventCallError['kind'],
  D extends Omit<Extract<EventCallError, { kind: K }>, 'kind'>,
>(
  kind: K,
  details: D,
) => err(toEventCallError(kind, details));
