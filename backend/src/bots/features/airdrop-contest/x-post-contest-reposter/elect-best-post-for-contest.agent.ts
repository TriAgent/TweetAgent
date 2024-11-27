import { OpenAIEmbeddings } from "@langchain/openai";
import { Logger } from "@nestjs/common";
import { MemoryVectorStore } from "langchain/vectorstores/memory";
import { BotFeature } from "src/bots/model/bot-feature";
import { forbiddenWordsPromptChunk, tweetCharactersSizeLimitationPromptChunk } from "src/langchain/prompt-parts";
import { aiPromptsService, langchainService } from "src/services";
import { z } from "zod";
import { PendingContestPostLoader } from "./pending-contest-post-loader";
import { contestReposterStateAnnotation } from "./x-post-contest-reposter.feature";

/**
 * Determines if the post is an airdrop address update or not
 */
export const electBestPostForContestAgent = (feature: BotFeature, logger: Logger) => {
  return async (state: typeof contestReposterStateAnnotation.State) => {
    const loader = new PendingContestPostLoader(feature.bot);
    const docs = await loader.load();

    if (docs?.length < 1) {
      logger.log("Not enough eligible contest X posts available to create a contest post RT");
      return state;
    }

    const vectorStore = await MemoryVectorStore.fromDocuments(
      docs,
      new OpenAIEmbeddings({ openAIApiKey: langchainService().openAIAPIKey, verbose: true, stripNewLines: false })
    );
    const vectorStoreRetriever = vectorStore.asRetriever();

    // Invoke command, execute all tools, and get structured json response.
    const { structuredResponse } = await langchainService().fullyInvoke({
      messages: [
        ["system", forbiddenWordsPromptChunk()],
        ["system", tweetCharactersSizeLimitationPromptChunk()],
        ["system", await aiPromptsService().get(feature.bot, "airdrop-contest/elect-best-post-for-contest")]
      ],
      invocationParams: "",
      structuredOutput: z.object({
        selectedPostId: z.string().describe("The selected post ID")
      }),
      runnablesBefore: [{
        posts: vectorStoreRetriever
      }]
    });

    if (structuredResponse.selectedPostId)
      state.electedPost = docs.find(d => d.metadata.postId === structuredResponse.selectedPostId).metadata.post;

    return state;
  }
};
