import { apiGet, apiPost, apiPut } from "@services/api-base";
import { backendUrl } from "@services/backend/backend";
import { notifyDataSaved } from "@services/ui-ux/ui.service";
import { AiPrompt as AiPromptDTO, Bot as BotDTO, BotFeatureConfig as BotFeatureConfigDTO, LinkerTwitterAccountInfo, TwitterAuthenticationRequest } from "@x-ai-wallet-bot/common";
import { Expose, instanceToPlain, plainToInstance } from "class-transformer";
import { BehaviorSubject } from "rxjs";
import { setActiveBot } from "../bots.service";
import { AiPrompt } from "./ai-prompt";
import { BotFeatureConfig } from "./bot-feature-config";

export class Bot {
  @Expose() public id: string;
  @Expose() public name: string;
  @Expose() public twitterUserId?: string; // X user id eg: 1849649146669695000
  @Expose() public twitterUserName?: string; // X user name eg: Proctar Elastos
  @Expose() public twitterUserScreenName?: string; // X user name eg: proctar2626
  @Expose() public twitterAccessToken?: string; // X access token for this user, after web/pin authorization
  @Expose() public twitterAccessSecret?: string; // X secret token for this user, after web/pin authorization

  public prompts$ = new BehaviorSubject<AiPrompt[]>(undefined);
  public features$ = new BehaviorSubject<BotFeatureConfig[]>(undefined);

  public async initialize(): Promise<void> {
    await Promise.all([
      this.fetchPrompts(),
      this.fetchFeatureConfigs()
    ]);
  }

  /**
   * Updates one of the root properties
   */
  public async updateProperty(key: Exclude<keyof BotDTO, "id">) {
    await apiPut(`${backendUrl}/bots`, {
      bot: instanceToPlain(this, {excludeExtraneousValues: true}), 
      key
    }, undefined, "Failed to update bot");

    notifyDataSaved();
  }

  private async fetchPrompts() {
    const rawPrompts = await apiGet<AiPromptDTO[]>(`${backendUrl}/bots/${this.id}/prompts`);
    if (rawPrompts) {
      const prompts = plainToInstance(AiPrompt, rawPrompts, {excludeExtraneousValues: true});
      console.log("Got prompts", prompts)
      this.prompts$.next(prompts);
    }
  }

  private async fetchFeatureConfigs() {
    const rawConfigs = await apiGet<BotFeatureConfigDTO[]>(`${backendUrl}/bots/${this.id}/features`);
    if (rawConfigs) {
      const features = plainToInstance(BotFeatureConfig, rawConfigs, {excludeExtraneousValues: true});
      console.log("Got features", features)
      this.features$.next(features);
    }
  }

  public async startTwitterAuth():Promise<TwitterAuthenticationRequest> {
    return apiPost<TwitterAuthenticationRequest>(`${backendUrl}/bots/${this.id}/twitter/auth`, {}, undefined, "Failed to start twitter auth");
  }

  public async finalizeTwitterAuthWithPIN(request: TwitterAuthenticationRequest, pinCode: string) {
    const authResult = await apiPut<LinkerTwitterAccountInfo>(`${backendUrl}/bots/${this.id}/twitter/auth`, {request, pinCode});

this.twitterUserId = authResult.twitterUserId;

    // Force UI refresh by overwriting ourselves
    setActiveBot(this);

    return authResult;
  }

}