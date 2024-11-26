import { Injectable } from "@nestjs/common";
import { BotFeatureType } from "@prisma/client";
import { PrismaService } from "src/prisma/prisma.service";
import { AirdropSenderFeature } from "./features/airdrop-contest/airdrop-sender/airdrop-sender.feature";
import { Bot } from "./model/bot";
import { BotFeature } from "./model/bot-feature";

@Injectable()
export class BotFeaturesService {
  private features: BotFeature[];

  constructor(private prisma: PrismaService) { }

  /* 
    public registerFeatures(features: BotFeature[]) {
      this.features = features;
    }
   */
  /*  public getFeatures(): BotFeature[] {
     return this.features;
   } */

  /**
   * Instantiates a feature instance specific to a bot
   */
  public async newFromKey(bot: Bot, featureKey: BotFeatureType): Promise<BotFeature> {
    let feature: BotFeature;
    switch (featureKey) {
      case BotFeatureType.AirdropContest_AirdropSender:
        feature = new AirdropSenderFeature(bot);
        break;
      default:
        throw new Error(`Feature "${featureKey}" is not supported`);
    }

    // Safety check
    if (feature.runLoopMinIntervalSec === undefined && feature.scheduledExecution !== undefined)
      throw new Error(`Feature ${feature.type} has an execution method but no loop interval configured!`);

    await feature.initialize();

    return feature;
  }

  /**
   * Ensures all required bot features types are created in database for the given bot
   */
  public async ensureBotRequiredFeatures(bot: Bot) {
    const requiredBotFeatureTypes = Object.values(BotFeatureType);
    for (const requiredBotFeatureType of requiredBotFeatureTypes) {
      await this.prisma.botFeatureConfig.upsert({
        where: {
          botId_key: {
            botId: bot.dbBot.id,
            key: requiredBotFeatureType
          }
        },
        create: {
          bot: { connect: { id: bot.dbBot.id } },
          key: requiredBotFeatureType,
          enabled: false,
          config: {}
        },
        update: {}
      })
    }
  }
}