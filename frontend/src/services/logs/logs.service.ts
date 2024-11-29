import { wsService } from "@services/backend/websocket-proxy";
import { Log, LogType, LogUpdate } from "@x-ai-wallet-bot/common";
import { Methods } from 'console-feed/lib/definitions/Methods';
import { BehaviorSubject } from "rxjs";

export const logs$ = new BehaviorSubject<Log[]>([]);

export const logTypeToConsoleMethod = (logType: LogType): Methods => {
  switch (logType) {
    case LogType.Warning: return "warn";
    case LogType.Error: return "error";
    case LogType.Debug: return "debug";
    default: 
      return "log";
  }
}

wsService.onNewMessage$.subscribe(message => {
  if (message.op === "log") {
    const logsUpdate = message as LogUpdate;
    logs$.next([...logs$.value, logsUpdate.data]);
  }
});