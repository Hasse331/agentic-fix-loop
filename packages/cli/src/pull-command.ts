import { writeFile } from "node:fs/promises";

import { createSupabaseAdminClient } from "./create-supabase-admin-client.ts";
import { resolvePullConfig } from "./load-project-config.ts";
import { renderReportedProblemsMarkdown } from "./render-reported-problems-markdown.ts";
import type { ProblemReportRecord } from "./types.ts";

function readFlagValue(flagName: string, args: string[]): string | undefined {
  const index = args.indexOf(flagName);

  if (index === -1) {
    return undefined;
  }

  return args[index + 1];
}

export async function pullCommand(args: string[]): Promise<void> {
  const config = resolvePullConfig({
    projectArg: readFlagValue("--project", args),
    outputArg: readFlagValue("--output", args),
    env: process.env
  });

  const client = createSupabaseAdminClient();
  const { data, error } = await client
    .from("problem_reports")
    .select("*")
    .eq("project_name", config.projectName)
    .eq("status", "open")
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  const markdown = renderReportedProblemsMarkdown({
    projectName: config.projectName,
    reports: (data ?? []) as ProblemReportRecord[]
  });

  await writeFile(config.outputPath, markdown, "utf8");

  console.log(
    `Wrote ${config.outputPath} for project ${config.projectName}.`
  );
}
