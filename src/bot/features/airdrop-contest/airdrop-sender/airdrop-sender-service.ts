import { Injectable, Logger } from "@nestjs/common";
import { BotFeature } from "src/bot/model/bot-feature";
import { BotConfig } from "src/config/bot-config";
import { PrismaService } from "src/prisma/prisma.service";

/**
 * This feature sends airdrop snapshots to destination addresses on chain.
 */
@Injectable()
export class AirdropSenderService extends BotFeature {
  private logger = new Logger("AirdropSender");

  constructor(private prisma: PrismaService) {
    super(10);
  }

  public isEnabled(): boolean {
    return BotConfig.AirdropContest.IsActive;
  }

  scheduledExecution() {

  }
}