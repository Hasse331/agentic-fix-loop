import type { ReportType } from "./types.ts";

export interface ReportDraft {
  reportType: ReportType;
  whatWereYouDoing: string;
  whatHappened: string;
  whatShouldHaveHappened: string;
}

export interface ReportDraftErrors {
  whatWereYouDoing?: string;
  whatHappened?: string;
  whatShouldHaveHappened?: string;
}

export function createEmptyDraft(): ReportDraft {
  return {
    reportType: "bug",
    whatWereYouDoing: "",
    whatHappened: "",
    whatShouldHaveHappened: ""
  };
}

export function validateReportDraft(draft: ReportDraft): ReportDraftErrors {
  const errors: ReportDraftErrors = {};

  if (!draft.whatWereYouDoing.trim()) {
    errors.whatWereYouDoing = "Tell us what you were doing.";
  }

  if (!draft.whatHappened.trim()) {
    errors.whatHappened = "Tell us what happened.";
  }

  if (!draft.whatShouldHaveHappened.trim()) {
    errors.whatShouldHaveHappened = "Tell us what should have happened.";
  }

  return errors;
}
