// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

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
    const privacyBadge = within(panel).getByText("private by design");
    expect(privacyBadge).toHaveClass("drawably-badge--outline");
    expect(privacyBadge.querySelector(".privacy-sparkle")).toBeInTheDocument();
    expect(privacyBadge.parentElement).toHaveClass("address-card-meta");
    expect(within(panel).queryByText("not stored")).not.toBeInTheDocument();
    expect(panel.querySelector(".drawably-arrow")).not.toBeInTheDocument();
  });

  it("keeps unavailable address slots stable and disables their controls", () => {
    render(<PublicAddressPanel ipv4={null} ipv6={null} />);
    expect(screen.getAllByText("Not available")).toHaveLength(2);
    expect(screen.getByRole("button", { name: "Copy IPv4 address" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Copy IPv6 address" })).toBeDisabled();
    expect(screen.queryByText("Pseudo IPv4")).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Copy pseudo IPv4" })).not.toBeInTheDocument();
  });

  it("keeps Cloudflare pseudo IPv4 with the other copyable addresses", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", { configurable: true, value: { writeText } });

    render(<PublicAddressPanel ipv4={null} ipv6="2001:db8::42" pseudoIpv4="240.16.0.1" />);

    const panel = screen.getByRole("region", { name: "Public IP addresses" });
    expect(within(panel).getByText("Pseudo IPv4")).toBeInTheDocument();
    expect(within(panel).getByText("240.16.0.1")).toBeInTheDocument();
    const copyButton = within(panel).getByRole("button", { name: "Copy pseudo IPv4" });
    fireEvent.click(copyButton);

    expect(await within(panel).findByText("Copied!")).toBeInTheDocument();
    expect(writeText).toHaveBeenCalledWith("240.16.0.1");
    expect(copyButton).toHaveTextContent("Copy");
    expect(copyButton).not.toHaveAttribute("data-state");
  });
});
