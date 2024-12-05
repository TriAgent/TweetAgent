import { PostWriterModalProvider } from "@components/modals/PostWriterModal/PostWriterModal";
import { Stack, Typography } from "@mui/material";
import { ContestAirdrop } from "@services/airdrops/model/contest-airdrop";
import { useActiveBot } from "@services/bots/hooks/useActiveBot";
import { FC, useEffect, useState } from "react";
import { BotAirdrop } from "./components/BotAirdrop/BotAirdrop";

export const BotAirdrops: FC = () => {
  const activeBot = useActiveBot();
  const [airdrops, setAirdrops] = useState<ContestAirdrop[]>();

  useEffect(() => {
    if (activeBot) {
      activeBot.fetchAirdrops().then(_airdrops => {
        setAirdrops(_airdrops?.filter(a => a.postAirdrops.length > 0));
      })
    }
  }, [activeBot]);

  return (
    <PostWriterModalProvider>
      <Stack direction="column" alignItems="flex-start" >
        <Stack direction="column" mt={2} width="100%">
          {
            airdrops?.map((airdrop, i) => <BotAirdrop key={i} airdrop={airdrop} />)
          }
          {
            airdrops && airdrops.length === 0 &&
            <Typography>No airdrop sent yet.</Typography>
          }
        </Stack>
      </Stack>
    </PostWriterModalProvider>
  );
};

export default BotAirdrops;
