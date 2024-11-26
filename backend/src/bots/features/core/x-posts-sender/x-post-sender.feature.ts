import { Logger } from '@nestjs/common';
import { BotFeatureType } from '@prisma/client';
import { Bot } from 'src/bots/model/bot';
import { BotFeature } from 'src/bots/model/bot-feature';
import { xPostsService } from 'src/services';

export class XPostSenderFeature extends BotFeature {
  private logger = new Logger("XPostSender");

  constructor(bot: Bot) {
    super(BotFeatureType.Core_XPostsSender, bot, 5);
  }

  public async scheduledExecution() {
    // Send our pending posts
    await xPostsService().sendPendingXPosts();
  }
}