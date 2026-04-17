export type ReportType = "bug" | "ux";

export type ReportStatus = "open" | "exported" | "resolved" | "ignored";

export interface ProblemReportRecord {
  id: string;
  created_at: string;
  project_name: string;
  report_type: ReportType;
  status: ReportStatus;
  page_url: string;
  what_were_you_doing: string;
  what_happened: string;
  what_should_have_happened: string;
  browser_name: string | null;
  browser_version: string | null;
  operating_system: string | null;
  viewport_width: number | null;
  viewport_height: number | null;
  reported_at_client: string | null;
  metadata_json: Record<string, unknown>;
}

export interface PullOptions {
  projectName: string;
  outputPath: string;
}
