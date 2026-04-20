import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const packageJsonPath = fileURLToPath(
  new URL("../package.json", import.meta.url)
);

const packageJson = JSON.parse(readFileSync(packageJsonPath, "utf8")) as {
  bin?: Record<string, string>;
  files?: string[];
  description?: string;
};

test("cli package metadata stays publishable", () => {
  assert.equal(packageJson.bin?.fixloop, "./dist/index.js");
  assert.deepEqual(packageJson.files, ["dist"]);
  assert.match(packageJson.description ?? "", /CLI/i);
});
