export type ReportProblemTriggerMode = "floating" | "embedded";
export type ReportProblemTriggerPosition = "bottom-right" | "bottom-left";
export type ReportProblemTriggerAppearance = "solid" | "text";

const floatingBaseStyle: Record<string, string | number> = {
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

const embeddedSolidStyle: Record<string, string | number> = {
  position: "static",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  border: "none",
  borderRadius: 999,
  padding: "10px 14px",
  background: "#111827",
  color: "#ffffff",
  cursor: "pointer",
  boxShadow: "none"
};

const embeddedTextStyle: Record<string, string | number> = {
  position: "static",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  border: "none",
  padding: 0,
  background: "transparent",
  color: "#4b5563",
  cursor: "pointer",
  textDecoration: "underline",
  textUnderlineOffset: "0.2em",
  boxShadow: "none"
};

export function getTriggerStyle(
  mode: ReportProblemTriggerMode,
  position: ReportProblemTriggerPosition,
  appearance: ReportProblemTriggerAppearance = "solid"
): Record<string, string | number> {
  if (mode === "embedded") {
    return appearance === "text" ? embeddedTextStyle : embeddedSolidStyle;
  }

  return {
    ...floatingBaseStyle,
    ...(position === "bottom-left" ? { left: 24 } : { right: 24 })
  };
}
