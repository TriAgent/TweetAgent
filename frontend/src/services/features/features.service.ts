import { wsService } from "@services/backend/websocket-proxy";
import { ActiveFeature } from "@x-ai-wallet-bot/common";
import { BehaviorSubject } from "rxjs";

export const activeFeatureAction$ = new BehaviorSubject<ActiveFeature>(undefined);

export const friendlyFeatureKey = (featureKey: string):string => {
  return featureKey.replaceAll("_", ": ");
}

wsService.onNewMessage$.subscribe(message => {
  if (message.op === "active-feature") {
    activeFeatureAction$.next(message.data);
  }
});