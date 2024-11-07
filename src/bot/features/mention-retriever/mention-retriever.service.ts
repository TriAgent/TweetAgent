import { Injectable, Logger } from "@nestjs/common";
import { LangchainService } from "src/langchain/langchain.service";
import { PrismaService } from "src/prisma/prisma.service";
import { TwitterService } from "src/twitter/twitter.service";
import { XPostsService } from "src/xposts/xposts.service";

const FetchXPostsDelay = 5 * 60 * 1000; // 5 minutes

/**
 * This service regularly fetches twitter posts that mention our bot name.
 */
@Injectable()
export class MentionRetrieverService {
  private logger = new Logger("MentionRetriever");

  constructor(
    private prisma: PrismaService,
    private twitter: TwitterService,
    private xPosts: XPostsService,
    private langchain: LangchainService
  ) { }

  public run() {
  }

  // private async categorizeMentions() {
  //   const recentMentions = await this.prisma.xPost.findMany({
  //     where: {
  //       type: XPostType.ThirdPartyNews,
  //       isRealNews: null,
  //       createdAt: { gt: moment().subtract(2, "days").toDate() } // care only about recent enough tweets for now
  //     },
  //     orderBy: { createdAt: "desc" },
  //   })

  //   if (recentMentions?.length > 0) {
  //     this.logger.log(`Categorizing ${recentMentions.length} recent mentions`);

  //     for (var post of recentPosts) {
  //       await this.categorizeAsRealNews(post);
  //     }
  //   }
  // }

  /**
   * Ask AI to evaluate if a post content provide real news/information, so we can filter out garbage
   * or not relevant content.
   */
  // private async categorizeAsRealNews(post: XPost) {
  //   const tools = [
  //     categorizeNewsTool(this.logger, this.prisma, post) // ability to update a DB post with "isRealNews" info
  //   ];
  //   const mainAgent = categorizeNewsAgent(tools, post);

  //   const graph = new StateGraph(MessagesAnnotation).addNode("agent", mainAgent);
  //   graph.addEdge(START, "agent").addEdge("agent", END);
  //   const app = graph.compile();

  //   // Invoke tools targeted by the graph
  //   const result: { messages: BaseMessage[] } = await app.invoke({});
  //   await this.langchain.executeAllToolCalls(tools, result);
  // }
}

