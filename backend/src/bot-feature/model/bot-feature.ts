import { BotFeature as DBBotFeature, XPost } from "@prisma/client";
import { Bot } from "src/bots/model/bot";
import { XPostWithAccount } from "src/xposts/model/xpost-with-account";
import { AnyBotFeatureProvider, BotFeatureConfigBase } from "./bot-feature-provider";
import { XPostReplyAnalysisResult } from "./x-post-reply-analysis-result";

export abstract class BotFeature<ConfigType extends BotFeatureConfigBase> {
  private lastExecutionTime: number = 0;
  //public config: ConfigType;

  /**
   * @param runLoopMinIntervalSec In case there is a run loop implemented, how often should it be launched 
   */
  constructor(public provider: AnyBotFeatureProvider, public bot: Bot, public dbFeature: DBBotFeature, public runLoopMinIntervalSec?: number) { }

  async initialize() { }

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
   */
  public isEnabled(): boolean {
    return this.config.enabled;
  }

  public get config(): ConfigType {
    return this.dbFeature.config as ConfigType;
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

  /**
   * Called by other services when some of the underlying feature gets modified, 
   * for example from the dashboard.
   */
  public updateDBFeature(dbFeature: DBBotFeature) {
    this.dbFeature = dbFeature;
  }
}

export type AnyBotFeature = BotFeature<BotFeatureConfigBase>;