export type WebviewMessage<T extends keyof WebviewMessageTypes> = {
  type: T;
  args: WebviewMessageTypes[T];
};

export type WebviewMessageTypes = {
  debugRequest: { command: string; args?: object };
};
