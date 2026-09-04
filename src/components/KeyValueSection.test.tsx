// @vitest-environment jsdom

import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { KeyValueSection } from "./KeyValueSection";

describe("KeyValueSection", () => {
  it("renders a classed semantic section without a card wrapper", () => {
    const { container } = render(
      <KeyValueSection
        className="network-summary"
        title="Network"
        items={[{ label: "Organization", value: "A very long example organization" }]}
      />,
    );

    const section = screen.getByRole("region", { name: "Network" });
    expect(section).toHaveClass("key-value-section", "network-summary");
    expect(container.querySelector(".drawably-card")).not.toBeInTheDocument();
    expect(section.querySelector("dl > div > dt")).toHaveTextContent("Organization");
    expect(section.querySelector("dl > div > dd")).toHaveTextContent(
      "A very long example organization",
    );
  });

  it("uses a compact marker heading without an underline for technical groups", () => {
    render(
      <KeyValueSection
        headingVariant="technical"
        title="Connection"
        items={[{ label: "HTTP protocol", value: "HTTP/3" }]}
      />,
    );

    const heading = screen.getByRole("heading", { name: "Connection", level: 2 });
    const section = screen.getByRole("region", { name: "Connection" });
    expect(heading).toHaveClass("technical-section-heading");
    expect(heading.querySelector(".drawably-underline")).not.toBeInTheDocument();
    expect(section).toHaveClass("key-value-section--technical");
  });
});
