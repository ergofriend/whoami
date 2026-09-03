// @vitest-environment jsdom

import { createRef } from "react";
import { cleanup, render } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

const drawably = vi.hoisted(() => {
  const sketches: Array<{ destroy: ReturnType<typeof vi.fn> }> = [];
  const attach = vi.fn(() => {
    const sketch = { destroy: vi.fn() };
    sketches.push(sketch);
    return sketch;
  });
  return { attach, sketches };
});

vi.mock("drawably", () => ({
  drawablyArrow: drawably.attach,
  drawablyBadge: drawably.attach,
  drawablyButton: drawably.attach,
  drawablyCard: drawably.attach,
  drawablyCircle: drawably.attach,
  drawablyDivider: drawably.attach,
  drawablyHighlight: drawably.attach,
  drawablyList: drawably.attach,
  drawablyUnderline: drawably.attach,
}));

import {
  SketchArrow,
  SketchBadge,
  SketchBadgeLink,
  SketchButton,
  SketchCard,
  SketchCircle,
  SketchDivider,
  SketchHighlight,
  SketchList,
  SketchUnderline,
} from "./Sketch";

function ArrowHarness() {
  const from = createRef<HTMLSpanElement>();
  const to = createRef<HTMLDivElement>();
  return (
    <>
      <span ref={from}>Copy this</span>
      <div ref={to}>Target</div>
      <SketchArrow from={from} to={to} />
    </>
  );
}

describe("Sketch", () => {
  afterEach(() => {
    cleanup();
    drawably.attach.mockClear();
    drawably.sketches.length = 0;
  });

  it("renders real elements for every approved primitive", () => {
    const { container } = render(
      <>
        <SketchCard className="address-panel">Card</SketchCard>
        <SketchBadge variant="scribble">private by design</SketchBadge>
        <SketchBadgeLink href="https://example.com">Source</SketchBadgeLink>
        <SketchButton variant="solid">Copy</SketchButton>
        <SketchDivider />
        <SketchList marker="check">
          <li>No storage</li>
        </SketchList>
        <SketchCircle>not stored</SketchCircle>
        <SketchUnderline>Heading</SketchUnderline>
        <SketchHighlight>Important</SketchHighlight>
        <ArrowHarness />
      </>,
    );

    expect(container.querySelector(".address-panel")).toHaveClass("drawably-card");
    expect(container.querySelector(".drawably-badge--scribble")).toHaveTextContent(
      "private by design",
    );
    expect(container.querySelector("a.drawably-badge")).toHaveAttribute(
      "href",
      "https://example.com",
    );
    expect(container.querySelector("hr.drawably-divider")).toBeInTheDocument();
    expect(container.querySelector("ul.drawably-list")).toHaveTextContent("No storage");
    expect(container.querySelector(".drawably-circle")).toHaveTextContent("not stored");
    expect(drawably.attach).toHaveBeenCalledTimes(10);
  });

  it("destroys every attached sketch on unmount", () => {
    const rendered = render(
      <>
        <SketchCard>Card</SketchCard>
        <SketchDivider />
        <SketchCircle>Note</SketchCircle>
        <ArrowHarness />
      </>,
    );
    const sketches = [...drawably.sketches];

    rendered.unmount();

    expect(sketches).toHaveLength(4);
    for (const sketch of sketches) expect(sketch.destroy).toHaveBeenCalledOnce();
  });
});
