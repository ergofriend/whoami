"use client";

import { useState } from "react";

import { SketchButton } from "./Sketch";

type CopyButtonProps = {
  value: string | null;
  label: string;
  accessibleLabel?: string;
  variant?: "solid" | "outline";
};

export function CopyButton({ value, label, accessibleLabel, variant = "solid" }: CopyButtonProps) {
  const [status, setStatus] = useState<"" | "success" | "error">("");

  async function copy() {
    if (value === null) return;

    try {
      await navigator.clipboard.writeText(value);
      setStatus("success");
    } catch {
      setStatus("error");
    }
  }

  return (
    <div className="copy-control">
      <SketchButton
        className="copy-button"
        disabled={value === null}
        aria-label={accessibleLabel}
        onClick={() => void copy()}
        variant={variant}
      >
        {label}
      </SketchButton>
      <p
        className={`copy-status${status ? ` copy-status--${status}` : ""}`}
        role="status"
        aria-live="polite"
      >
        {status === "success" ? "Copied!" : status === "error" ? "Copy failed." : ""}
      </p>
    </div>
  );
}
