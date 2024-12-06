import { Logger } from "@nestjs/common";
import { LogType } from "@prisma/client";
import { parse, stringify } from 'flatted';
import Queue from "promise-queue";
import { Bot } from "src/bots/model/bot";
import { prisma, wsDispatcherService } from "src/services";

const writeQueue = new Queue(1); // Make sure logs get written in DB in the right order

export class AppLogger extends Logger {
  constructor(context: string, private bot?: Bot) {
    super(`${bot ? `${bot.id.substring(0, 7)}... ` : ``}${context}`);
  }

  log(message: any): void {
    this.writeToDatabase(LogType.Log, message);
    super.log(message);
  }

  warn(message: any): void {
    this.writeToDatabase(LogType.Warning, message);
    super.warn(message);
  }

  error(message: any): void {
    this.writeToDatabase(LogType.Error, message);
    super.error(message);
  }

  private async writeToDatabase(type: LogType, message: string | unknown): Promise<void> {
    const messageIsObject = typeof message === 'object';

    let serializableObject: any;
    if (messageIsObject) {
      try {
        serializableObject = parse(stringify(message));
      }
      catch (e) {
        // Don't use logger, would be recursive.
        console.error("Log serialization error:", e);
        serializableObject = { failedToSerialize: true };
      }
    }

    await writeQueue.add(async () => {
      // Use flatted library to handle circular data and functions inside JS objects
      const log = await prisma().log.create({
        data: {
          name: this.context,
          ...(this.bot && { bot: { connect: { id: this.bot.id } } }),
          type,
          ...(messageIsObject && { json: serializableObject }),
          ...(!messageIsObject && { message: message as string })
        },
      }).catch((e) => {
        console.error("Failed to write log to database", e)
      });

      if (log)
        wsDispatcherService().emitLog(log);
    });
  }
}