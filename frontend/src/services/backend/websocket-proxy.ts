import { DispatcherUpdate } from '@x-ai-wallet-bot/common';
import { BehaviorSubject, Subject } from 'rxjs';
import io, { Socket } from 'socket.io-client';

// const SOCKET_SERVER_URL = process.env.REACT_APP_BACKEND_URL;

export class WebsocketProxy {
  private socket: Socket;

  public connected$ = new BehaviorSubject(false);
  public onNewMessage$ = new Subject<DispatcherUpdate<any, any>>();

  constructor(private address: string) {
    this.connect();
  }

  private connect() {
    this.socket = io(this.address);

    this.socket.on('connect', () => {
      console.log(`Web sockets connected to ${this.address}`);
      this.connected$.next(true);
    });

    this.socket.on('disconnect', () => {
      console.log(`Web sockets disconnected from ${this.address}`);
      this.connected$.next(false);
    });

    /**
     * For now we receive all messages in a single channel "dispatcher".
     */
    this.socket.on('dispatcher', (rawMessage: string) => {
      const message: DispatcherUpdate<any, any> = JSON.parse(rawMessage);

       //console.log("WS Message:", message);

      switch (message.op) {
        case "ready":
          // nothing 
          break;
        case "log":
        case "xpost":
        case "active-feature":
          // case "state":
          //   const stateUpdate = message as StateUpdate;
          // backendState$.next(stateUpdate.data);
          // break;
          this.onNewMessage$.next(message);
          break;
        default:
          console.warn("Unhandled dispatcher message", message);
      }
    });
  }
}

export let wsService: WebsocketProxy;

const connectWebsockets = () => {
  wsService = new WebsocketProxy(process.env.REACT_APP_BACKEND_URL);
}

connectWebsockets();