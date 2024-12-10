import { Controller, Get, Query } from '@nestjs/common';
import { DebugCommentService } from './debug-comment.service';

@Controller('debug-comments')
export class DebugCommentController {
  constructor(
    private debugCommentService: DebugCommentService
  ) { }

  @Get('')
  public getComments(@Query('postId') postId?: string) {
    return this.debugCommentService.getComments(postId);
  }
}
