import { Injectable } from '@nestjs/common';
import { BotFeature, DebugComment, XPost } from '@prisma/client';
import { AppLogger } from 'src/logs/app-logger';
import { PrismaService } from 'src/prisma/prisma.service';
import { DispatcherService } from 'src/websockets/dispatcher.service';

@Injectable()
export class DebugCommentService {
  private logger = new AppLogger("DebugComment");

  constructor(
    private prisma: PrismaService,
    private dispatcher: DispatcherService
  ) { }

  /**
   * @param postId DB Id, not X
   */
  public getComments(postId?: string): Promise<DebugComment[]> {
    return this.prisma.debugComment.findMany({
      where: {
        ...(postId && { postId })
      }
    });
  }

  public async createPostComment(post: XPost, text: string, feature?: BotFeature): Promise<DebugComment> {
    this.logger.log("Creating post debug comment:");
    this.logger.log(text);

    const comment = await this.prisma.debugComment.create({
      data: {
        post: { connect: { id: post.id } },
        ...(feature?.botId && { bot: { connect: { id: feature?.botId } } }),
        ...(feature && { feature: { connect: { id: feature.id } } }),
        text
      }
    });

    this.dispatcher.emitDebugComment(comment);

    return comment;
  }
}
