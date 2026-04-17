import {
  collectClientMetadata,
  type ClientMetadata
} from "./collect-client-metadata.ts";
import { createSupabaseBrowserClient } from "./create-supabase-browser-client.ts";
import type { ReportType } from "./types.ts";

export interface SubmitProblemReportInput {
  projectName: string;
  reportType: ReportType;
  pageUrl: string;
  whatWereYouDoing: string;
  whatHappened: string;
  whatShouldHaveHappened: string;
}

interface SupabaseInsertResult {
  error: Error | { message: string } | null;
}

interface SupabaseInsertClient {
  from(table: string): {
    insert(payload: Record<string, unknown>): Promise<SupabaseInsertResult>;
  };
}

export interface SubmitProblemReportDependencies {
  client?: SupabaseInsertClient;
  metadata?: ClientMetadata;
  metadataJson?: Record<string, unknown>;
}

export async function submitProblemReport(
  input: SubmitProblemReportInput,
  dependencies: SubmitProblemReportDependencies = {}
): Promise<void> {
  const client = dependencies.client ?? createSupabaseBrowserClient();
  const metadata = dependencies.metadata ?? collectClientMetadata();

  const { error } = await client.from("problem_reports").insert({
    project_name: input.projectName,
    report_type: input.reportType,
    page_url: input.pageUrl,
    what_were_you_doing: input.whatWereYouDoing,
    what_happened: input.whatHappened,
    what_should_have_happened: input.whatShouldHaveHappened,
    browser_name: metadata.browserName,
    browser_version: metadata.browserVersion,
    operating_system: metadata.operatingSystem,
    viewport_width: metadata.viewportWidth,
    viewport_height: metadata.viewportHeight,
    reported_at_client: metadata.reportedAtClient,
    metadata_json: dependencies.metadataJson ?? {}
  });

  if (error) {
    throw new Error(error.message);
  }
}
