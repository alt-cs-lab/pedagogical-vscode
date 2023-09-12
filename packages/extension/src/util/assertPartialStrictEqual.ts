/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import * as assert from "assert";

/**
 * Similar to assert.deepStrictEqual, but ignores extra propteries in `actual` that do not appear in `expected`.
 * 
 * Useful if we only want to check certain properties in the webview state.
 */
export function assertPartialStrictEqual(actual: any, expected: any, message?: string | Error) {
  for (const expectedKey in expected) {
    const expectedVal: unknown = expected[expectedKey];
    const actualVal: unknown = actual[expectedKey];
    
    if (typeof expectedVal === "object" && expectedVal && typeof actualVal === "object" && actualVal) {
      // if both are objects (and not null), then checked nested partial equality
      assertPartialStrictEqual(actualVal, expectedVal, message);
    } else {
      assert.strictEqual(actualVal, expectedVal);
    }
  }
}