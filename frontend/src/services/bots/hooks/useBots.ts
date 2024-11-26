import { useBehaviorSubject } from "@services/ui-ux/hooks/useBehaviorSubject";
import { bots$ } from "../bots.service";

export const useBots = () => {
  return useBehaviorSubject(bots$);
}