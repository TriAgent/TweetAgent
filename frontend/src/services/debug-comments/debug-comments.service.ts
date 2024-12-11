import { wsService } from "@services/backend/websocket-proxy";
import { DebugComment, DebugCommentUpdate } from "@x-ai-wallet-bot/common";
import { Subject } from "rxjs";

export const onDebugComment$ = new Subject<DebugComment>();

wsService.onNewMessage$.subscribe(message => {
  if (message.op === "debugcomment") {
    const debugCommentUpdate = message as DebugCommentUpdate;
    onDebugComment$.next(debugCommentUpdate.data);
  }
});