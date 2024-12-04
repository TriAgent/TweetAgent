import { apiGet } from "@services/api-base";
import { backendUrl } from "@services/backend/backend";
import { Chain as ChainDTO } from "@x-ai-wallet-bot/common";
import { plainToInstance } from "class-transformer";
import { BehaviorSubject } from "rxjs";
import { Chain } from "./model/chain";

export const chains$ = new BehaviorSubject<ChainDTO[]>(undefined);

const fetchChains = async () => {  
  const rawChains = await apiGet<ChainDTO[]>(`${backendUrl}/chains`);
  if (rawChains) {
    const chains = plainToInstance(Chain, rawChains, {excludeExtraneousValues: true});
    console.log("Got chains:", chains);
    chains$.next(chains);
    return chains;
  }
}

fetchChains();