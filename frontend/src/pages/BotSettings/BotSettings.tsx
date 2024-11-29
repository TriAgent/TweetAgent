import { DebouncedTextField } from "@components/base/DebouncedTextField/DebouncedTextField";
import { PageSubtitle } from "@components/base/PageSubtitle/PageSubtitle";
import { PageTitle } from "@components/base/PageTitle/PageTitle";
import { Stack } from "@mui/material";
import { useActiveBot } from "@services/bots/hooks/useActiveBot";
import { FC, useCallback, useMemo } from "react";
import { FeatureList } from "./components/FeatureList/FeatureList";
import { TwitterSettings } from "./components/TwitterSettings/TwitterSettings";

export const BotSettings: FC = () => {
  const activeBot = useActiveBot();
  const defaultName = useMemo(() => activeBot?.name, [activeBot?.name]);

  const handleNameChange = useCallback((value: string) => {
    activeBot.name = value;  // Update locally
    activeBot.updateProperty("name"); // update remotely
  }, [activeBot]);

  if (!activeBot)
    return null;

  return (
    <>
      <Stack direction="column" alignItems="flex-start" >
        <PageTitle>Bot settings</PageTitle>
        <Stack direction="column" gap={2}>
          <div>{activeBot.id}</div>
          <DebouncedTextField label="Name" defaultValue={defaultName} onChange={handleNameChange} />
        </Stack>
        <Stack direction="column" mt={2} width="100%">
          <PageSubtitle>Features</PageSubtitle>
          <FeatureList bot={activeBot} />
        </Stack>
        <Stack direction="column" mt={2} width="100%">
          <PageSubtitle>Twitter / X</PageSubtitle>
          <TwitterSettings />
        </Stack>
      </Stack>
    </>
  );
};

export default BotSettings;
