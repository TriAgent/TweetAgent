import { StringOutputParser } from "@langchain/core/output_parsers";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { RunnablePassthrough, RunnableSequence } from "@langchain/core/runnables";
import { OpenAIEmbeddings } from "@langchain/openai";
import { Injectable, Logger } from '@nestjs/common';
import { MemoryVectorStore } from "langchain/vectorstores/memory";
import { BotFeature } from "src/bot/model/bot-feature";
import { BotConfig } from "src/config/bot-config";
import { LangchainService } from "src/langchain/langchain.service";
import { forbiddenWordsPromptChunk, tweetCharactersSizeLimitationPromptChunk } from "src/langchain/prompt-parts";
import { formatDocumentsAsString } from "src/langchain/utils";
import { PrismaService } from "src/prisma/prisma.service";
import { TwitterAuthService } from "src/twitter/twitter-auth.service";
import { TwitterService } from "src/twitter/twitter.service";
import { XPostsService } from "src/xposts/xposts.service";
import { botPersonalityPromptChunk } from "../../../model/prompt-parts/news-summary";
import { SummaryDocument, SummaryPostLoader } from "./summary-post-loader";

/**
 * TODO:
 * [langchain] only for web results: make a summary of the web search result to make the stored content smaller
*/

const PostXSummaryDelaySec = 1 * 60 * 60; // 1 hour
//const MinTimeBetweenXPosts = PostXSummaryDelaySec; // Used by retries when posts have failed to publish. Not more frequently than this delay for posts.

/**
 * This service uses recent X news posts we have in database to produce summaries from time to time.
 * Summaries are posted on X.
 */
@Injectable()
export class XNewsSummaryWriterService extends BotFeature {
  private logger = new Logger("XSummaryWriter");

  constructor(
    private twitterAuth: TwitterAuthService,
    private twitter: TwitterService,
    private prisma: PrismaService,
    private langchain: LangchainService,
    private xPosts: XPostsService
  ) {
    super(PostXSummaryDelaySec);
  }

  public isEnabled(): boolean {
    return BotConfig.NewsSummaryBot.IsActive;
  }

  public scheduledExecution() {
    return this.createRecentTweetsSummary();
  }

  public async createRecentTweetsSummary() {
    const loader = new SummaryPostLoader(this.prisma);
    const docs = await loader.load();

    if (docs?.length < 3) {
      this.logger.log("Not enough recent X posts available to create a summary");
    }
    else {
      this.logger.log(`Creating recent X posts summary`);
      this.logger.log("Documents used for the summary:");
      this.logger.log(docs);

      const vectorStore = await MemoryVectorStore.fromDocuments(
        docs,
        new OpenAIEmbeddings({ openAIApiKey: this.langchain.openAIAPIKey, verbose: true })
      );
      const vectorStoreRetriever = vectorStore.asRetriever();

      const REQUEST_TEMPLATE = `
        Below is a list of several posts from twitter. 
        - Make a short summary that combines all of them. 
        - Your text should be smooth easy to read, with ideas connected to each other when possible. 
        - Try to connect sentences with coordination words instead of dots.
        ---------------- 
        {context}
      `;

      const prompt = ChatPromptTemplate.fromMessages([
        ["system", botPersonalityPromptChunk()],
        ["system", forbiddenWordsPromptChunk()],
        ["system", tweetCharactersSizeLimitationPromptChunk()],
        ["system", REQUEST_TEMPLATE]
      ]);

      const model = this.langchain.getModel(); // high temperature for more random output

      const chain = RunnableSequence.from([
        {
          context: vectorStoreRetriever.pipe(formatDocumentsAsString),
          question: new RunnablePassthrough(),
        },
        prompt,
        model,
        new StringOutputParser(),
      ]);

      const tweetSummary = await chain.invoke(""); // Use "" not {} otherwise "text.replace is not a function" in vector store

      if (!tweetSummary) {
        this.logger.warn(`Failed to produce a tweet summary`);
      }
      else {
        await this.createNewsSummaryForX(tweetSummary, docs);
      }
    }
  }

  /**
   * Creates a new post in database, ready to publish on X.
   * Publishing will be queued and handled by another task.
   */
  private async createNewsSummaryForX(tweetContent: string, docs: SummaryDocument[]): Promise<void> {
    // Create draft
    const dbPost = await this.prisma.xPost.create({
      data: {
        publishRequestAt: new Date(),
        text: tweetContent,
        xAccount: { connect: { userId: this.botAccount.userId } },
        botAccount: { connect: { userId: this.botAccount.userId } }
      }
    });

    // Mark source posts as used/summarized
    await this.prisma.xPost.updateMany({
      where: { id: { in: docs.map(d => d.metadata.id) } },
      data: { summarizedById: dbPost.id }
    });
  }
}

/*
    // Tools
    const tavilyTool = new TavilySearchResults({
      apiKey: this.langchain.tavilyAPIKey,
      maxResults: 1
    });
    const tools = [];// [tavilyTool];
    const toolNode = new ToolNode(tools);

    // LLM model
    const model = new ChatOpenAI({ apiKey: this.langchain.openAIAPIKey, model: 'gpt-4o-2024-08-06', temperature: 0 }).bindTools(tools);

    // Define the function that determines whether to continue or not
    const shouldContinue = ({ messages }: typeof MessagesAnnotation.State): string => {
      const lastMessage = messages[messages.length - 1];

      // If the LLM makes a tool call, then we route to the "tools" node
      if (lastMessage.additional_kwargs.tool_calls) {
        return "tools";
      }
      // Otherwise, we stop (reply to the user) using the special "__end__" node
      return "__end__";
    }

    // Define the function that calls the model
    const callModel = async (state: typeof MessagesAnnotation.State) => {
      const response = await model.invoke(state.messages);
      // We return a list, because this will get added to the existing list
      return { messages: [response] };
    }

    // Define a new graph
    const workflow = new StateGraph(MessagesAnnotation)
      .addNode("agent", callModel)
      .addNode("tools", toolNode)
      .addEdge("__start__", "agent") // __start__ is a special name for the entrypoint
      .addEdge("tools", "agent")
      .addConditionalEdges("agent", shouldContinue);

    const app = workflow.compile();

    const finalState = await app.invoke({
      messages: [new HumanMessage("what is the weather in sf")],
    });
    console.log(finalState.messages[finalState.messages.length - 1].content);

    // const nextState = await app.invoke({
    //   // Including the messages from the previous run gives the LLM context.
    //   // This way it knows we're asking about the weather in NY
    //   messages: [...finalState.messages, new HumanMessage("what about ny")],
    // });
    // console.log(nextState.messages[nextState.messages.length - 1].content);
*/