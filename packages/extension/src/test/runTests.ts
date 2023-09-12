import * as cp from "child_process";
import * as path from "path";
import { downloadAndUnzipVSCode, resolveCliArgsFromVSCodeExecutablePath, runTests } from "@vscode/test-electron";

async function main() {
  try {
    const extensionDevelopmentPath = path.resolve(__dirname, "../");
    const extensionTestsPath = path.resolve(__dirname, "./suite/index");
    const vscodeExecutablePath = await downloadAndUnzipVSCode("insiders");
    const [cliPath, ...args] = resolveCliArgsFromVSCodeExecutablePath(vscodeExecutablePath);

    cp.spawnSync(
      cliPath,
      [...args, "--install-extension", "ms-python.python"],
      {
        encoding: "utf-8",
        stdio: "inherit",
      },
    );

    // Download VS Code, unzip it and run the integration test
    await runTests({
      vscodeExecutablePath,
      extensionDevelopmentPath,
      extensionTestsPath,
      launchArgs: ["../../sampleWorkspace"],
    });
  } catch (err) {
		console.error('Failed to run tests', err);
		process.exit(1);
	}
}

void main();
