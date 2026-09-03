// @vitest-environment jsdom

import { createRef } from "react";
import { act, cleanup, render } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

const drawably = vi.hoisted(() => {
  const sketches: Array<{ destroy: ReturnType<typeof vi.fn> }> = [];
  const createAttach = () =>
    vi.fn(() => {
      const sketch = { destroy: vi.fn() };
      sketches.push(sketch);
      return sketch;
    });
  const drawablyArrow = createAttach();
  const drawablyBadge = createAttach();
  const drawablyButton = createAttach();
  const drawablyCard = createAttach();
  const drawablyCircle = createAttach();
  const drawablyDivider = createAttach();
  const drawablyHighlight = createAttach();
  const drawablyList = createAttach();
  const drawablyUnderline = createAttach();
  return {
    drawablyArrow,
    drawablyBadge,
    drawablyButton,
    drawablyCard,
    drawablyCircle,
    drawablyDivider,
    drawablyHighlight,
    drawablyList,
    drawablyUnderline,
    sketches,
    attachers: [
      drawablyArrow,
      drawablyBadge,
      drawablyButton,
      drawablyCard,
      drawablyCircle,
      drawablyDivider,
      drawablyHighlight,
      drawablyList,
      drawablyUnderline,
    ],
  };
});

vi.mock("drawably", () => ({
  drawablyArrow: drawably.drawablyArrow,
  drawablyBadge: drawably.drawablyBadge,
  drawablyButton: drawably.drawablyButton,
  drawablyCard: drawably.drawablyCard,
  drawablyCircle: drawably.drawablyCircle,
  drawablyDivider: drawably.drawablyDivider,
  drawablyHighlight: drawably.drawablyHighlight,
  drawablyList: drawably.drawablyList,
  drawablyUnderline: drawably.drawablyUnderline,
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
      <span data-testid="arrow-from" ref={from}>
        Copy this
      </span>
      <div data-testid="arrow-to" ref={to}>
        Target
      </div>
      <SketchArrow from={from} to={to} />
    </>
  );
}

describe("Sketch", () => {
  afterEach(() => {
    cleanup();
    for (const attach of drawably.attachers) attach.mockClear();
    drawably.sketches.length = 0;
  });

  it("renders real elements for every approved primitive", () => {
    const { container } = render(
      <>
        <SketchCard className="address-panel">Card</SketchCard>
        <SketchBadge variant="scribble" aria-label="privacy badge">
          private by design
        </SketchBadge>
        <SketchBadgeLink href="https://example.com">Source</SketchBadgeLink>
        <SketchButton variant="solid">Copy</SketchButton>
        <SketchDivider aria-label="section divider" />
        <SketchList marker="check" aria-label="privacy list">
          <li>No storage</li>
        </SketchList>
        <SketchCircle>not stored</SketchCircle>
        <SketchUnderline>Heading</SketchUnderline>
        <SketchHighlight>Important</SketchHighlight>
        <ArrowHarness />
      </>,
    );

    const card = container.querySelector(".address-panel");
    const badge = container.querySelector(".drawably-badge--scribble");
    const badgeLink = container.querySelector("a.drawably-badge");
    const button = container.querySelector("button");
    const divider = container.querySelector("hr.drawably-divider");
    const list = container.querySelector("ul.drawably-list");
    const circle = container.querySelector(".drawably-circle");
    const underline = container.querySelector(".drawably-underline");
    const highlight = container.querySelector(".drawably-highlight");
    const arrowFrom = container.querySelector("[data-testid='arrow-from']");
    const arrowTo = container.querySelector("[data-testid='arrow-to']");

    expect(card).toBeInstanceOf(HTMLDivElement);
    expect(card).toHaveClass("drawably-host", "drawably-card", "address-panel");
    expect(badge).toBeInstanceOf(HTMLSpanElement);
    expect(badge).toHaveClass("drawably-host", "drawably-badge", "drawably-badge--scribble");
    expect(badge).toHaveTextContent("private by design");
    expect(badge).toHaveAttribute("aria-label", "privacy badge");
    expect(badgeLink).toBeInstanceOf(HTMLAnchorElement);
    expect(badgeLink).toHaveClass("drawably-host", "drawably-badge", "drawably-badge--outline");
    expect(badgeLink).toHaveAttribute("href", "https://example.com");
    expect(button).toBeInstanceOf(HTMLButtonElement);
    expect(button).toHaveClass("drawably-host", "drawably-button", "drawably-button--solid");
    expect(divider).toBeInstanceOf(HTMLHRElement);
    expect(divider).toHaveClass("drawably-host", "drawably-divider");
    expect(divider).toHaveAttribute("aria-label", "section divider");
    expect(list).toBeInstanceOf(HTMLUListElement);
    expect(list).toHaveClass("drawably-host", "drawably-list");
    expect(list).toHaveAttribute("aria-label", "privacy list");
    expect(list).toHaveTextContent("No storage");
    expect(circle).toBeInstanceOf(HTMLSpanElement);
    expect(circle).toHaveClass("drawably-host", "drawably-circle");
    expect(circle).toHaveTextContent("not stored");
    expect(underline).toBeInstanceOf(HTMLSpanElement);
    expect(underline).toHaveClass("drawably-host", "drawably-underline");
    expect(highlight).toBeInstanceOf(HTMLSpanElement);
    expect(highlight).toHaveClass("drawably-host", "drawably-highlight");
    expect(arrowFrom).toBeInstanceOf(HTMLSpanElement);
    expect(arrowTo).toBeInstanceOf(HTMLDivElement);

    expect(drawably.drawablyCard).toHaveBeenCalledOnce();
    expect(drawably.drawablyCard).toHaveBeenCalledWith(card, {
      roughness: 0.9,
      boil: 0.2,
    });
    expect(drawably.drawablyBadge).toHaveBeenNthCalledWith(1, badge, {
      variant: "scribble",
      roughness: 0.9,
      boil: 0,
    });
    expect(drawably.drawablyBadge).toHaveBeenNthCalledWith(2, badgeLink, {
      variant: "outline",
      roughness: 0.9,
      boil: 0,
    });
    expect(drawably.drawablyButton).toHaveBeenCalledWith(button, { variant: "solid" });
    expect(drawably.drawablyDivider).toHaveBeenCalledWith(divider, {
      roughness: 0.8,
      boil: 0.15,
    });
    expect(drawably.drawablyList).toHaveBeenCalledWith(list, {
      marker: "check",
      roughness: 0.8,
      boil: 0.1,
    });
    expect(drawably.drawablyCircle).toHaveBeenCalledWith(circle, {
      roughness: 0.9,
      boil: 0.15,
      width: 1.5,
    });
    expect(drawably.drawablyUnderline).toHaveBeenCalledWith(underline, {
      roughness: 0.9,
      boil: 0.2,
      width: 1.5,
    });
    expect(drawably.drawablyHighlight).toHaveBeenCalledWith(highlight, {
      roughness: 0.8,
      boil: 0.15,
    });
    expect(drawably.drawablyArrow).toHaveBeenCalledWith(arrowFrom, arrowTo, {
      roughness: 0.8,
      boil: 0.1,
      width: 1.5,
    });
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

  it("passes a static arrow sketch when reduced motion is requested", () => {
    const originalMatchMedia = window.matchMedia;
    window.matchMedia = vi.fn(
      (query: string) =>
        ({
          matches: query === "(prefers-reduced-motion: reduce)",
          media: query,
          onchange: null,
          addListener: vi.fn(),
          removeListener: vi.fn(),
          addEventListener: vi.fn(),
          removeEventListener: vi.fn(),
          dispatchEvent: vi.fn(),
        }) as unknown as MediaQueryList,
    );

    try {
      const { container } = render(<ArrowHarness />);
      const arrowFrom = container.querySelector("[data-testid='arrow-from']");
      const arrowTo = container.querySelector("[data-testid='arrow-to']");

      expect(drawably.drawablyArrow).toHaveBeenCalledWith(arrowFrom, arrowTo, {
        roughness: 0.8,
        boil: 0,
        width: 1.5,
      });
    } finally {
      window.matchMedia = originalMatchMedia;
    }
  });

  it("updates the arrow sketch when reduced-motion preference changes", async () => {
    let reducedMotion = false;
    const changeListeners = new Set<() => void>();
    const originalMatchMedia = window.matchMedia;
    window.matchMedia = vi.fn(
      (query: string) =>
        ({
          matches: query === "(prefers-reduced-motion: reduce)" && reducedMotion,
          media: query,
          onchange: null,
          addListener: (listener: () => void) => changeListeners.add(listener),
          removeListener: (listener: () => void) => changeListeners.delete(listener),
          addEventListener: (_type: string, listener: () => void) => changeListeners.add(listener),
          removeEventListener: (_type: string, listener: () => void) =>
            changeListeners.delete(listener),
          dispatchEvent: vi.fn(),
        }) as unknown as MediaQueryList,
    );

    try {
      const { container } = render(<ArrowHarness />);
      const arrowFrom = container.querySelector("[data-testid='arrow-from']");
      const arrowTo = container.querySelector("[data-testid='arrow-to']");

      expect(drawably.drawablyArrow).toHaveBeenCalledWith(arrowFrom, arrowTo, {
        roughness: 0.8,
        boil: 0.1,
        width: 1.5,
      });

      await act(async () => {
        reducedMotion = true;
        for (const listener of changeListeners) listener();
      });

      expect(drawably.drawablyArrow).toHaveBeenNthCalledWith(2, arrowFrom, arrowTo, {
        roughness: 0.8,
        boil: 0,
        width: 1.5,
      });
    } finally {
      window.matchMedia = originalMatchMedia;
    }
  });
});
