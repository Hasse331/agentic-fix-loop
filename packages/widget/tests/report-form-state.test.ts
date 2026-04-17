import assert from "node:assert/strict";
import test from "node:test";

import { createEmptyDraft, validateReportDraft } from "../src/report-form-state.ts";

test("createEmptyDraft returns the default bug draft", () => {
  assert.deepEqual(createEmptyDraft(), {
    reportType: "bug",
    whatWereYouDoing: "",
    whatHappened: "",
    whatShouldHaveHappened: ""
  });
});

test("validateReportDraft returns errors for empty narrative fields", () => {
  const errors = validateReportDraft(createEmptyDraft());

  assert.deepEqual(errors, {
    whatWereYouDoing: "Tell us what you were doing.",
    whatHappened: "Tell us what happened.",
    whatShouldHaveHappened: "Tell us what should have happened."
  });
});
