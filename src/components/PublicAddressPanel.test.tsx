// @vitest-environment jsdom

import { cleanup, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("./Sketch", async (importOriginal) => {
  const original = await importOriginal<typeof import("./Sketch")>();
  return { ...original, SketchArrow: () => null };
});

import { PublicAddressPanel } from "./PublicAddressPanel";

describe("PublicAddressPanel", () => {
  afterEach(cleanup);

  it("renders IPv4 and IPv6 as independently copyable addresses", () => {
    render(<PublicAddressPanel ipv4="203.0.113.42" ipv6="2001:db8::42" />);
    const panel = screen.getByRole("region", { name: "Public IP addresses" });
    expect(within(panel).getByText("203.0.113.42")).toHaveClass("public-address-value--primary");
    expect(within(panel).getByText("2001:db8::42")).toHaveClass("public-address-value--secondary");
    expect(within(panel).getByRole("button", { name: "Copy IPv4 address" })).toHaveClass(
      "drawably-button--solid",
    );
    expect(within(panel).getByRole("button", { name: "Copy IPv6 address" })).toHaveClass(
      "drawably-button--outline",
    );
    expect(within(panel).getByText("private by design")).toHaveClass("drawably-badge--outline");
    expect(within(panel).getByText("not stored")).toBeInTheDocument();
  });

  it("keeps unavailable address slots stable and disables their controls", () => {
    render(<PublicAddressPanel ipv4={null} ipv6={null} />);
    expect(screen.getAllByText("Not available")).toHaveLength(2);
    expect(screen.getByRole("button", { name: "Copy IPv4 address" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Copy IPv6 address" })).toBeDisabled();
  });
});
