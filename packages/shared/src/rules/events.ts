export interface RegExpParams {
  pattern: string;
  flags?: string | undefined;
}

export interface SetPedagogIdParams {
  fact: string;
  path?: string;
  params?: Record<string, any>;
  regexp?: RegExpParams;
}

export type PedagogRuleEvent =
  | { type: "accept" }
  | { type: "stopRules" }
  | { type: "setPedagogId"; params: SetPedagogIdParams }
  | { type: "setFetchChildren"; params: { value: boolean } };
