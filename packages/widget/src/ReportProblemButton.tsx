"use client";

import { useState } from "react";

import {
  createEmptyDraft,
  validateReportDraft,
  type ReportDraft,
  type ReportDraftErrors
} from "./report-form-state.ts";
import { submitProblemReport } from "./submit-problem-report.ts";
import { useAgenticFixLoop } from "./AgenticFixLoopProvider.tsx";

export interface ReportProblemButtonProps {
  position?: "bottom-right" | "bottom-left";
}

const buttonBaseStyle: Record<string, string | number> = {
  position: "fixed",
  bottom: 24,
  zIndex: 9999,
  border: "none",
  borderRadius: 999,
  padding: "12px 16px",
  background: "#111827",
  color: "#ffffff",
  cursor: "pointer",
  boxShadow: "0 12px 30px rgba(15, 23, 42, 0.25)"
};

const overlayStyle: Record<string, string | number> = {
  position: "fixed",
  inset: 0,
  zIndex: 10000,
  background: "rgba(15, 23, 42, 0.45)",
  display: "grid",
  placeItems: "center",
  padding: 16
};

const modalStyle: Record<string, string | number> = {
  width: "min(560px, 100%)",
  background: "#ffffff",
  borderRadius: 20,
  padding: 24,
  boxShadow: "0 24px 60px rgba(15, 23, 42, 0.25)"
};

const inputStyle: Record<string, string | number> = {
  width: "100%",
  marginTop: 8,
  marginBottom: 4,
  borderRadius: 12,
  border: "1px solid #d1d5db",
  padding: "10px 12px",
  font: "inherit"
};

function nextPositionStyle(position: "bottom-right" | "bottom-left") {
  return position === "bottom-left" ? { left: 24 } : { right: 24 };
}

function updateDraft(
  currentDraft: ReportDraft,
  key: keyof ReportDraft,
  value: string
): ReportDraft {
  return {
    ...currentDraft,
    [key]: value
  };
}

export function ReportProblemButton({
  position = "bottom-right"
}: ReportProblemButtonProps) {
  const { projectName } = useAgenticFixLoop();
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [draft, setDraft] = useState(createEmptyDraft);
  const [errors, setErrors] = useState<ReportDraftErrors>({});

  async function handleSubmit() {
    const nextErrors = validateReportDraft(draft);
    setErrors(nextErrors);
    setSubmitError(null);

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    setIsSubmitting(true);

    try {
      await submitProblemReport({
        projectName,
        reportType: draft.reportType,
        whatWereYouDoing: draft.whatWereYouDoing,
        whatHappened: draft.whatHappened,
        whatShouldHaveHappened: draft.whatShouldHaveHappened
      });

      setIsSubmitted(true);
      setDraft(createEmptyDraft());
      setErrors({});
    } catch (error) {
      setSubmitError(
        error instanceof Error ? error.message : "Failed to send report."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  function closeModal() {
    setIsOpen(false);
    setSubmitError(null);
  }

  return (
    <>
      <button
        type="button"
        style={{ ...buttonBaseStyle, ...nextPositionStyle(position) }}
        onClick={() => {
          setIsOpen(true);
          setIsSubmitted(false);
        }}
      >
        Report problem
      </button>

      {isOpen ? (
        <div style={overlayStyle} role="dialog" aria-modal="true">
          <div style={modalStyle}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <div>
                <h2 style={{ margin: 0 }}>Report a problem</h2>
                <p style={{ color: "#4b5563" }}>
                  Anonymous report for {projectName}
                </p>
              </div>
              <button type="button" onClick={closeModal}>
                Close
              </button>
            </div>

            {isSubmitted ? (
              <div style={{ marginTop: 16 }}>
                <p>Thanks. Your report was sent.</p>
              </div>
            ) : (
              <div style={{ marginTop: 16 }}>
                <label>
                  Type
                  <select
                    style={inputStyle}
                    value={draft.reportType}
                    onChange={(event) =>
                      setDraft(
                        updateDraft(draft, "reportType", event.target.value)
                      )
                    }
                  >
                    <option value="bug">BUG</option>
                    <option value="ux">UX</option>
                  </select>
                </label>

                <label>
                  What were you doing?
                  <textarea
                    rows={4}
                    style={inputStyle}
                    value={draft.whatWereYouDoing}
                    onChange={(event) =>
                      setDraft(
                        updateDraft(
                          draft,
                          "whatWereYouDoing",
                          event.target.value
                        )
                      )
                    }
                  />
                </label>
                {errors.whatWereYouDoing ? (
                  <p style={{ color: "#b91c1c" }}>{errors.whatWereYouDoing}</p>
                ) : null}

                <label>
                  What happened?
                  <textarea
                    rows={4}
                    style={inputStyle}
                    value={draft.whatHappened}
                    onChange={(event) =>
                      setDraft(
                        updateDraft(draft, "whatHappened", event.target.value)
                      )
                    }
                  />
                </label>
                {errors.whatHappened ? (
                  <p style={{ color: "#b91c1c" }}>{errors.whatHappened}</p>
                ) : null}

                <label>
                  What should have happened?
                  <textarea
                    rows={4}
                    style={inputStyle}
                    value={draft.whatShouldHaveHappened}
                    onChange={(event) =>
                      setDraft(
                        updateDraft(
                          draft,
                          "whatShouldHaveHappened",
                          event.target.value
                        )
                      )
                    }
                  />
                </label>
                {errors.whatShouldHaveHappened ? (
                  <p style={{ color: "#b91c1c" }}>
                    {errors.whatShouldHaveHappened}
                  </p>
                ) : null}

                {submitError ? (
                  <p style={{ color: "#b91c1c" }}>{submitError}</p>
                ) : null}

                <div style={{ display: "flex", gap: 12, marginTop: 16 }}>
                  <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Sending..." : "Send report"}
                  </button>
                  <button type="button" onClick={closeModal}>
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : null}
    </>
  );
}
