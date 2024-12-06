import { StringOutputParser } from "@langchain/core/output_parsers";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { RunnablePassthrough, RunnableSequence } from "@langchain/core/runnables";
import { OpenAIEmbeddings } from "@langchain/openai";
import { BotFeatureGroupType, BotFeatureType } from "@x-ai-wallet-bot/common";
import { MemoryVectorStore } from "langchain/vectorstores/memory";
import { BotFeature } from "src/bot-feature/model/bot-feature";
import { BotFeatureProvider, BotFeatureProviderConfigBase, DefaultFeatureConfigType } from "src/bot-feature/model/bot-feature-provider";
import { Bot } from "src/bots/model/bot";
import { forbiddenWordsPromptChunk, tweetCharactersSizeLimitationPromptChunk } from "src/langchain/prompt-parts";
import { formatDocumentsAsString } from "src/langchain/utils";
import { AppLogger } from "src/logs/app-logger";
import { langchainService, xPostsService } from "src/services";
import { z, infer as zodInfer } from "zod";
import { createNewsSummary } from "./default-prompts";
import { SummaryDocument, SummaryPostLoader } from "./summary-post-loader";

const PostXSummaryDelaySec = 1 * 60 * 60; // 1 hour

const FeatureConfigFormat = BotFeatureProviderConfigBase.extend({
  simulatedSummaries: z.boolean().describe('If true, summary news remain in database and are never published to X'),
  _prompts: z.object({
    createNewsSummary: z.string()
  })
}).strict();

type FeatureConfigType = Required<zodInfer<typeof FeatureConfigFormat>>;

export class XNewsSummaryWriterProvider extends BotFeatureProvider<XNewsSummaryWriterFeature, typeof FeatureConfigFormat> {
  constructor() {
    super(
      BotFeatureGroupType.NewsSummaries,
      BotFeatureType.NewsSummaries_XNewsSummaryWriter,
      `Summary writer`,
      `From time to time, write news summary from cached news posts, and publish to X`,
      FeatureConfigFormat,
      (bot: Bot) => new XNewsSummaryWriterFeature(this, bot)
    );
  }

  public getDefaultConfig(): DefaultFeatureConfigType<z.infer<typeof FeatureConfigFormat>> {
    return {
      enabled: true,
      simulatedSummaries: true,
      _prompts: {
        createNewsSummary
      }
    }
  }
}

/**
 * This service uses recent X news posts we have in database to produce summaries from time to time.
 * Summaries are posted on X.
 */
export class XNewsSummaryWriterFeature extends BotFeature<FeatureConfigType> {
  private logger = new AppLogger("XSummaryWriter", this.bot);

  constructor(provider: XNewsSummaryWriterProvider, bot: Bot) {
    super(provider, bot, PostXSummaryDelaySec);
  }

  public scheduledExecution() {
    return this.createRecentTweetsSummary();
  }

  public async createRecentTweetsSummary() {
    const loader = new SummaryPostLoader(this.bot);
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
        new OpenAIEmbeddings({ openAIApiKey: langchainService().openAIAPIKey, verbose: true })
      );
      const vectorStoreRetriever = vectorStore.asRetriever();

      const prompt = ChatPromptTemplate.fromMessages([
        ["system", this.bot.getRootFeature().config._prompts.personality],
        ["system", forbiddenWordsPromptChunk()],
        ["system", tweetCharactersSizeLimitationPromptChunk()],
        ["system", this.config._prompts.createNewsSummary]
      ]);

      const model = langchainService().getModel(); // high temperature for more random output

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
    const dbPost = await xPostsService().createPost(this.bot.dbBot, this.bot.dbBot.twitterUserId, tweetContent, {
      publishRequestAt: new Date(),
      isSimulated: this.config.simulatedSummaries
    });

    // Mark source posts as used/summarized
    for (const id of docs.map(d => d.metadata.id)) {
      await xPostsService().updatePost(id, { summarizedById: dbPost.id });
    }
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