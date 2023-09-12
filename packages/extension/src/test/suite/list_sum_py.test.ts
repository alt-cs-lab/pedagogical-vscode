import * as vscode from "vscode";
import * as assert from "assert";
// import * as extension from "../../extension";

describe("debugging list_sum.py", () => {
  void vscode.window.showInformationMessage("Start all tests.");

  before("Debug list_sum.py", async function () {
    this.timeout(5000);
    const workspaceFolder = vscode.workspace.workspaceFolders![0];
    await vscode.debug.startDebugging(workspaceFolder, "list_sum.py");
  });

  it("should be debugging a python file", () => {
    assert(vscode.debug.activeDebugSession?.type === "python");
  });

  after("Stop debugging list_sum.py", async function () {
    await vscode.debug.stopDebugging();
  });
});
