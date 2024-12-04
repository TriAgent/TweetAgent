import { PageSubtitle } from "@components/base/PageSubtitle/PageSubtitle";
import { Stack, Typography } from "@mui/material";
import { formatDateWithoutYear } from "@utils/dates";
import { formatAddress } from "@utils/formatAddress";
import { ContestAirdrop } from "@x-ai-wallet-bot/common";
import { FC } from "react";

export const BotAirdrop: FC<{
  airdrop: ContestAirdrop;
}> = ({ airdrop }) => {
  return <Stack>
    <Typography>{formatDateWithoutYear(airdrop.createdAt)} - {airdrop.totalTokenAmount} {formatAddress(airdrop.tokenAddress, [6, 4])} tokens on chain {airdrop.chain}</Typography>
    <Stack>
      <PageSubtitle>Transfers {airdrop.postAirdrops.length}</PageSubtitle>
    </Stack>
  </Stack>
}



/* totalTokenAmount Decimal // Total number of tokens distributed (human readable format)
  chain            String // eg: base_sepolia_testnet
  tokenAddress     String // eg: USDT contract address on base

  // Internal stats
  evaluatedPostsCount Int // Number of quote posts considered for this airdrop distribution

  postAirdrops PostContestAirdrop[] */