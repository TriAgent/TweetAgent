import { XPost } from "@services/posts/model/x-post";
import { BotFeatureType } from "@x-ai-wallet-bot/common";

export type PostTag = {
  label: string; // The tag title/label
  type: "default" | "success" | "warning" | "error";
}

/**
 * Class allowing to customize some frontend behaviours for some features, in some situations.
 * UI sometimes calls handlers before rendering.
 */
export abstract class FeatureHandler {
  constructor(public type?: BotFeatureType) {}

  public getPostTags(post:XPost): PostTag[] {
    return [];
  }
}