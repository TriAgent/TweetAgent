import { PageSubtitle } from "@components/base/PageSubtitle/PageSubtitle";
import { Stack } from "@mui/material";
import { ContestAirdrop } from "@services/airdrops/model/contest-airdrop";
import { formatDateWithoutYear } from "@utils/dates";
import { FC } from "react";
import { AirdropTransfer } from "../AirdropTransfer/AirdropTransfer";

export const BotAirdrop: FC<{
  airdrop: ContestAirdrop;
}> = ({ airdrop }) => {
  return <Stack>
    <PageSubtitle>{formatDateWithoutYear(airdrop.createdAt)} - {airdrop.chain}</PageSubtitle>
    <Stack>
      Token: {airdrop.tokenAddress}
      <Stack gap={2} mt={2}>
        {
          airdrop.postAirdrops.map((pa, i) => <AirdropTransfer key={i} postContestAirdrop={pa} />)
        }
      </Stack>
    </Stack>
  </Stack>
}
