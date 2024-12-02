import { Injectable } from "@nestjs/common";
import { Log } from "@prisma/client";
import { ActiveFeatureUpdate, DispatcherUpdate, LogType, LogUpdate, State, StateUpdate } from "@x-ai-wallet-bot/common";
import moment from "moment";
import { AnyBotFeature } from "src/bot-feature/model/bot-feature";
import { Bot } from "src/bots/model/bot";
import { WebsocketsGateway } from "./websockets.gateway";

/**
 * Service used to collect various data from the core service and send it
 * through websockets to the front end.
 */
@Injectable()
export class DispatcherService {
  // Cache of most recent commands of every op, to be able send everything again when a client reconnects.
  private cache = new Map<string, DispatcherUpdate<any, any>>;

  constructor(
    private wsGateway: WebsocketsGateway
  ) {
    wsGateway.onClientConnected$.subscribe(client => {
    })
  }

  public emitLog(log: Log) {
    const logDto = {
      ...log,
      type: log.type as LogType,
      createdAt: log.createdAt.toISOString()
    };
    this.emit<LogUpdate>(`log`, { op: "log", data: logDto });
  }

  public emitMostRecentFeatureAction(bot: Bot, feature: AnyBotFeature, method: string) {
    this.emit<ActiveFeatureUpdate>(`log`, {
      op: "active-feature", data: {
        botId: bot.id,
        key: feature.provider.type,
        method,
        date: moment().toISOString()
      }
    });
  }

  public emitState(state: State) {
    this.emit<StateUpdate>(`state`, { op: "state", data: state });
  }

  private emit<T extends DispatcherUpdate<any, any>>(cacheKey: string, command: T) {
    this.cache.set(cacheKey, command);
    this.wsGateway.emit(command);
  }

  /**
   * Re-send all most recent data to the given client
   */
  public sendAllRecent(client: any) {
    for (const command of this.cache.values()) {
      this.wsGateway.emit(command, client);
    }
  }
}