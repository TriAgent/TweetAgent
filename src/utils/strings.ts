
/**
 * Splits the given string to make sure it's no longer than maxLength characters, but
 * splits it at the previous word, don't truncate a word.
 * 
 * Returns the split part and the remaining part.
 */
export function splitStringAtWord(input: string, maxLength: number): string[] {
  if (input.length <= maxLength) {
    return [input];
  }

  const trimmedString = input.slice(0, maxLength + 1);
  const lastSpaceIndex = trimmedString.lastIndexOf(' ');

  if (lastSpaceIndex === -1) {
    // If there's no space, split at maxLength
    return [input.slice(0, maxLength), input.slice(maxLength)];
  }

  return [input.slice(0, lastSpaceIndex), input.slice(lastSpaceIndex + 1)];
}
