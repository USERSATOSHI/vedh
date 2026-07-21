import type { EventRelation, SourceRange } from '../type.js';
import type { Result } from '@usersatoshi/results';
import type { EventCallError } from './error.js';

export interface EventFireRule {
  /** Zero-based argument containing the static event name. */
  eventArgument: number;
  eventKind?: string;
}

export interface EventListenRule extends EventFireRule {
  callbackArgument: number;
  priorityArgument?: number;
  acceptedArgumentsArgument?: number;
}

export interface EventCallConfig {
  fires?: Record<string, EventFireRule>;
  listens?: Record<string, EventListenRule>;
}

export interface NormalizedCallArgument {
  text: string;
  stringLiteral: boolean;
  integerLiteral: boolean;
  closure: boolean;
  memberReference?: {
    receiver: string;
    method: string;
  };
}

export interface NormalizedCall {
  functionName: string;
  arguments: NormalizedCallArgument[];
  filePath: string;
  range: SourceRange;
}

export interface EventCallDetectorContract {
  matches(functionName: string): boolean;
  detect(call: NormalizedCall): EventRelation | null;
}

export interface EventCallDetectorFactory {
  create(
    config?: EventCallConfig,
  ): Result<EventCallDetectorContract, EventCallError>;
}
