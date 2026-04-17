import type { ProblemReportRecord } from "./types.ts";

export interface RenderReportedProblemsMarkdownInput {
  projectName: string;
  reports: ProblemReportRecord[];
}

function formatHeadingDate(isoDate: string): string {
  return isoDate.replace("T", " ").slice(0, 16);
}

function formatBrowser(report: ProblemReportRecord): string {
  const browser = [report.browser_name, report.browser_version]
    .filter(Boolean)
    .join(" ");
  const operatingSystem = report.operating_system ?? "Unknown OS";

  return browser ? `${browser} / ${operatingSystem}` : operatingSystem;
}

function formatViewport(report: ProblemReportRecord): string {
  if (
    report.viewport_width === null ||
    report.viewport_height === null
  ) {
    return "Unknown viewport";
  }

  return `${report.viewport_width}x${report.viewport_height}`;
}

export function renderReportedProblemsMarkdown(
  input: RenderReportedProblemsMarkdownInput
): string {
  const lines = [
    "# Reported Problems",
    "",
    `Project: ${input.projectName}`,
    ""
  ];

  if (input.reports.length === 0) {
    lines.push("No open reports found.", "");
    return lines.join("\n");
  }

  for (const report of input.reports) {
    lines.push(
      `## ${formatHeadingDate(report.created_at)} - ${report.report_type.toUpperCase()} - ${report.project_name}`,
      `- Report ID: \`${report.id}\``,
      `- URL: \`${report.page_url}\``,
      `- Browser: \`${formatBrowser(report)}\``,
      `- Viewport: \`${formatViewport(report)}\``,
      "",
      "### What were you doing?",
      report.what_were_you_doing,
      "",
      "### What happened?",
      report.what_happened,
      "",
      "### What should have happened?",
      report.what_should_have_happened,
      ""
    );
  }

  return lines.join("\n");
}
