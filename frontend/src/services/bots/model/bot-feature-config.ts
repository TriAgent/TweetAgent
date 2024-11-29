import { apiPut } from "@services/api-base";
import { backendUrl } from "@services/backend/backend";
import { notifyDataSaved } from "@services/ui-ux/ui.service";
import { BotFeatureConfig as BotFeatureConfigDTO } from "@x-ai-wallet-bot/common";
import { Expose, instanceToPlain } from "class-transformer";

export class BotFeatureConfig {
  @Expose() public id: string;
  @Expose() public botId: string;
  @Expose() public key: string;
  @Expose() public enabled: boolean;

  /**
   * Updates one of the root properties
   */
  public async updateProperty(key: Exclude<keyof BotFeatureConfigDTO, "id">) {
    const result = await apiPut(`${backendUrl}/bots/${this.botId}/features/${this.id}`, {
      feature: instanceToPlain(this, {excludeExtraneousValues: true}), 
      key
    }, undefined, "Failed to update feature");

    if (result)
      notifyDataSaved();
  }
}