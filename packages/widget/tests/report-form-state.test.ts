import assert from "node:assert/strict";
import test from "node:test";

import { createEmptyDraft, validateReportDraft } from "../src/report-form-state.ts";

test("createEmptyDraft returns the default bug draft", () => {
  assert.deepEqual(createEmptyDraft(), {
    reportType: "bug",
    pageUrl: "",
    whatWereYouDoing: "",
    whatHappened: "",
    whatShouldHaveHappened: ""
  });
});

test("validateReportDraft returns errors for empty narrative fields", () => {
  const errors = validateReportDraft(createEmptyDraft());

  assert.deepEqual(errors, {
    pageUrl: "Tell us which page had the problem.",
    whatWereYouDoing: "Tell us what you were doing.",
    whatHappened: "Tell us what happened.",
    whatShouldHaveHappened: "Tell us what should have happened."
  });
});

test("validateReportDraft accepts a draft with page url and narrative fields", () => {
  const errors = validateReportDraft({
    reportType: "bug",
    pageUrl: "https://example.com/products/42",
    whatWereYouDoing: "Trying to save a product version.",
    whatHappened: "The save action did nothing.",
    whatShouldHaveHappened: "The product version should save."
  });

  assert.deepEqual(errors, {});
});
