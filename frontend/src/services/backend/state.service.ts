import { State } from "@x-ai-wallet-bot/common";
import { BehaviorSubject } from "rxjs";

export const backendState$ = new BehaviorSubject<State>(undefined);
