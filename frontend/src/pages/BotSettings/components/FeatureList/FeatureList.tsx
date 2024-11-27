import { Checkbox, FormControlLabel, Grid, Stack } from "@mui/material";
import { Bot } from "@services/bots/model/bot";
import { BotFeatureConfig } from "@services/bots/model/bot-feature-config";
import { useBehaviorSubject } from "@services/ui-ux/hooks/useBehaviorSubject";
import { FC, useCallback, useEffect, useMemo, useState } from "react";

export const FeatureList: FC<{
  bot: Bot;
}> = ({ bot }) => {
  const features = useBehaviorSubject(bot.features$);

  return <Stack direction="column" width="100%" pt={2}>
    <Grid container>
      {
        features?.map((feature, i) => <FeatureCheckbox key={i} feature={feature} />)
      }
    </Grid>
  </Stack>
}

const FeatureCheckbox: FC<{
  feature: BotFeatureConfig
}> = ({ feature }) => {
  const [enabled, setEnabled] = useState(feature.enabled);
  const name = useMemo(() => {
    return feature.key.replaceAll("_", ": ");
  }, [feature.key]);

  const handleValueChange = useCallback((checked: boolean) => {
    feature.enabled = checked;
    feature.updateProperty("enabled");
    setEnabled(checked);
  }, [feature]);

  // For active bot changes
  useEffect(() => {
    setEnabled(feature.enabled);
  }, [feature.enabled]);

  return <>
    <Grid item xs={6}>
      <FormControlLabel
        control={
          <Checkbox
            checked={enabled}
            onChange={e => handleValueChange(e.target.checked)} />
        }
        label={name} />
    </Grid>
  </>
}