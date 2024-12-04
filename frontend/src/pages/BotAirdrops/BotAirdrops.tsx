import { PageTitle } from "@components/base/PageTitle/PageTitle";
import { Stack } from "@mui/material";
import { useActiveBot } from "@services/bots/hooks/useActiveBot";
import { ContestAirdrop } from "@x-ai-wallet-bot/common";
import { FC, useEffect, useState } from "react";
import { BotAirdrop } from "./components/BotAirdrop/BotAirdrop";

export const BotAirdrops: FC = () => {
  const activeBot = useActiveBot();
  const [airdrops, setAirdrops] = useState<ContestAirdrop[]>();

  useEffect(() => {
    if (activeBot) {
      activeBot.fetchAirdrops().then(_airdrops => {
        setAirdrops(_airdrops);
      })
    }
  }, [activeBot]);

  return (
    <>
      <Stack direction="column" alignItems="flex-start" >
        <PageTitle>Bot airdrops</PageTitle>
        <Stack direction="column" mt={2} width="100%">
          {
            airdrops?.map((airdrop, i) => <BotAirdrop key={i} airdrop={airdrop} />)
          }
        </Stack>
      </Stack>
    </>
  );
};

export default BotAirdrops;
