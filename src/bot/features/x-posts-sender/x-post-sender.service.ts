import { Injectable, Logger } from '@nestjs/common';
import { XPostsService } from 'src/xposts/xposts.service';
import { BotFeature } from '../../model/bot-feature';

@Injectable()
export class XPostSenderService extends BotFeature {
  private logger = new Logger("XPostSender");

  constructor(
    private xPosts: XPostsService,
  ) {
    super(5);
  }

  public async scheduledExecution() {
    // Send our pending posts
    await this.xPosts.sendPendingXPosts();
  }
}