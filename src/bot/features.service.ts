import { Injectable } from "@nestjs/common";
import { BotFeature } from "./model/bot-feature";

@Injectable()
export class BotFeaturesService {
  private features: BotFeature[];

  public registerFeatures(features: BotFeature[]) {
    this.features = features;
  }

  public getFeatures(): BotFeature[] {
    return this.features;
  }
}