"use client";

import {
  AgenticFixLoopProvider
} from "./AgenticFixLoopProvider.tsx";
import { ReportProblemButton } from "./ReportProblemButton.tsx";

export interface AgenticFixLoopProps {
  projectName: string;
  position?: "bottom-right" | "bottom-left";
  enabled?: boolean;
}

export function AgenticFixLoop({
  projectName,
  position = "bottom-right",
  enabled = true
}: AgenticFixLoopProps) {
  if (!enabled) {
    return null;
  }

  return (
    <AgenticFixLoopProvider projectName={projectName}>
      <ReportProblemButton position={position} />
    </AgenticFixLoopProvider>
  );
}
