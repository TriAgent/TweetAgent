import { Annotation } from "@langchain/langgraph";
import { Injectable, Logger } from "@nestjs/common";
import { BotFeature } from "src/bot/model/bot-feature";

export const contestReposterStateAnnotation = Annotation.Root({
  reply: Annotation<string>
});

/**
 * This feature publishes RTs of elected contest posts from time to time.
 */
@Injectable()
export class XPostContestReposterService extends BotFeature {
  private logger = new Logger("XPostContestReposter");

  constructor() {
    super(10);
  }

  scheduledExecution() {
    this.logger.log(`Reposter running TBD`);


  }
}