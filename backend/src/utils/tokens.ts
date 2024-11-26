import BigNumber from "bignumber.js";

/**
 * Converts a token readable value (eth) to contract value (wei)
 */
export const tokenToContractValue = (humanReadableValue: BigNumber | string | number, decimals: number): BigNumber => {
  if (humanReadableValue === undefined)
    return undefined;
  return new BigNumber(humanReadableValue).multipliedBy((new BigNumber(10)).pow(decimals));
}

/**
 * Converts a token contract value (wei) to readable value (eth)
 */
export const tokenToReadableValue = (contractValue: BigNumber | string | number, decimals: number): BigNumber => {
  if (contractValue === undefined)
    return undefined;
  return new BigNumber(contractValue).dividedBy((new BigNumber(10)).pow(decimals));
}