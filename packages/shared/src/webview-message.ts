export type WebviewMessage<T extends keyof WebviewMessageTypes> = {
  type: T;
  data: T extends keyof WebviewMessageTypes ? WebviewMessageTypes[T] : undefined;
  seq?: number
};

export type WebviewMessageTypes = {
  debugRequest: { command: string; args?: any };
  ping: undefined
};
