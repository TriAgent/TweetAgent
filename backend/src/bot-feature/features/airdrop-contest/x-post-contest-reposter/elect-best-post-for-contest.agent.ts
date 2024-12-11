import { OpenAIEmbeddings } from "@langchain/openai";
import { Logger } from "@nestjs/common";
import { MemoryVectorStore } from "langchain/vectorstores/memory";
import { forbiddenWordsPromptChunk, tweetCharactersSizeLimitationPromptChunk } from "src/langchain/prompt-parts";
import { debugCommentService, langchainService } from "src/services";
import { z } from "zod";
import { PendingContestPostLoader } from "./pending-contest-post-loader";
import { contestReposterStateAnnotation, XPostContestReposterFeature } from "./x-post-contest-reposter.feature";

/**
 * Determines if the post is an airdrop address update or not
 */
export const electBestPostForContestAgent = (feature: XPostContestReposterFeature, logger: Logger) => {
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
        ["system", feature.config._prompts.electBestPostForContest]
      ],
      invocationParams: "",
      structuredOutput: z.object({
        selectedPostId: z.string().describe("The selected post ID"),
        reason: z.string().describe("The reason why you decided to select this post against the others")
      }),
      runnablesBefore: [{
        posts: vectorStoreRetriever
      }]
    });

    if (structuredResponse.selectedPostId)
      state.electedPost = docs.find(d => d.metadata.postId === structuredResponse.selectedPostId).metadata.post;

    if (structuredResponse?.reason)
      await debugCommentService().createPostComment(state.electedPost, structuredResponse?.reason, feature.dbFeature);

    return state;
  }
};
