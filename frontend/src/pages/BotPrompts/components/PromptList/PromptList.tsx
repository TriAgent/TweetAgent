import { DebouncedTextField } from "@components/base/DebouncedTextField/DebouncedTextField";
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { Accordion, AccordionDetails, AccordionSummary, Stack, Typography } from "@mui/material";
import { AiPrompt } from "@services/bots/model/ai-prompt";
import { Bot } from "@services/bots/model/bot";
import { useBehaviorSubject } from "@services/ui-ux/hooks/useBehaviorSubject";
import { FC, useCallback } from "react";

export const PromptList: FC<{
  bot: Bot;
}> = ({ bot }) => {
  const prompts = useBehaviorSubject(bot.prompts$);

  const handleValueChange = useCallback((prompt: AiPrompt, value: string) => {
    prompt.text = value;
    prompt.updateProperty("text");
  }, []);

  return <Stack direction="column" width="100%" pt={2} gap={3}>
    <Accordion>
      <AccordionSummary
        expandIcon={<ExpandMoreIcon />}
        aria-controls="panel1a-content"
        id="panel1a-header"
      >
        <Typography>Accordion 1</Typography>
      </AccordionSummary>
      <AccordionDetails>
        <Typography>
          Content for Accordion 1.
        </Typography>
      </AccordionDetails>
    </Accordion>
    {
      prompts?.map((prompt, i) => (
        <DebouncedTextField
          key={i}
          multiline
          label={prompt.key}
          defaultValue={prompt.text}
          onChange={value => handleValueChange(prompt, value)}
        />
      ))
    }
  </Stack>
}