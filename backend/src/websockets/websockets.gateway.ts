import { OnModuleInit } from "@nestjs/common";
import { MessageBody, OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage, WebSocketGateway, WebSocketServer } from "@nestjs/websockets";
import { DispatcherUpdate, ReadyUpdate } from "@x-ai-wallet-bot/common";
import { Subject } from "rxjs";
import { Server } from "socket.io";
import { AppLogger } from "src/logs/app-logger";

/**
 * Server that provides API/Sockets used by the front end dashboard.
 */
@WebSocketGateway({ cors: true })
export class WebsocketsGateway implements OnGatewayConnection, OnGatewayDisconnect, OnModuleInit {
  private readonly logger = new AppLogger("WebSockets");

  public onClientConnected$ = new Subject();

  @WebSocketServer()
  server: Server;

  onModuleInit() {
    this.logger.log("Starting websocket service");
  }

  handleConnection(client: any) {
    this.logger.log(`Websocket client connected: ${client.id}`);
    this.sendReady(client);

    this.onClientConnected$.next(client);
  }

  handleDisconnect() {
    //console.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('events')
  handleEvent(@MessageBody('id') id: number): number {
    return id;
  }

  private sendReady(client: any) {
    const update: ReadyUpdate = { op: "ready" };
    this.emit(update, client);
  }

  public emit(update: DispatcherUpdate<any, any>, client: any = null) {
    if (client)
      client.emit("dispatcher", JSON.stringify(update));
    else
      this.server.emit("dispatcher", JSON.stringify(update));
  }
}
