import { wsService } from "@services/backend/websocket-proxy";
import { XPostUpdate } from "@x-ai-wallet-bot/common";
import { plainToInstance } from "class-transformer";
import { Subject } from "rxjs";
import { XPost } from "./model/x-post";

/**
 * Post created or updated
 */
export const onPostUpdate$ = new Subject<XPost>();

wsService.onNewMessage$.subscribe(message => {
  if (message.op === "xpost") {
    const postUpdate = message as XPostUpdate;
    const post = plainToInstance(XPost, postUpdate.data, {excludeExtraneousValues:true});
    onPostUpdate$.next(post);
  }
});