"use client";

import { useState } from "react";

import { SketchButton } from "./Sketch";

type CopyButtonProps = {
  value: string;
  label: string;
};

export function CopyButton({ value, label }: CopyButtonProps) {
  const [status, setStatus] = useState<"" | "success" | "error">("");

  async function copy() {
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
        data-state={status || undefined}
        onClick={() => void copy()}
        variant="solid"
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
