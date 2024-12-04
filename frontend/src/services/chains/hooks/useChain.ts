import { useBehaviorSubject } from "@services/ui-ux/hooks/useBehaviorSubject";
import { useEffect, useState } from "react";
import { chains$ } from "../chains.service";
import { Chain } from "../model/chain";

export const useChain = (id: string): Chain =>{
  const chains = useBehaviorSubject(chains$);
  const [chain, setChain] = useState<Chain>(undefined);

  useEffect(() => {
    setChain(chains?.find(c => c.id === id));
  }, [chains, id, setChain]);

  return chain;
}