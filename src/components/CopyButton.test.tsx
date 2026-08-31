// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { CopyButton } from "./CopyButton";

describe("CopyButton", () => {
  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it("copies the supplied value and announces success after interaction", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", { configurable: true, value: { writeText } });

    render(<CopyButton value="203.0.113.42" label="Copy IP" />);
    const button = screen.getByRole("button", { name: "Copy IP" });
    fireEvent.click(button);

    expect(await screen.findByRole("status")).toHaveTextContent("Copied!");
    expect(button).toHaveClass("drawably-button", "drawably-button--solid");
    expect(button).toHaveAttribute("data-state", "success");
    expect(writeText).toHaveBeenCalledWith("203.0.113.42");
  });

  it("announces a clipboard failure after interaction", async () => {
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: { writeText: vi.fn().mockRejectedValue(new Error("blocked")) },
    });

    render(<CopyButton value="203.0.113.42" label="Copy IP" />);
    fireEvent.click(screen.getByRole("button", { name: "Copy IP" }));

    expect(await screen.findByRole("status")).toHaveTextContent("Copy failed.");
  });

  it("stays visible and disabled when no value is available", () => {
    const writeText = vi.fn();
    Object.defineProperty(navigator, "clipboard", { configurable: true, value: { writeText } });

    render(<CopyButton value={null} label="Copy" accessibleLabel="Copy IPv6 address" />);

    const button = screen.getByRole("button", { name: "Copy IPv6 address" });
    expect(button).toBeDisabled();
    fireEvent.click(button);
    expect(writeText).not.toHaveBeenCalled();
  });
});
