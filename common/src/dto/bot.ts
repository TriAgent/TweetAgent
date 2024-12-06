import { LinkedTwitterAccountInfo } from "./twitter";

export type Bot = LinkedTwitterAccountInfo & {
  id: string;
  createdAt: string; // ISO date
  name: string;
}