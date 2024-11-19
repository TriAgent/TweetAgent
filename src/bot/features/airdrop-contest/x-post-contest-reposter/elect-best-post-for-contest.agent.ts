import { StructuredTool } from "@langchain/core/tools";
import { OpenAIEmbeddings } from "@langchain/openai";
import { Logger } from "@nestjs/common";
import { MemoryVectorStore } from "langchain/vectorstores/memory";
import { forbiddenWordsPromptChunk, tweetCharactersSizeLimitationPromptChunk } from "src/langchain/prompt-parts";
import { langchain } from "src/services";
import { z } from "zod";
import { PendingContestPostLoader } from "./pending-contest-post-loader";
import { contestReposterStateAnnotation } from "./x-post-contest-reposter.service";

/**
 * Determines if the post is an airdrop address update or not
 */
export const electBestPostForContestAgent = (logger: Logger) => {
  return async (state: typeof contestReposterStateAnnotation.State) => {
    const tools: StructuredTool[] = [];

    const loader = new PendingContestPostLoader();
    const docs = await loader.load();

    if (docs?.length < 1) {
      logger.log("Not enough eligible contest X posts available to create a contest post RT");
      return state;
    }

    const structuredOutput = z.object({
      selectedPostId: z.string().describe("The selected post ID")
    });

    const REQUEST_TEMPLATE = `
      Below is a list of several posts from twitter. Select the one that has the best chances to become 
      popular on twitter, meaning with high number of like/rt/comments.
      ---------------- 
      {posts}
    `;

    const vectorStore = await MemoryVectorStore.fromDocuments(
      docs,
      new OpenAIEmbeddings({ openAIApiKey: langchain().openAIAPIKey, verbose: true, stripNewLines: false })
    );
    const vectorStoreRetriever = vectorStore.asRetriever();

    // Invoke command, execute all tools, and get structured json response.
    const { structuredResponse } = await langchain().fullyInvoke(
      [
        ["system", forbiddenWordsPromptChunk()],
        ["system", tweetCharactersSizeLimitationPromptChunk()],
        ["system", REQUEST_TEMPLATE]
      ],
      "",
      tools,
      structuredOutput,
      // To run before piping the prompt
      [
        {
          posts: vectorStoreRetriever//.pipe(formatDocumentsAsString),
        }
      ]
    );

    if (structuredResponse.selectedPostId)
      state.electedPost = docs.find(d => d.metadata.postId === structuredResponse.selectedPostId).metadata.post;

    return state;
  }
};
