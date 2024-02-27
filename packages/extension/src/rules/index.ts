import * as JSON5 from "json5";
import { PedagogicalRulesSchema } from "shared/src/rules";
import { workspace, window } from "vscode";
import defaultRules from "./builtin/defaultRules";
import pythonRules from "./builtin/pythonRules";

const decoder = new TextDecoder();

export async function loadWorkspaceRules(): Promise<PedagogicalRulesSchema> {
  let result: PedagogicalRulesSchema = {
    ruleDefinitions: [...defaultRules, ...pythonRules],
    sessionRules: {
      _default: {
        threadRules: [],
        stackFrameRules: ["defaultStackFrameAcceptRule"],
        scopeRules: ["defaultScopeAcceptRule"],
        variableRules: ["defaultVariableMemoryReferenceIdRule", "defaultVariableSkipChildrenRule"],
      },
      python: {
        threadRules: [],
        stackFrameRules: ["defaultStackFrameAcceptRule"],
        scopeRules: ["pythonScopeAcceptRule"],
        variableRules: ["defaultVariableSkipChildrenRule", "pythonVariableAcceptRule"],
      },
      debugpy: {
        threadRules: [],
        stackFrameRules: ["defaultStackFrameAcceptRule"],
        scopeRules: ["pythonScopeAcceptRule"],
        variableRules: ["defaultVariableSkipChildrenRule", "pythonVariableAcceptRule"],
      },
    },
  };

  const fileUris = await workspace.findFiles(
    ".vscode/pedagogical-rules.{json,jsonc,json5}",
    undefined,
  );

  try {
    for (const fileUri of fileUris) {
      const contents = decoder.decode(await workspace.fs.readFile(fileUri));
      // Parsing with JSON5 because comments are allowed
      const workspaceRules = JSON5.parse(contents) satisfies PedagogicalRulesSchema;
      result = {
        ruleDefinitions: [...result.ruleDefinitions, ...workspaceRules.ruleDefinitions],
        sessionRules: { ...result.sessionRules, ...workspaceRules.sessionRules },
      };
    }
  } catch (err) {
    void window.showErrorMessage("Error reading rules file: " + String(err));
  }

  return result;
}
