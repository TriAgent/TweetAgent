import { ActiveFeature } from "./feature";
import { Log } from "./log";
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

export type LogUpdate = DispatcherUpdate<"log", Log>;

export type ActiveFeatureUpdate = DispatcherUpdate<"active-feature", ActiveFeature>;