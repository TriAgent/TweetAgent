import { BotFeatureType } from '@prisma/client';
import { BotLogger } from 'src/bots/bot.logger';
import { Bot } from 'src/bots/model/bot';
import { BotFeature } from 'src/bots/model/bot-feature';
import { xPostsService } from 'src/services';

export class XPostSenderFeature extends BotFeature {
  private logger = new BotLogger("XPostSender", this.bot);

  constructor(bot: Bot) {
    super(BotFeatureType.Core_XPostsSender, bot, 5);
  }

  public async scheduledExecution() {
    // Send our pending posts
    await xPostsService().sendPendingXPosts();
  }
}