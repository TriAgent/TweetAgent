import { Stack } from "@mui/material";
import { useActiveBot } from "@services/bots/hooks/useActiveBot";
import { FC } from "react";
import { FeatureList } from "./components/FeatureList/FeatureList";

export const BotFeatures: FC = () => {
  const activeBot = useActiveBot();

  if (!activeBot)
    return null;

  return (
    <Stack direction="column" alignItems="flex-start" >
      <FeatureList bot={activeBot} />
    </Stack>
  );
};

export default BotFeatures;
