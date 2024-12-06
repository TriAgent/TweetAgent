import { PageSubtitle } from '@components/base/PageSubtitle/PageSubtitle';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { Accordion, AccordionDetails, AccordionSummary, Button, Stack, Typography } from "@mui/material";
import { Bot } from "@services/bots/model/bot";
import { useFeatureProviders } from "@services/features/hooks/useFeatureProviders";
import { BotFeatureProvider } from "@services/features/model/bot-feature-provider";
import { useBehaviorSubject } from "@services/ui-ux/hooks/useBehaviorSubject";
import { BotFeatureGroupType } from '@x-ai-wallet-bot/common';
import { uniq } from 'lodash';
import { FC, useCallback, useMemo, useState } from "react";
import { FeatureConfigEditor } from '../FeatureConfigEditor/FeatureConfigEditor';

export const FeatureList: FC<{
  bot: Bot;
}> = ({ bot }) => {
  const providers = useFeatureProviders();

  const groupTypes = useMemo(() => {
    if (!providers)
      return [];

    return uniq(providers.map(p => p.groupType))
  }, [providers]);

  return <Stack direction="column" width="100%" pt={2}>
    {
      groupTypes?.map((groupType, i) => <FeatureGroup
        key={i}
        bot={bot}
        providers={providers.filter(p => p.groupType === groupType)}
        groupType={groupType} />)
    }
  </Stack>
}

export const FeatureGroup: FC<{
  bot: Bot;
  providers: BotFeatureProvider[]; // Providers from this group only
  groupType: BotFeatureGroupType;
}> = ({ bot, groupType, providers }) => {
  const [expandedAccordionId, setExpandedAccordionId] = useState<string>('');

  return <Stack direction="column" width="100%" pt={2}>
    <PageSubtitle>{groupType}</PageSubtitle>
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
  bot: Bot;
  provider: BotFeatureProvider;
  expandedAccordionId: string;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  onAccordionChange: (isExpanded: boolean) => void;
}> = ({ bot, provider, expandedAccordionId, onAccordionChange }) => {
  const features = useBehaviorSubject(bot.features$);
  const feature = useMemo(() => features?.find(feature => feature.type === provider.type), [features, provider]);
  const isExpanded = expandedAccordionId === feature.type;
  const config = useBehaviorSubject(feature?.config);
  const [resettingConfig, setResettingConfig] = useState(false);

  const handleConfigChange = useCallback((newConfig: any) => {
    feature.config.next(newConfig);
    feature.updateProperty("config");
  }, [feature]);

  const handleAccordionChange = useCallback((e: any, isExpanded: boolean) => {
    onAccordionChange(isExpanded);
  }, [onAccordionChange]);

  const handleResetFeatureConfig = useCallback(async () => {
    setResettingConfig(true);
    await feature.resetConfig();
    setResettingConfig(false);
  }, [feature]);

  if (!feature)
    return null;

  return <>
    <Accordion expanded={isExpanded} onChange={handleAccordionChange}>
      <AccordionSummary expandIcon={<ExpandMoreIcon />} /* style={{ background: isExpanded ? alpha("#000000", 0.3) : null }} */>
        <Stack direction="row" alignItems="center">
          <Typography style={{ opacity: config?.enabled ? 1 : 0.5 }}>{provider?.title}</Typography>
        </Stack>
      </AccordionSummary>
      <AccordionDetails>
        <Typography style={{ marginBottom: 20 }}>{provider.description}</Typography>
        {/* Make sure to hide the editor while resetting so it can refresh with clear values after reset */}
        {!resettingConfig && <FeatureConfigEditor provider={provider} feature={feature} onChange={handleConfigChange} />}
        <Stack direction="row" justifyContent="flex-end" mt={2}>
          <Button variant="contained" onClick={handleResetFeatureConfig}>Reset config</Button>
        </Stack>
      </AccordionDetails>
    </Accordion>
  </>
}