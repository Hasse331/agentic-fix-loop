"use client";

import type { ReactNode } from "react";

import { useAgenticFixLoop } from "./AgenticFixLoopProvider.tsx";
import {
  getTriggerStyle,
  type ReportProblemTriggerAppearance,
  type ReportProblemTriggerMode,
  type ReportProblemTriggerPosition
} from "./trigger-styles.ts";

export interface ReportProblemButtonProps {
  position?: ReportProblemTriggerPosition;
  mode?: ReportProblemTriggerMode;
  appearance?: ReportProblemTriggerAppearance;
  children?: ReactNode;
}

export function ReportProblemButton({
  position = "bottom-right",
  mode = "floating",
  appearance = "solid",
  children
}: ReportProblemButtonProps) {
  const { open } = useAgenticFixLoop();

  return (
    <button
      type="button"
      style={getTriggerStyle(mode, position, appearance)}
      onClick={open}
    >
      {children ?? "Report problem"}
    </button>
  );
}
