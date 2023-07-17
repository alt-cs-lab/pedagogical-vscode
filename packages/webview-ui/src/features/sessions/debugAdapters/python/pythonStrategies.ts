import { defaultStrategies } from "../default/defaultStrategies";
import { DebugTypeStrategies } from "../strategies";

export const pythonStrategies: DebugTypeStrategies = {
  /** Everything else can be default */
  ...defaultStrategies,

  /** Ignore "special variables", "function variables" and "class variables" */
  filterVariables: (variables) => !variables.name.endsWith(" variables"),
};