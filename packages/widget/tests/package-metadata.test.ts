import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const packageJsonPath = fileURLToPath(
  new URL("../package.json", import.meta.url)
);

const packageJson = JSON.parse(readFileSync(packageJsonPath, "utf8")) as {
  exports?: Record<string, { default?: string; types?: string }>;
  files?: string[];
  publishConfig?: { access?: string };
  sideEffects?: boolean;
};

test("widget package metadata stays publishable", () => {
  assert.equal(packageJson.exports?.["."].default, "./dist/index.js");
  assert.equal(packageJson.exports?.["."].types, "./dist/index.d.ts");
  assert.deepEqual(packageJson.files, ["dist"]);
  assert.equal(packageJson.publishConfig?.access, "public");
  assert.equal(packageJson.sideEffects, false);
});
