import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { Accordion, AccordionDetails, AccordionSummary, Stack, Typography } from "@mui/material";
import { Bot } from "@services/bots/model/bot";
import { friendlyFeatureKey } from "@services/features/features.service";
import { useFeatureProviders } from "@services/features/hooks/useFeatureProviders";
import { BotFeatureProvider } from "@services/features/model/bot-feature-provider";
import { useBehaviorSubject } from "@services/ui-ux/hooks/useBehaviorSubject";
import { FC, useCallback, useMemo, useState } from "react";
import { FeatureConfigEditor } from '../FeatureConfigEditor/FeatureConfigEditor';

export const FeatureList: FC<{
  bot: Bot;
}> = ({ bot }) => {
  const providers = useFeatureProviders();
  const [expandedAccordionId, setExpandedAccordionId] = useState<string>('');

  return <Stack direction="column" width="100%" pt={2}>
    {
      providers?.map((provider, i) => <FeatureComponent
        key={i}
        bot={bot}
        provider={provider}
        expandedAccordionId={expandedAccordionId}
        onAccordionChange={(isExpanded) => setExpandedAccordionId(isExpanded ? provider.type : undefined)} />)
    }
  </Stack>
}

const FeatureComponent: FC<{
  //feature: BotFeature;
  bot: Bot;
  provider: BotFeatureProvider;
  expandedAccordionId: string;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  onAccordionChange: (isExpanded: boolean) => void;
}> = ({ bot, provider, expandedAccordionId, onAccordionChange }) => {
  const features = useBehaviorSubject(bot.features$);
  const feature = useMemo(() => features?.find(feature => feature.key === provider.type), [features, provider]);
  const name = useMemo(() => {
    return friendlyFeatureKey(feature?.key);
  }, [feature.key]);
  //const [enabled, setEnabled] = useState(feature.enabled);

  /* const handleValueChange = useCallback((checked: boolean) => {
    feature.enabled = checked;
    feature.updateProperty("enabled");
    setEnabled(checked);
  }, [feature]); */

  // For active bot changes
  // useEffect(() => {
  //   setEnabled(feature.enabled);
  // }, [feature.enabled]);

  const handleConfigChange = useCallback((newConfig: any) => {
    feature.config = newConfig;
    feature.updateProperty("config");
  }, [feature]);

  const handleAccordionChange = useCallback((e: any, isExpanded: boolean) => {
    onAccordionChange(isExpanded);
  }, [onAccordionChange]);

  if (!feature)
    return null;

  return <>
    <Accordion expanded={expandedAccordionId === feature.key} onChange={handleAccordionChange}>
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Typography style={{ textTransform: "capitalize", opacity: feature.config.enabled ? 1 : 0.5 }}>{name}</Typography>
      </AccordionSummary>
      <AccordionDetails>
        <Typography style={{ marginBottom: 20 }}>{provider.description}</Typography>
        <FeatureConfigEditor provider={provider} feature={feature} onChange={handleConfigChange} />
      </AccordionDetails>
    </Accordion>
  </>
}