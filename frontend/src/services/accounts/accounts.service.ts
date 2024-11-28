import { apiGet } from "@services/api-base";
import { backendUrl } from "@services/backend/backend";
import { XAccount as XAccountDTO } from "@x-ai-wallet-bot/common";
import { BehaviorSubject } from "rxjs";

export const fakeAccounts$ = new BehaviorSubject<XAccountDTO[]>(undefined);

const fetchFakeAccounts = async (): Promise<XAccountDTO[]> => {
  const fakeAccounts = await apiGet<XAccountDTO[]>(`${backendUrl}/xaccounts/fake`);

  console.log("Fetched fake accounts:", fakeAccounts);
  fakeAccounts$.next(fakeAccounts);

  return fakeAccounts;
}

fetchFakeAccounts();