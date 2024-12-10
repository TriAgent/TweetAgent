import { useMemo } from "react";
import { Bot } from "../model/bot";
import { useBots } from "./useBots";

export const useBotById = (botId:string) : Bot => {
  const bots = useBots();

  return useMemo(() => bots?.find(bot => bot.id === botId), [bots, botId]);
}