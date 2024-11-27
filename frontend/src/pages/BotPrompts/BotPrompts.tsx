import { PageSubtitle } from "@components/base/PageSubtitle/PageSubtitle";
import { PageTitle } from "@components/base/PageTitle/PageTitle";
import { Stack } from "@mui/material";
import { useActiveBot } from "@services/bots/hooks/useActiveBot";
import { FC } from "react";
import { PromptList } from "./components/PromptList/PromptList";

export const BotPrompts: FC = () => {
  const editedBot = useActiveBot();

  if (!editedBot)
    return null;

  return (
    <>
      <Stack direction="column" alignItems="flex-start" >
        <PageTitle>Bot prompts</PageTitle>
        <Stack direction="column" mt={2} width="100%">
          <PageSubtitle>Prompts</PageSubtitle>
          <PromptList bot={editedBot} />
        </Stack>
      </Stack>
    </>
  );
};

export default BotPrompts;
