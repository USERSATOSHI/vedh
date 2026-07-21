import { err, ok, type Result } from '@usersatoshi/results';
import type { EventRelation } from '../type.js';
import {
  EventCallErrorKind,
  toEventCallError,
  type EventCallError,
} from './error.js';
import type {
  EventCallConfig,
  EventCallDetectorContract,
  EventFireRule,
  EventListenRule,
  NormalizedCall,
} from './type.js';

export class EventCallDetector implements EventCallDetectorContract {
  readonly #config: EventCallConfig;

  private constructor(config: EventCallConfig) {
    this.#config = config;
  }

  static create(
    config: EventCallConfig = {},
  ): Result<EventCallDetector, EventCallError> {
    for (const [name, rule] of Object.entries(config.fires ?? {})) {
      const validationError = EventCallDetector.#validateFireRule(name, rule);
      if (validationError) return err(validationError);
    }
    for (const [name, rule] of Object.entries(config.listens ?? {})) {
      const validationError = EventCallDetector.#validateListenRule(name, rule);
      if (validationError) return err(validationError);
    }
    return ok(new EventCallDetector(config));
  }

  static #validateIndex(value: number, label: string): EventCallError | null {
    if (!Number.isInteger(value) || value < 0) {
      return toEventCallError(EventCallErrorKind.InvalidConfiguration, {
        message: `${label} must be a non-negative integer`,
      });
    }
    return null;
  }

  static #validateFireRule(
    name: string,
    rule: EventFireRule,
  ): EventCallError | null {
    return EventCallDetector.#validateIndex(
      rule.eventArgument,
      `fires.${name}.eventArgument`,
    );
  }

  static #validateListenRule(
    name: string,
    rule: EventListenRule,
  ): EventCallError | null {
    const fireError = EventCallDetector.#validateFireRule(name, rule);
    if (fireError) return fireError;
    const callbackError = EventCallDetector.#validateIndex(
      rule.callbackArgument,
      `listens.${name}.callbackArgument`,
    );
    if (callbackError) return callbackError;
    if (rule.priorityArgument !== undefined) {
      const priorityError = EventCallDetector.#validateIndex(
        rule.priorityArgument,
        `listens.${name}.priorityArgument`,
      );
      if (priorityError) return priorityError;
    }
    if (rule.acceptedArgumentsArgument !== undefined) {
      const acceptedArgumentsError = EventCallDetector.#validateIndex(
        rule.acceptedArgumentsArgument,
        `listens.${name}.acceptedArgumentsArgument`,
      );
      if (acceptedArgumentsError) return acceptedArgumentsError;
    }
    return null;
  }

  matches(functionName: string): boolean {
    return Boolean(
      this.#config.fires?.[functionName] ??
      this.#config.listens?.[functionName],
    );
  }

  detect(call: NormalizedCall): EventRelation | null {
    const fireRule = this.#config.fires?.[call.functionName];
    if (fireRule) {
      const eventArgument = call.arguments[fireRule.eventArgument];
      if (!eventArgument?.stringLiteral || !eventArgument.text) return null;
      return {
        kind: 'event',
        direction: 'fire',
        eventName: eventArgument.text,
        eventKind: fireRule.eventKind,
        filePath: call.filePath,
        range: call.range,
      };
    }

    const listenRule = this.#config.listens?.[call.functionName];
    if (!listenRule) return null;
    const eventArgument = call.arguments[listenRule.eventArgument];
    if (!eventArgument?.stringLiteral || !eventArgument.text) return null;

    const callbackArgument = call.arguments[listenRule.callbackArgument];
    const priorityArgument =
      listenRule.priorityArgument === undefined
        ? undefined
        : call.arguments[listenRule.priorityArgument];
    const acceptedArgumentsArgument =
      listenRule.acceptedArgumentsArgument === undefined
        ? undefined
        : call.arguments[listenRule.acceptedArgumentsArgument];

    return {
      kind: 'event',
      direction: 'listen',
      eventName: eventArgument.text,
      eventKind: listenRule.eventKind,
      callback: callbackArgument?.memberReference
        ? {
            receiver: callbackArgument.memberReference.receiver,
            name: callbackArgument.memberReference.method,
          }
        : callbackArgument?.stringLiteral
          ? { name: callbackArgument.text }
          : undefined,
      priority: priorityArgument?.integerLiteral
        ? Number.parseInt(priorityArgument.text, 10)
        : undefined,
      acceptedArguments: acceptedArgumentsArgument?.integerLiteral
        ? Number.parseInt(acceptedArgumentsArgument.text, 10)
        : undefined,
      filePath: call.filePath,
      range: call.range,
    };
  }
}

export type {
  EventCallConfig,
  EventCallDetectorContract,
  EventFireRule,
  EventListenRule,
  NormalizedCall,
  NormalizedCallArgument,
} from './type.js';
export {
  EventCallErrorKind,
  toEventCallErr,
  toEventCallError,
  type EventCallError,
} from './error.js';
