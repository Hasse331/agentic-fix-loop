import assert from "node:assert/strict";
import test from "node:test";

import { getTriggerStyle } from "../src/trigger-styles.ts";

test("getTriggerStyle returns fixed positioning for floating mode", () => {
  const style = getTriggerStyle("floating", "bottom-right");

  assert.equal(style.position, "fixed");
  assert.equal(style.right, 24);
  assert.equal(style.bottom, 24);
});

test("getTriggerStyle returns inline layout for embedded mode", () => {
  const style = getTriggerStyle("embedded", "bottom-right");

  assert.equal(style.position, "static");
  assert.equal(style.display, "inline-flex");
  assert.equal("right" in style, false);
});
