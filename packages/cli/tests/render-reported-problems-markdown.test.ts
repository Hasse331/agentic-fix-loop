import assert from "node:assert/strict";
import test from "node:test";

import { renderReportedProblemsMarkdown } from "../src/render-reported-problems-markdown.ts";

test("renderReportedProblemsMarkdown includes report sections and metadata", () => {
  const markdown = renderReportedProblemsMarkdown({
    projectName: "MiniMRP",
    reports: [
      {
        id: "report-1",
        created_at: "2026-04-18T09:15:00.000Z",
        project_name: "MiniMRP",
        report_type: "bug",
        status: "open",
        page_url: "https://example.com/products/42",
        what_were_you_doing: "Trying to save a product version.",
        what_happened: "The save action did nothing.",
        what_should_have_happened: "The product version should save and show success feedback.",
        browser_name: "Chrome",
        browser_version: "135",
        operating_system: "Windows",
        viewport_width: 1440,
        viewport_height: 900,
        reported_at_client: "2026-04-18T09:14:55.000Z",
        metadata_json: {}
      }
    ]
  });

  assert.match(markdown, /# Reported Problems/);
  assert.match(markdown, /BUG - MiniMRP/);
  assert.match(markdown, /Report ID: `report-1`/);
  assert.match(markdown, /Trying to save a product version\./);
});

test("renderReportedProblemsMarkdown includes an empty-state message when no reports exist", () => {
  const markdown = renderReportedProblemsMarkdown({
    projectName: "MiniMRP",
    reports: []
  });

  assert.match(markdown, /Project: MiniMRP/);
  assert.match(markdown, /No open reports found\./);
});
