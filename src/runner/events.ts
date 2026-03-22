import type { State } from '../state/state.js';

/** EventType represents a runner lifecycle event. */
export type EventType =
  | 'node_start'
  | 'node_complete'
  | 'node_error'
  | 'flow_start'
  | 'flow_complete';

/** Event holds information about a runner event. */
export interface Event {
  type: EventType;
  nodeName?: string;
  nodeType?: string;
  state?: State;
  error?: Error;
}

/** EventHandler receives events during flow execution. */
export type EventHandler = (event: Event) => void;
