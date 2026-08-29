// @vitest-environment jsdom

import { cleanup, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { HomeView } from "./HomeView";
import type { ServerInspection } from "../features/server/server-inspection";

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

  it("renders the complete unstyled semantic page in the required heading order", () => {
    render(<HomeView inspection={emptyInspection} />);

    expect(screen.getAllByRole("heading").map((heading) => heading.textContent)).toEqual([
      "whoami",
      "Public IP",
      "Network",
      "Approximate location",
      "Connection",
      "TLS",
      "Cloudflare",
      "Browser",
      "Device and screen",
      "Preferences and capabilities",
      "Request headers",
    ]);

    const banner = screen.getByRole("banner");
    expect(banner).toBeInTheDocument();
    expect(
      within(banner).getByText("See the network and browser information available to this site."),
    ).toBeInTheDocument();
    expect(screen.getByRole("main")).toBeInTheDocument();
    expect(screen.getByRole("contentinfo")).toBeInTheDocument();
    expect(document.querySelector("style")).not.toBeInTheDocument();

    const sections = screen
      .getAllByRole("heading")
      .slice(1)
      .map((heading) => heading.closest("section"));
    expect(sections).toHaveLength(10);
    for (const section of sections) {
      expect(section).not.toBeNull();
      expect(section?.querySelector("dl")).toBeInTheDocument();
      expect(section?.querySelectorAll("dt").length).toBeGreaterThan(0);
      expect(section?.querySelectorAll("dd").length).toBeGreaterThan(0);
    }

    expect(
      screen.getByText("Approximate location derived from your public IP address."),
    ).toBeInTheDocument();
    expect(screen.getAllByText("Not available").length).toBeGreaterThan(0);
  });

  it("integrates browser details and an IP copy control while retaining server links", async () => {
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
    expect(screen.getByRole("button", { name: "Copy IP" })).toBeInTheDocument();

    const repositoryLinks = screen.getAllByRole("link", { name: "GitHub repository" });
    expect(repositoryLinks).toHaveLength(2);
    expect(repositoryLinks.map((link) => link.getAttribute("href"))).toEqual([
      "https://github.com/ergofriend/whoami",
      "https://github.com/ergofriend/whoami",
    ]);
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
    expect(screen.getByRole("link", { name: "MIT License" })).toHaveAttribute(
      "href",
      "https://github.com/ergofriend/whoami/blob/main/LICENSE",
    );
    expect(
      screen.queryByRole("link", { name: "View server data as JSON" }),
    ).not.toBeInTheDocument();

    const requestHeaders = screen
      .getByRole("heading", { name: "Request headers", level: 2 })
      .closest("section");
    if (!requestHeaders) {
      throw new Error("Request headers section was not rendered");
    }
    expect(within(requestHeaders).getAllByText("Not available").length).toBe(12);
  });
});
