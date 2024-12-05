import { DebouncedTextField } from "@components/base/DebouncedTextField/DebouncedTextField";
import { PageSubtitle } from "@components/base/PageSubtitle/PageSubtitle";
import { PageTitle } from "@components/base/PageTitle/PageTitle";
import { Stack } from "@mui/material";
import { useActiveBot } from "@services/bots/hooks/useActiveBot";
import { FC, useCallback, useMemo } from "react";
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
        <PageTitle>{activeBot.name} / {activeBot.id}</PageTitle>
        <Stack direction="column" gap={2} mt={2}>
          <PageSubtitle>Base settings</PageSubtitle>
          <DebouncedTextField label="Edit bot name" defaultValue={defaultName} onChange={handleNameChange} />
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
