// @vitest-environment jsdom

import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest";

import { HomeView } from "./HomeView";
import type { ServerInspection } from "../features/server/server-inspection";

let stylesheet: HTMLStyleElement;

beforeAll(() => {
  stylesheet = document.createElement("style");
  stylesheet.textContent = readFileSync(resolve(process.cwd(), "src/styles.css"), "utf8");
  document.head.appendChild(stylesheet);
});

afterAll(() => stylesheet.remove());

const emptyInspection: ServerInspection = {
  publicIp: { address: null, version: null },
  network: { asn: null, organization: null },
  location: {
    continent: null,
    country: null,
    region: null,
    regionCode: null,
    city: null,
    postalCode: null,
    metroCode: null,
    latitude: null,
    longitude: null,
    timezone: null,
  },
  connection: {
    httpProtocol: null,
    requestPriority: null,
    clientAcceptEncoding: null,
    tcpRttMs: null,
    quicRttMs: null,
  },
  tls: { version: null, cipher: null, clientHelloLength: null },
  cloudflare: { colo: null },
  headers: {
    Accept: null,
    "Accept-Encoding": null,
    "Accept-Language": null,
    "CF-Connecting-IP": null,
    "CF-IPCountry": null,
    Host: null,
    "Sec-CH-UA": null,
    "Sec-CH-UA-Mobile": null,
    "Sec-CH-UA-Platform": null,
    "Upgrade-Insecure-Requests": null,
    "User-Agent": null,
    "X-Forwarded-Proto": null,
  },
};

describe("HomeView", () => {
  afterEach(cleanup);

  it("shows only the three primary information sections before disclosure opens", async () => {
    render(<HomeView inspection={emptyInspection} />);

    expect(
      screen
        .getAllByRole("heading")
        .filter((heading) => heading.closest("details") === null)
        .map((heading) => heading.textContent),
    ).toEqual(["whoami", "Network", "Approximate location", "Browser"]);

    const banner = screen.getByRole("banner");
    expect(banner).toBeInTheDocument();
    expect(banner.querySelector(".site-intro")).toHaveTextContent(
      "See the network and browser information available to this site.",
    );
    expect(screen.getByRole("main")).toBeInTheDocument();
    expect(screen.getByRole("contentinfo")).toBeInTheDocument();
    await waitFor(() => {
      expect(document.querySelectorAll(".drawably-card")).toHaveLength(9);
    });
    for (const heading of screen.getAllByRole("heading")) {
      expect(heading).toHaveClass("sketch-heading");
    }

    const summary = screen.getByText("More details");
    const disclosure = summary.closest("details");
    expect(disclosure).not.toBeNull();
    expect(disclosure).not.toHaveAttribute("open");
    expect(screen.getByRole("heading", { name: "Connection" })).not.toBeVisible();
    expect(screen.queryByRole("button", { name: "Copy" })).not.toBeInTheDocument();

    expect(
      screen.getByText("Approximate location derived from your public IP address."),
    ).toBeInTheDocument();
    expect(screen.getAllByText("Not available").length).toBeGreaterThan(0);
  });

  it("reveals the remaining information sections from More details", async () => {
    render(<HomeView inspection={emptyInspection} />);

    fireEvent.click(screen.getByText("More details"));

    expect(screen.getAllByRole("heading").map((heading) => heading.textContent)).toEqual([
      "whoami",
      "Network",
      "Approximate location",
      "Browser",
      "Connection",
      "TLS",
      "Cloudflare",
      "Device and screen",
      "Preferences and capabilities",
      "Request headers",
    ]);
  });

  it("pins the source badge diagonally to the header's upper-right corner", () => {
    render(<HomeView inspection={emptyInspection} />);

    const sourceCallout = screen.getByText("open source").parentElement;
    expect(sourceCallout).not.toBeNull();
    expect(getComputedStyle(sourceCallout!)).toMatchObject({
      position: "absolute",
      right: "0px",
      transform: "rotate(5deg)",
    });
    expect(getComputedStyle(screen.getByRole("banner"))).toMatchObject({ position: "relative" });
  });

  it("integrates browser details, an IP copy control, and the source link", async () => {
    render(
      <HomeView
        inspection={{
          ...emptyInspection,
          publicIp: { address: "203.0.113.42", version: "IPv4" },
        }}
      />,
    );

    const expectedBrowserGroups = [
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

    for (const [title, labels] of expectedBrowserGroups) {
      const heading = screen.getByRole("heading", { name: title, level: 2 });
      const section = heading.closest("section");
      if (!section) {
        throw new Error(`${title} section was not rendered`);
      }
      expect(Array.from(section.querySelectorAll("dt")).map((term) => term.textContent)).toEqual(
        labels,
      );
    }

    expect(await screen.findByText(navigator.userAgent)).toBeInTheDocument();
    const networkSection = screen
      .getByRole("heading", { name: "Network", level: 2 })
      .closest("section");
    if (!networkSection) {
      throw new Error("Network section was not rendered");
    }
    expect(
      Array.from(networkSection.querySelectorAll("dt")).map((term) => term.textContent),
    ).toEqual(["IPv4 address", "ASN", "Organization"]);
    const addressRow = within(networkSection).getByText("IPv4 address").closest("div");
    if (!addressRow) {
      throw new Error("IPv4 address row was not rendered");
    }
    expect(within(addressRow).getByRole("button", { name: "Copy" })).toBeInTheDocument();

    expect(screen.getByText("open source")).toBeInTheDocument();
    const sourceLink = screen.getByRole("link", { name: "Source on GitHub" });
    expect(sourceLink).toHaveAttribute("href", "https://github.com/ergofriend/whoami");
    expect(sourceLink).toHaveClass(
      "repository-link",
      "drawably-host",
      "drawably-badge",
      "drawably-badge--outline",
    );
    expect(
      sourceLink.querySelector("svg[viewBox='0 0 16 16'][aria-hidden='true']"),
    ).toBeInTheDocument();
    expect(
      screen.getByText("This site does not store the information displayed above."),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        "Browser details are processed only in your browser and are not sent back to this site.",
      ),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        "Cloudflare Web Analytics is used for privacy-focused performance and visit analytics.",
      ),
    ).toBeInTheDocument();

    fireEvent.click(screen.getByText("More details"));

    const requestHeaders = screen
      .getByRole("heading", { name: "Request headers", level: 2 })
      .closest("section");
    if (!requestHeaders) {
      throw new Error("Request headers section was not rendered");
    }
    expect(within(requestHeaders).getAllByText("Not available").length).toBe(12);
  });
});
