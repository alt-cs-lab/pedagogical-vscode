import * as assert from "assert";
import { assertPartialStrictEqual } from "../../util/assertPartialStrictEqual";

describe("utility functions", function () {
  it("partialStrictEqual should work", () => {
    const a = { one: 1, two: 2, three: 3 };
    const b = { one: 1, two: 2 };

    // should succeed because all properties in `b` are in `a`
    assertPartialStrictEqual(a, b);

    try {
      // should throw because `b` does not contain the `three` property in `a`
      assertPartialStrictEqual(b, a);
      assert.fail("assertPartialStrictEqual did not fail as expected!");
    } catch {
      // pass
    }
  });
});
