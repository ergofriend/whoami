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
});
