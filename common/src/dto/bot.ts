import { LinkerTwitterAccountInfo } from "./twitter";

export type Bot = LinkerTwitterAccountInfo & {
  id: string;
  createdAt: string; // ISO date
  name: string;
}