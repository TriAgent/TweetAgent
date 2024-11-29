import { apiPut } from "@services/api-base";
import { backendUrl } from "@services/backend/backend";
import { notifyDataSaved } from "@services/ui-ux/ui.service";
import { AiPrompt as AiPromptDTO } from "@x-ai-wallet-bot/common";
import { Expose, instanceToPlain } from "class-transformer";

export class AiPrompt {
  @Expose() public id: string;
  @Expose() public key: string;
  @Expose() public text: string;
  @Expose() public botId: string;

  /**
   * Updates one of the root properties
   */
  public async updateProperty(key: Exclude<keyof AiPromptDTO, "id">) {
    const result = await apiPut(`${backendUrl}/bots/${this.botId}/prompts/${this.id}`, {
      prompt: instanceToPlain(this, {excludeExtraneousValues: true}), 
      key
    }, undefined, "Failed to update prompt");

    if (result)
      notifyDataSaved();
  }
}