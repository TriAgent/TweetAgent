import { forbiddenBotWords } from "./fobidden-keywords";

/**
 * Generates a prompt chunk that tells the LLM to not use specific words
 */
export const forbiddenWordsPromptChunk = () => {
  return `
    -------
    Also, don't use any of the following words in your reply:
    ${forbiddenBotWords.join(", ")}
    -------
  `;
}

export const tweetCharactersSizeLimitationPromptChunk = () => {
  return `Use less than 280 characters in your answer.`;
}

/**
 * Tells the bot what kind of writing style and personnality it should use while producing content.
 */
export const botPersonnalityPromptChunk = () => {

}