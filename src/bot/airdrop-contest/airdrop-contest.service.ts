import { Injectable } from "@nestjs/common";
import { MentionRetrieverService } from "../features/mention-retriever/mention-retriever.service";

@Injectable()
export class AirdropContestService {
  constructor(
    private mentionRetriever: MentionRetrieverService
  ) { }

  public run() {
    this.mentionRetriever.run();
  }
}