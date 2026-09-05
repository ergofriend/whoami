// @vitest-environment jsdom

import { cleanup, render, screen, within } from "@testing-library/react";
import { renderToString } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";

import { BrowserDetails } from "./BrowserDetails";
import type { BrowserInspection } from "../features/browser/types";

const inspection: BrowserInspection = {
  browser: {
    userAgent: "Example Browser",
    languages: ["en-US", "en"],
    timezone: "Asia/Tokyo",
    utcOffsetMinutes: -540,
    cookiesEnabled: true,
    doNotTrack: null,
    platform: "Win32",
  },
  device: {
    screen: "1920 × 1080",
    availableScreen: "Not supported",
    viewport: "1280 × 720",
    devicePixelRatio: 1.5,
    colorDepth: 24,
    pixelDepth: 24,
    maxTouchPoints: 0,
    logicalProcessors: 8,
    deviceMemoryGiB: 8,
  },
  preferences: {
    colorScheme: "dark",
    reducedMotion: true,
    contrast: null,
    online: true,
    effectiveConnectionType: "4g",
    downlinkMbps: 10,
    rttMs: 50,
    saveData: false,
  },
};

describe("BrowserDetails", () => {
  afterEach(cleanup);

  it("renders placeholders on the server without collecting browser data", () => {
    const collect = vi.fn(() => inspection);
    const html = renderToString(<BrowserDetails collect={collect} />);

    expect(collect).not.toHaveBeenCalled();
    expect(html.match(/Not supported/g)).toHaveLength(24);
    expect(html).not.toContain("Example Browser");
  });

  it("filters groups while preserving display order and technical headings", () => {
    render(
      <BrowserDetails
        collect={() => inspection}
        groups={["preferences", "device", "device"]}
        headingVariant="technical"
      />,
    );

    const headings = screen.getAllByRole("heading", { level: 2 });
    expect(headings.map((heading) => heading.textContent)).toEqual([
      "Device and screen",
      "Preferences and capabilities",
    ]);
    for (const heading of headings) {
      expect(heading).toHaveClass("technical-section-heading");
    }
    expect(screen.queryByText("Example Browser")).not.toBeInTheDocument();
  });

  it("renders collected browser details in the documented section and row order", async () => {
    render(<BrowserDetails collect={() => inspection} />);

    expect(await screen.findByText("Example Browser")).toBeInTheDocument();

    const expectedGroups = [
      [
        "Browser",
        [
          "User agent",
          "Browser languages",
          "Browser timezone",
          "UTC offset",
          "Cookies enabled",
          "Do Not Track",
          "Platform",
        ],
      ],
      [
        "Device and screen",
        [
          "Screen size",
          "Available screen size",
          "Viewport size",
          "Device pixel ratio",
          "Color depth",
          "Pixel depth",
          "Maximum touch points",
          "Logical processors",
          "Device memory",
        ],
      ],
      [
        "Preferences and capabilities",
        [
          "Preferred color scheme",
          "Reduced motion",
          "Contrast preference",
          "Online",
          "Effective connection type",
          "Downlink",
          "Round-trip time",
          "Data saver",
        ],
      ],
    ] as const;

    for (const [title, labels] of expectedGroups) {
      const section = screen.getByRole("heading", { name: title, level: 2 }).closest("section");
      if (!section) throw new Error(`${title} section was not rendered`);
      expect(Array.from(section.querySelectorAll("dt")).map((term) => term.textContent)).toEqual(
        labels,
      );
    }

    const browserSection = screen
      .getByRole("heading", { name: "Browser", level: 2 })
      .closest("section");
    if (!browserSection) throw new Error("Browser section was not rendered");
    expect(within(browserSection).getByText("en-US, en")).toBeInTheDocument();
    expect(within(browserSection).getAllByText("Not supported")).toHaveLength(1);
  });

  it("renders empty user-agent and language fallbacks as Not supported", async () => {
    render(
      <BrowserDetails
        collect={() => ({
          ...inspection,
          browser: { ...inspection.browser, userAgent: "", languages: [] },
        })}
      />,
    );

    const browserSection = screen
      .getByRole("heading", { name: "Browser", level: 2 })
      .closest("section");
    if (!browserSection) throw new Error("Browser section was not rendered");

    await screen.findAllByText("Not supported");
    expect(
      Array.from(browserSection.querySelectorAll("dd")).map((definition) => definition.textContent),
    ).toEqual([
      "Not supported",
      "Not supported",
      "Asia/Tokyo",
      "UTC+09:00",
      "Yes",
      "Not supported",
      "Win32",
    ]);
  });

  it("formats UTC offsets and network or hardware measurements with readable units", async () => {
    render(<BrowserDetails collect={() => inspection} />);

    expect(await screen.findByText("UTC+09:00")).toBeInTheDocument();
    expect(screen.getByText("8 GiB")).toBeInTheDocument();
    expect(screen.getByText("10 Mbps")).toBeInTheDocument();
    expect(screen.getByText("50 ms")).toBeInTheDocument();
  });

  it("renders every normalized unsupported value exactly as Not supported", async () => {
    const unsupported: BrowserInspection = {
      browser: {
        userAgent: null,
        languages: null,
        timezone: null,
        utcOffsetMinutes: null,
        cookiesEnabled: null,
        doNotTrack: null,
        platform: null,
      },
      device: {
        screen: null,
        availableScreen: null,
        viewport: null,
        devicePixelRatio: null,
        colorDepth: null,
        pixelDepth: null,
        maxTouchPoints: null,
        logicalProcessors: null,
        deviceMemoryGiB: null,
      },
      preferences: {
        colorScheme: null,
        reducedMotion: null,
        contrast: null,
        online: null,
        effectiveConnectionType: null,
        downlinkMbps: null,
        rttMs: null,
        saveData: null,
      },
    };

    render(<BrowserDetails collect={() => unsupported} />);

    await screen.findByRole("heading", { name: "Browser", level: 2 });
    expect(screen.getAllByText("Not supported")).toHaveLength(24);
  });
});
