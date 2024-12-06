import { apiPost, apiPut } from "@services/api-base";
import { backendUrl } from "@services/backend/backend";
import { notifyDataSaved } from "@services/ui-ux/ui.service";
import { BotFeature as BotFeatureDTO, BotFeatureType } from "@x-ai-wallet-bot/common";
import { Expose, instanceToPlain, Transform } from "class-transformer";
import { BehaviorSubject } from "rxjs";

export class BotFeature implements Omit<BotFeatureDTO, "config"> {
  @Expose() public id: string;
  @Expose() public botId: string;
  @Expose() public type: BotFeatureType;
  
  @Expose() 
  @Transform(({ value }) =>new BehaviorSubject<any>(value), { toClassOnly: true })  
  @Transform(({ value }) => value.value, { toPlainOnly: true }) 
  public config: BehaviorSubject<any>; 

  /**
   * Updates one of the root properties
   */
  public async updateProperty(key: Exclude<keyof BotFeatureDTO, "id">) {
    const payload = {
      feature: instanceToPlain(this, { excludeExtraneousValues: true }),
      key
    };
    const result = await apiPut(`${backendUrl}/bots/${this.botId}/features/${this.id}`, payload, undefined, "Failed to update feature");

    if (result)
      notifyDataSaved();
  }

  /**
   * Restores the whole feature config to its initial state.
   */
  public async resetConfig() {
    const newConfig = await apiPost(`${backendUrl}/bots/${this.botId}/features/${this.id}/config/reset`, {}, undefined, "Failed to reset feature config");
    if (newConfig) {
      this.config.next(newConfig);
      notifyDataSaved();
    }
  }
}