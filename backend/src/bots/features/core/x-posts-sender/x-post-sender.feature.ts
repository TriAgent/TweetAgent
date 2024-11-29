import { BotFeatureType } from '@prisma/client';
import { Bot } from 'src/bots/model/bot';
import { BotFeature } from 'src/bots/model/bot-feature';
import { AppLogger } from 'src/logs/app-logger';
import { xPostsService } from 'src/services';

export class XPostSenderFeature extends BotFeature {
  private logger = new AppLogger("XPostSender", this.bot);

  constructor(bot: Bot) {
    super(BotFeatureType.Core_XPostsSender, bot, 5);
  }

  public async scheduledExecution() {
    // Send our pending posts
    await xPostsService().sendPendingXPosts();
  }
}