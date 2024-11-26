import { BotFeatureType, XPost, XPublisherAccount } from "@prisma/client";
import { twitterAuthService } from "src/services";
import { XPostWithAccount } from "src/xposts/model/xpost-with-account";
import { Bot } from "./bot";
import { XPostReplyAnalysisResult } from "./x-post-reply-analysis-result";

export abstract class BotFeature {
  private lastExecutionTime: number = 0;
  protected botAccount: XPublisherAccount; // Authenticated X account for publishing

  /**
   * @param runLoopMinIntervalSec In case there is a run loop implemented, how often should it be launched 
   */
  constructor(public type: BotFeatureType, public bot: Bot, public runLoopMinIntervalSec?: number) { }

  async initialize() {
    this.botAccount = await twitterAuthService().getAuthenticatedBotAccount();
  }

  /**
   * Method regularly called by the scheduler so the feature can execute background operations.
   * Scheduled executions of all features run sequentially to make sure there is not parrallel conflict
   * while handling X posts, API calls, etc.
   */
  scheduledExecution?();

  /**
   * A new post has been fetched from X and it mentions our bot name, or it's been posted by an account
   * we are tracking, etc. 
   * 
   * Use this callback for pre-treatment of posts right after they are found, not to reply.
   */
  onUpcomingXPost?(post: XPost);

  /**
   * Decide to reply to the given post or not on X. If so, return a generated reply for the replier to
   * merge it with other potential features replies.
   */
  studyReplyToXPost?(post: XPostWithAccount): Promise<XPostReplyAnalysisResult>;

  /**
   * Tells if this feature can be used.
   * TODO: REWORD, NOT IN ENV ANY MORE, NOW CONFIGED FOR EACH BOT
   */
  public isEnabled(): boolean {
    return true;
  }

  /**
   * Tells if at least runLoopMinIntervalSec seconds have elapsed since the last execution.
   */
  public canExecuteNow(): boolean {
    if (!this.isEnabled() || !this.runLoopMinIntervalSec || !this.scheduledExecution)
      return false;

    const currentTime = Date.now();
    return (currentTime - this.lastExecutionTime) >= this.runLoopMinIntervalSec * 1000;
  }

  public updateLastExecutionTime() {
    this.lastExecutionTime = Date.now();
  }
}