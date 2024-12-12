import { DebouncedTextField } from "@components/base/DebouncedTextField/DebouncedTextField";
import { PageSubtitle } from "@components/base/PageSubtitle/PageSubtitle";
import { PageTitle } from "@components/base/PageTitle/PageTitle";
import { Stack } from "@mui/material";
import { useActiveBot } from "@services/bots/hooks/useActiveBot";
import { useBehaviorSubject } from "@services/ui-ux/hooks/useBehaviorSubject";
import { FC, useCallback, useMemo } from "react";
import { TwitterSettings } from "./components/TwitterSettings/TwitterSettings";

export const BotSettings: FC = () => {
  const activeBot = useActiveBot();
  const botName = useBehaviorSubject(activeBot?.name$);
  const defaultName = useMemo(() => botName, [botName]);

  const handleNameChange = useCallback((value: string) => {
    activeBot.name$.next(value);  // Update locally
    activeBot.updateProperty("name"); // update remotely
  }, [activeBot]);

  if (!activeBot)
    return null;

  return (
    <>
      <Stack direction="column" alignItems="flex-start" >
        <PageTitle>{botName} / {activeBot.id}</PageTitle>
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
