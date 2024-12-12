import { Stack } from "@mui/material";
import { getBotById } from "@services/bots/bots.service";
import { activeFeatureAction$, friendlyFeatureKey } from "@services/features/features.service";
import { useBehaviorSubject } from "@services/ui-ux/hooks/useBehaviorSubject";
import { formatDateWithoutYear } from "@utils/dates";
import { ActiveFeature } from "@x-ai-wallet-bot/common";
import { FC, useEffect, useMemo, useState } from "react";
import { ActiveFeatureActionActive, ActiveFeatureActionBot, ActiveFeatureActionContainer, ActiveFeatureActionDate, ActiveFeatureActionFeature, ActiveFeatureActionTitle } from "./ActiveFeatureAction.styles";

export const ActiveFeatureAction: FC = () => {
  const activeFeatureAction = useBehaviorSubject(activeFeatureAction$);
  const [displayedAction, setDisplayedAction] = useState<ActiveFeature>(undefined);

  useEffect(() => {
    if (activeFeatureAction?.method) // undefined method means no on going action
      setDisplayedAction(activeFeatureAction);
  }, [activeFeatureAction]);

  const botName = useMemo(() => {
    if (displayedAction?.botId) {
      const bot = getBotById(displayedAction?.botId);
      return bot?.name$.value;
    }
    return undefined;
  }, [displayedAction]);

  const featureTitle = useMemo(() => {
    if (displayedAction?.key) {
      return friendlyFeatureKey(displayedAction?.key);
    }
    return undefined;
  }, [displayedAction]);

  return <ActiveFeatureActionContainer>
    <ActiveFeatureActionTitle>Most recent action</ActiveFeatureActionTitle>
    {
      displayedAction &&
      <Stack>
        <ActiveFeatureActionBot>{botName}</ActiveFeatureActionBot>
        <ActiveFeatureActionFeature>{featureTitle}</ActiveFeatureActionFeature>
        {/* <ActiveFeatureActionAction>{displayedAction.method}</ActiveFeatureActionAction> */}
        <ActiveFeatureActionActive>{activeFeatureAction?.method ? "On going" : "Complete"}</ActiveFeatureActionActive>
        <ActiveFeatureActionDate>{formatDateWithoutYear(new Date(displayedAction.date))}</ActiveFeatureActionDate>
      </Stack>
    }

  </ActiveFeatureActionContainer>
}