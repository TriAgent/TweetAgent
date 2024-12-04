import { PageSubtitle } from "@components/base/PageSubtitle/PageSubtitle";
import { RouterLink } from "@components/base/RouterLink/RouterLink";
import { Stack } from "@mui/material";
import { ContestAirdrop } from "@services/airdrops/model/contest-airdrop";
import { useChain } from "@services/chains/hooks/useChain";
import { formatDateWithoutYear } from "@utils/dates";
import { FC } from "react";
import { AirdropTransfer } from "../AirdropTransfer/AirdropTransfer";

export const BotAirdrop: FC<{
  airdrop: ContestAirdrop;
}> = ({ airdrop }) => {
  const chain = useChain(airdrop.chain);
  const token = chain?.tokens.find(t => t.address === airdrop.tokenAddress);

  return <Stack>
    <PageSubtitle>{formatDateWithoutYear(airdrop.createdAt)} - {chain?.friendlyName} /
      <RouterLink to={chain?.explorerTokenUrl.replace("{tokenAddress}", token?.address)} target="_blank">
        &nbsp;{token?.symbol}
      </RouterLink>
    </PageSubtitle>
    <Stack>
      <Stack gap={2} mt={2}>
        {
          airdrop.postAirdrops.map((pa, i) => <AirdropTransfer key={i} airdrop={airdrop} postContestAirdrop={pa} />)
        }
      </Stack>
    </Stack>
  </Stack>
}
