export interface ResolvedPullConfig {
  projectName: string;
  outputPath: string;
}

export function resolvePullConfig(input: {
  projectArg?: string;
  outputArg?: string;
  env?: NodeJS.ProcessEnv;
}): ResolvedPullConfig {
  const projectName =
    input.projectArg ??
    input.env?.AGENTIC_FIX_LOOP_PROJECT_NAME ??
    input.env?.NEXT_PUBLIC_AGENTIC_FIX_LOOP_PROJECT_NAME;

  if (!projectName) {
    throw new Error(
      "Missing project name. Set AGENTIC_FIX_LOOP_PROJECT_NAME or pass --project."
    );
  }

  return {
    projectName,
    outputPath: input.outputArg ?? "reported-problems.md"
  };
}
