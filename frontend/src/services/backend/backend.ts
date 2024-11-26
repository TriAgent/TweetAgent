import { connectWebsockets } from "@services/websocket-proxy";

export const backendUrl = process.env.REACT_APP_BACKEND_URL;

if (!backendUrl)
  throw new Error(`REACT_APP_BACKEND_URL must be configured in .env file.`);

connectWebsockets();