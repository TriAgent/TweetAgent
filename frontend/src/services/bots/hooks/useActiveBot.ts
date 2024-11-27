import { useBehaviorSubject } from "@services/ui-ux/hooks/useBehaviorSubject";
import { activeBot$ } from "../bots.service";

export const useActiveBot = () => {
  return useBehaviorSubject(activeBot$);
}