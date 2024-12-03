import { apiGet } from "@services/api-base";
import { backendUrl } from "@services/backend/backend";
import { wsService } from "@services/backend/websocket-proxy";
import { ActiveFeature, BotFeatureProvider as BotFeatureProviderDTO, BotFeatureType } from "@x-ai-wallet-bot/common";
import { plainToInstance } from "class-transformer";
import { BehaviorSubject } from "rxjs";
import { FeatureHandler } from "./feature-handler";
import { XPostContestHandler } from "./handlers/x-post-contest-handler.handler";
import { XPostHandler } from "./handlers/x-post.handler";
import { BotFeatureProvider } from "./model/bot-feature-provider";

export const activeFeatureAction$ = new BehaviorSubject<ActiveFeature>(undefined);
export const botFeatureProviders$ = new BehaviorSubject<BotFeatureProvider[]>(undefined);

export const featureHandlers : FeatureHandler[] = [
  new XPostHandler(),
  new XPostContestHandler(BotFeatureType.AirdropContest_XPostContestHandler)
];

const fetchBotFeatureProviders = async () => {  
  const rawProviders = await apiGet<BotFeatureProviderDTO[]>(`${backendUrl}/bot-features/providers`);
  if (rawProviders) {
    const providers = plainToInstance(BotFeatureProvider, rawProviders, {excludeExtraneousValues: true});
    console.log("Got feature providers:", providers);
    botFeatureProviders$.next(providers);
    return providers;
  }
}

export const friendlyFeatureKey = (featureKey: string):string => {
  return featureKey.replaceAll("_", ": ");
}

wsService.onNewMessage$.subscribe(message => {
  if (message.op === "active-feature") {
    activeFeatureAction$.next(message.data);
  }
});

fetchBotFeatureProviders();