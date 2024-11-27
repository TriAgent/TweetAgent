import { DebouncedTextField } from "@components/base/DebouncedTextField/DebouncedTextField";
import { PageSubtitle } from "@components/base/PageSubtitle/PageSubtitle";
import { PageTitle } from "@components/base/PageTitle/PageTitle";
import { Stack } from "@mui/material";
import { useActiveBot } from "@services/bots/hooks/useActiveBot";
import { FC, useCallback, useMemo } from "react";
import { FeatureList } from "./components/FeatureList/FeatureList";
import { TwitterSettings } from "./components/TwitterSettings/TwitterSettings";

export const BotSettings: FC = () => {
  const editedBot = useActiveBot();
  const defaultName = useMemo(() => editedBot?.name, [editedBot?.name]);

  const handleNameChange = useCallback((value: string) => {
    editedBot.name = value;  // Update locally
    editedBot.updateProperty("name"); // update remotely
  }, [editedBot]);

  if (!editedBot)
    return null;

  return (
    <>
      <Stack direction="column" alignItems="flex-start" >
        <PageTitle>Bot settings</PageTitle>
        <Stack direction="column">
          <DebouncedTextField label="Name" defaultValue={defaultName} onChange={handleNameChange} />
        </Stack>
        <Stack direction="column" mt={2} width="100%">
          <PageSubtitle>Features</PageSubtitle>
          <FeatureList bot={editedBot} />
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
