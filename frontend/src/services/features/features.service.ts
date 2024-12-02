import { apiGet } from "@services/api-base";
import { backendUrl } from "@services/backend/backend";
import { wsService } from "@services/backend/websocket-proxy";
import { ActiveFeature, BotFeatureProvider as BotFeatureProviderDTO } from "@x-ai-wallet-bot/common";
import { plainToInstance } from "class-transformer";
import { BehaviorSubject } from "rxjs";
import { BotFeatureProvider } from "./model/bot-feature-provider";

export const activeFeatureAction$ = new BehaviorSubject<ActiveFeature>(undefined);
export const botFeatureProviders$ = new BehaviorSubject<BotFeatureProvider[]>(undefined);

const fetchBotFeatureProviders = async () => {  
  const rawProviders = await apiGet<BotFeatureProviderDTO<any>[]>(`${backendUrl}/bot-features/providers`);
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