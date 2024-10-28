import { Injectable } from "@nestjs/common";
import { CryptoNewsService } from "src/crypto-news/crypto-news.service";
import { XReplierService } from "./x-replier.service";
import { XSummaryWriterService } from "./x-summary-writer.service";

@Injectable()
export class BotService {
  constructor(
    private xSummaryWriter: XSummaryWriterService,
    private xReplier: XReplierService,
    private news: CryptoNewsService
  ) { }

  public run() {
    // Launch the news service
    this.news.run();

    void this.xSummaryWriter.run();
    void this.xReplier.run();
  }
}