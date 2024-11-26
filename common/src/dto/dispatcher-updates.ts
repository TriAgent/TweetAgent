import { State } from "./state";

export type DispatcherUpdate<Op, DataType> = {
  op: Op;
  data?: DataType;
}

export type ReadyUpdate = DispatcherUpdate<"ready", null>;

/**
 * Global backend state (active or not, etc)
 */
export type StateUpdate = DispatcherUpdate<"state", State>;
