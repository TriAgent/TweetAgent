import { Logger } from "@nestjs/common";
import { Bot } from "./model/bot";

export class BotLogger extends Logger {
  constructor(context: string, bot: Bot) {
    super(`${bot.id.substring(0, 7)}... ${context}`);
  }
}