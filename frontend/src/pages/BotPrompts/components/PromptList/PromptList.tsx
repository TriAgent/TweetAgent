import { DebouncedTextField } from "@components/base/DebouncedTextField/DebouncedTextField";
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { Accordion, AccordionDetails, AccordionSummary, Stack, Typography } from "@mui/material";
import { AiPrompt } from "@services/bots/model/ai-prompt";
import { Bot } from "@services/bots/model/bot";
import { useBehaviorSubject } from "@services/ui-ux/hooks/useBehaviorSubject";
import { FC, useCallback, useMemo, useState } from "react";

export const PromptList: FC<{
  bot: Bot;
}> = ({ bot }) => {
  const prompts = useBehaviorSubject(bot.prompts$);
  const [expandedAccordionId, setExpandedAccordionId] = useState<string>('');

  return <Stack direction="column" width="100%" pt={2} gap={1}>
    {
      prompts?.map((prompt, i) => <PromptComponent
        key={i}
        prompt={prompt}
        expandedAccordionId={expandedAccordionId}
        onAccordionChange={(isExpanded) => setExpandedAccordionId(isExpanded ? prompt.id : undefined)
        } />)
    }
  </Stack>
}

const PromptComponent: FC<{
  prompt: AiPrompt;
  expandedAccordionId: string;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  onAccordionChange: (isExpanded: boolean) => void;
}> = ({ prompt, expandedAccordionId, onAccordionChange }) => {
  const title = useMemo(() => {
    return prompt.key.replaceAll("-", " ").replaceAll("/", ": ")
  }, [prompt]);

  const handleValueChange = useCallback((prompt: AiPrompt, value: string) => {
    prompt.text = value;
    prompt.updateProperty("text");
  }, []);

  const handleAccordionChange = useCallback((e: any, isExpanded: boolean) => {
    onAccordionChange(isExpanded);
  }, [onAccordionChange]);

  return <Accordion expanded={expandedAccordionId === prompt.id} onChange={handleAccordionChange}>
    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
      <Typography style={{ textTransform: "capitalize" }}>{title}</Typography>
    </AccordionSummary>
    <AccordionDetails>
      <DebouncedTextField
        multiline
        label={prompt.key}
        defaultValue={prompt.text}
        style={{ width: "100%" }}
        onChange={value => handleValueChange(prompt, value)}
      />
    </AccordionDetails>
  </Accordion>
}