
export enum LogType {
  Debug = 'Debug',
  Log = 'Log',
  Warning = 'Warning',
  Error = 'Error'
}

export type Log = {
  id: string;
  createdAt: string;

  name: string; // Name of the log (eg: one log per service)
  type: LogType;
  message?: string; // String messages are stored here
  json?: any; // Object messages are stored here

  botId?: string;
}
