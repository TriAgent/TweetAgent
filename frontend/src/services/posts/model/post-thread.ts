import { XPost as XPostDTO } from "@x-ai-wallet-bot/common";
import { XPost } from "./x-post";

export type PostChildrenDTO = {
  root?: XPostDTO;
  posts: XPostDTO[];
}

export type PostChildren = {
  root?: XPost;
  posts: XPost[];
}