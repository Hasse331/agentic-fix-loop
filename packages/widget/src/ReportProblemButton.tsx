"use client";

import { useEffect, useState } from "react";

import {
  createEmptyDraft,
  validateReportDraft,
  type ReportDraft,
  type ReportDraftErrors
} from "./report-form-state.ts";
import { submitProblemReport } from "./submit-problem-report.ts";
import { useAgenticFixLoop } from "./AgenticFixLoopProvider.tsx";
import { collectClientMetadata } from "./collect-client-metadata.ts";

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
  color: "#111827",
  borderRadius: 20,
  padding: 24,
  boxShadow: "0 24px 60px rgba(15, 23, 42, 0.25)",
  fontFamily: "ui-sans-serif, system-ui, sans-serif",
  lineHeight: 1.5
};

const inputStyle: Record<string, string | number> = {
  display: "block",
  width: "100%",
  marginTop: 8,
  marginBottom: 4,
  borderRadius: 12,
  border: "1px solid #d1d5db",
  padding: "10px 12px",
  font: "inherit",
  background: "#ffffff",
  color: "#111827",
  boxSizing: "border-box"
};

const labelStyle: Record<string, string | number> = {
  display: "block",
  marginTop: 14,
  color: "#374151",
  fontSize: 14,
  fontWeight: 600
};

const secondaryButtonStyle: Record<string, string | number> = {
  border: "1px solid #d1d5db",
  borderRadius: 12,
  background: "#ffffff",
  color: "#111827",
  padding: "10px 14px",
  cursor: "pointer"
};

const primaryButtonStyle: Record<string, string | number> = {
  border: "none",
  borderRadius: 12,
  background: "#111827",
  color: "#ffffff",
  padding: "10px 14px",
  cursor: "pointer"
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

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const metadata = collectClientMetadata();

    setDraft((currentDraft) => ({
      ...currentDraft,
      pageUrl: metadata.pageUrl
    }));
  }, [isOpen]);

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
        pageUrl: draft.pageUrl,
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
                <h2 style={{ margin: 0, color: "#111827", fontSize: 28 }}>
                  Report a problem
                </h2>
                <p style={{ color: "#4b5563", marginTop: 4, marginBottom: 0 }}>
                  Anonymous report for {projectName}
                </p>
              </div>
              <button
                type="button"
                onClick={closeModal}
                style={secondaryButtonStyle}
              >
                Close
              </button>
            </div>

            {isSubmitted ? (
              <div style={{ marginTop: 16 }}>
                <p>Thanks. Your report was sent.</p>
              </div>
            ) : (
              <div style={{ marginTop: 16 }}>
                <label style={labelStyle}>
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

                <label style={labelStyle}>
                  URL
                  <input
                    type="url"
                    style={inputStyle}
                    value={draft.pageUrl}
                    onChange={(event) =>
                      setDraft(
                        updateDraft(draft, "pageUrl", event.target.value)
                      )
                    }
                  />
                </label>
                {errors.pageUrl ? (
                  <p style={{ color: "#b91c1c", margin: "4px 0 0" }}>
                    {errors.pageUrl}
                  </p>
                ) : null}

                <label style={labelStyle}>
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
                  <p style={{ color: "#b91c1c", margin: "4px 0 0" }}>
                    {errors.whatWereYouDoing}
                  </p>
                ) : null}

                <label style={labelStyle}>
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
                  <p style={{ color: "#b91c1c", margin: "4px 0 0" }}>
                    {errors.whatHappened}
                  </p>
                ) : null}

                <label style={labelStyle}>
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
                  <p style={{ color: "#b91c1c", margin: "4px 0 0" }}>
                    {errors.whatShouldHaveHappened}
                  </p>
                ) : null}

                {submitError ? (
                  <p style={{ color: "#b91c1c", marginTop: 12 }}>
                    {submitError}
                  </p>
                ) : null}

                <div style={{ display: "flex", gap: 12, marginTop: 16 }}>
                  <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    style={primaryButtonStyle}
                  >
                    {isSubmitting ? "Sending..." : "Send report"}
                  </button>
                  <button
                    type="button"
                    onClick={closeModal}
                    style={secondaryButtonStyle}
                  >
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
