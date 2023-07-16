export * from "./vscode";
export * from "./messageController";

/** Asserts that an action is true. Good for action matchers and type guards. */
export function assert(condition: any): asserts condition {
  if (!condition) {
    throw new Error("assertion failed!");
  }
}
