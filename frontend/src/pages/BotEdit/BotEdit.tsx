import { DebouncedTextField } from "@components/base/DebouncedTextField/DebouncedTextField";
import { PageSubtitle } from "@components/base/PageSubtitle/PageSubtitle";
import { PageTitle } from "@components/base/PageTitle/PageTitle";
import { Stack } from "@mui/material";
import { useParamsBot } from "@services/bots/hooks/useParamsBot";
import { FC, useCallback } from "react";
import { FeatureList } from "./components/FeatureList/FeatureList";
import { PromptList } from "./components/PromptList/PromptList";

export const BotEdit: FC = () => {
  const editedBot = useParamsBot();

  const handleNameChange = useCallback((value: string) => {
    editedBot.name = value;  // Update locally
    editedBot.updateProperty("name"); // update remotely
  }, [editedBot]);

  if (!editedBot)
    return null;

  return (
    <>
      <Stack direction="column" alignItems="flex-start" >
        <PageTitle>Bot edition</PageTitle>
        <Stack direction="column">
          <DebouncedTextField label="Name" defaultValue={editedBot?.name} onChange={handleNameChange} />
        </Stack>
        <Stack direction="column" mt={2} width="100%">
          <PageSubtitle>Features</PageSubtitle>
          <FeatureList bot={editedBot} />
        </Stack>
        <Stack direction="column" mt={2} width="100%">
          <PageSubtitle>Prompts</PageSubtitle>
          <PromptList bot={editedBot} />
        </Stack>
      </Stack>
    </>
  );
};

export default BotEdit;
