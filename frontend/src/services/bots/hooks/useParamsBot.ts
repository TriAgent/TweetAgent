import { useMemo } from "react";
import { useParams } from "react-router-dom";
import { useBots } from "./useBots";

export const useParamsBot = () => {
  const {botId} = useParams();
  const bots = useBots();

  return useMemo(() => {
    return bots?.find(b => b.id === botId);
  },[botId, bots]);
}