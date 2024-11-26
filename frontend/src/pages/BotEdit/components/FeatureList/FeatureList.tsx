import { Checkbox, FormControlLabel, Grid, Stack } from "@mui/material";
import { Bot } from "@services/bots/model/bot";
import { BotFeatureConfig } from "@services/bots/model/bot-feature-config";
import { useBehaviorSubject } from "@services/ui-ux/hooks/useBehaviorSubject";
import { FC, useCallback } from "react";

export const FeatureList: FC<{
  bot: Bot;
}> = ({ bot }) => {
  const features = useBehaviorSubject(bot.features$);

  const handleValueChange = useCallback((feature: BotFeatureConfig, value: string) => {
    feature.enabled = !feature.enabled;
    feature.updateProperty("enabled");
  }, []);

  return <Stack direction="column" width="100%" pt={2}>
    <Grid container>
      {
        features?.map((feature, i) => (
          <Grid xs={4}>
            <FormControlLabel control={<Checkbox defaultChecked />} label={feature.key} />
          </Grid>
          /* 
                  <DebouncedTextField
                    key={i}
                    multiline
                    label={feature.key}
                    defaultValue='feature coucou'
                    onChange={value => handleValueChange(feature, value)}
                  /> */
        ))
      }
    </Grid>
  </Stack>
}