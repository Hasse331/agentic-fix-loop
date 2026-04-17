import assert from "node:assert/strict";
import test from "node:test";

import { submitProblemReport } from "../src/submit-problem-report.ts";

test("submitProblemReport maps widget fields into the Supabase insert payload", async () => {
  let payload: Record<string, unknown> | null = null;

  const fakeClient = {
    from(table: string) {
      assert.equal(table, "problem_reports");

      return {
        async insert(nextPayload: Record<string, unknown>) {
          payload = nextPayload;
          return { error: null };
        }
      };
    }
  };

  await submitProblemReport(
    {
      projectName: "MiniMRP",
      reportType: "bug",
      whatWereYouDoing: "Trying to save a product version.",
      whatHappened: "The save action did nothing.",
      whatShouldHaveHappened: "The product version should save."
    },
    {
      client: fakeClient,
      metadata: {
        pageUrl: "https://example.com/products/42",
        browserName: "Chrome",
        browserVersion: "135",
        operatingSystem: "Windows",
        viewportWidth: 1440,
        viewportHeight: 900,
        reportedAtClient: "2026-04-18T09:14:55.000Z"
      }
    }
  );

  assert.deepEqual(payload, {
    project_name: "MiniMRP",
    report_type: "bug",
    page_url: "https://example.com/products/42",
    what_were_you_doing: "Trying to save a product version.",
    what_happened: "The save action did nothing.",
    what_should_have_happened: "The product version should save.",
    browser_name: "Chrome",
    browser_version: "135",
    operating_system: "Windows",
    viewport_width: 1440,
    viewport_height: 900,
    reported_at_client: "2026-04-18T09:14:55.000Z",
    metadata_json: {}
  });
});

test("submitProblemReport throws when Supabase returns an error", async () => {
  const fakeClient = {
    from() {
      return {
        async insert() {
          return { error: new Error("insert failed") };
        }
      };
    }
  };

  await assert.rejects(
    () =>
      submitProblemReport(
        {
          projectName: "MiniMRP",
          reportType: "bug",
          whatWereYouDoing: "Trying to save.",
          whatHappened: "Nothing happened.",
          whatShouldHaveHappened: "It should save."
        },
        {
          client: fakeClient,
          metadata: {
            pageUrl: "https://example.com",
            browserName: null,
            browserVersion: null,
            operatingSystem: null,
            viewportWidth: null,
            viewportHeight: null,
            reportedAtClient: "2026-04-18T09:14:55.000Z"
          }
        }
      ),
    /insert failed/
  );
});
