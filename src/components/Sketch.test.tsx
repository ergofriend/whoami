// @vitest-environment jsdom

import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { SketchButton, SketchCard, SketchUnderline } from "./Sketch";

describe("Sketch", () => {
  it("includes its layout classes in server-rendered markup", () => {
    const markup = renderToStaticMarkup(
      <>
        <SketchCard>Card</SketchCard>
        <SketchUnderline>Heading</SketchUnderline>
        <SketchButton>Button</SketchButton>
      </>,
    );
    const container = document.createElement("div");
    container.innerHTML = markup;

    expect(container.querySelector(".information-card")).toHaveClass(
      "drawably-host",
      "drawably-card",
    );
    expect(container.querySelector("span")).toHaveClass("drawably-host", "drawably-underline");
    expect(container.querySelector("button")).toHaveClass(
      "drawably-host",
      "drawably-button",
      "drawably-button--outline",
    );
  });
});
