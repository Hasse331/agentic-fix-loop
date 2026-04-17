import assert from "node:assert/strict";
import test from "node:test";

import { resolvePullConfig } from "../src/load-project-config.ts";

test("resolvePullConfig uses default reported-problems.md output when none is provided", () => {
  const config = resolvePullConfig({
    env: {
      AGENTIC_FIX_LOOP_PROJECT_NAME: "MiniMRP"
    }
  });

  assert.deepEqual(config, {
    projectName: "MiniMRP",
    outputPath: "reported-problems.md"
  });
});

test("resolvePullConfig lets a command flag override the env project name", () => {
  const config = resolvePullConfig({
    projectArg: "agentic-fix-loop",
    env: {
      AGENTIC_FIX_LOOP_PROJECT_NAME: "MiniMRP"
    }
  });

  assert.equal(config.projectName, "agentic-fix-loop");
});

test("resolvePullConfig throws when no project name can be resolved", () => {
  assert.throws(
    () => resolvePullConfig({ env: {} }),
    /Missing project name/
  );
});
