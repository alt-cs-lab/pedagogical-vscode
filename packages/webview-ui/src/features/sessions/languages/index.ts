import { LanguageHandler } from "./base";
import { pythonLanguageHandler } from "./python";

const languageHandlers: LanguageHandler[] = [
  pythonLanguageHandler,
];

export function getLanguageHandler(type: string): LanguageHandler | undefined {
  const handler = languageHandlers.find((handler) => handler.debugType === type);
  return handler;
}