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
    expect(within(panel).getByText("203.0.113.42")).not.toHaveClass(
      "public-address-value--unavailable",
    );
    expect(within(panel).getByRole("button", { name: "Copy IPv4 address" })).toHaveClass(
      "drawably-button--solid",
    );
    expect(within(panel).getByRole("button", { name: "Copy IPv6 address" })).toHaveClass(
      "drawably-button--outline",
    );
    expect(within(panel).queryByText("private by design")).not.toBeInTheDocument();
    expect(within(panel).queryByText("not stored")).not.toBeInTheDocument();
    expect(panel.querySelector(".drawably-arrow")).not.toBeInTheDocument();
  });

  it("omits an unavailable secondary address and disables the remaining control", () => {
    render(<PublicAddressPanel ipv4={null} ipv6={null} />);
    const unavailableValues = screen.getAllByText("Not available");
    expect(unavailableValues).toHaveLength(1);
    for (const value of unavailableValues) {
      expect(value).toHaveClass("public-address-value--unavailable");
    }
    expect(screen.getByRole("button", { name: "Copy IPv4 address" })).toBeDisabled();
    expect(screen.queryByRole("button", { name: "Copy IPv6 address" })).not.toBeInTheDocument();
    expect(screen.queryByText("Pseudo IPv4")).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Copy pseudo IPv4" })).not.toBeInTheDocument();
  });

  it("keeps Cloudflare pseudo IPv4 with the other copyable addresses", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", { configurable: true, value: { writeText } });

    render(<PublicAddressPanel ipv4={null} ipv6="2001:db8::42" pseudoIpv4="240.16.0.1" />);

    const panel = screen.getByRole("region", { name: "Public IP addresses" });
    expect(within(panel).getByText("Your public IPv6 address")).toBeInTheDocument();
    expect(within(panel).getByText("Cloudflare Pseudo IPv4")).toBeInTheDocument();
    expect(within(panel).getByText("2001:db8::42")).toHaveClass("public-address-value--primary");
    expect(within(panel).getByText("240.16.0.1")).toHaveClass("public-address-value--secondary");
    const copyButton = within(panel).getByRole("button", { name: "Copy pseudo IPv4" });
    fireEvent.click(copyButton);

    expect(await within(panel).findByText("Copied!")).toBeInTheDocument();
    expect(writeText).toHaveBeenCalledWith("240.16.0.1");
    expect(copyButton).toHaveTextContent("Copy");
    expect(copyButton).not.toHaveAttribute("data-state");
  });
});
