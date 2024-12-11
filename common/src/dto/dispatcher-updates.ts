import { DebugComment } from "./debug-comment";
import { ActiveFeature } from "./feature";
import { Log } from "./log";
import { State } from "./state";
import { XPost } from "./x-post";

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

/**
 * Post created or modified
 */
export type XPostUpdate = DispatcherUpdate<"xpost", XPost>;

export type ActiveFeatureUpdate = DispatcherUpdate<"active-feature", ActiveFeature>;

export type DebugCommentUpdate = DispatcherUpdate<"debugcomment", DebugComment>;