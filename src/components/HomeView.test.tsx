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
  publicIp: { ipv4: null, ipv6: null, pseudoIpv4: null },
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
    "CF-Connecting-IPv6": null,
    "CF-IPCountry": null,
    "CF-Pseudo-IPv4": null,
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
    ).toEqual(["whoami", "Public IP addresses", "Network", "Approximate Location", "Browser"]);

    const banner = screen.getByRole("banner");
    expect(banner).toBeInTheDocument();
    expect(banner.querySelector(".site-intro")).toHaveTextContent(
      "See the network and browser information available to this site.",
    );
    expect(screen.getByRole("main")).toBeInTheDocument();
    expect(screen.getByRole("contentinfo")).toBeInTheDocument();
    await waitFor(() => expect(document.querySelectorAll(".drawably-card")).toHaveLength(1));
    for (const heading of screen
      .getAllByRole("heading")
      .filter(
        (heading) =>
          !heading.classList.contains("visually-hidden") && heading.textContent !== "Network",
      )) {
      expect(heading).toHaveClass("sketch-heading");
    }

    const summary = screen.getByText("More technical details");
    const disclosure = summary.closest("details");
    expect(disclosure).not.toBeNull();
    expect(disclosure).not.toHaveAttribute("open");
    expect(screen.getByRole("heading", { name: "Connection" })).not.toBeVisible();
    expect(screen.getByRole("button", { name: "Copy IPv4 address" })).toBeDisabled();
    expect(screen.queryByRole("button", { name: "Copy IPv6 address" })).not.toBeInTheDocument();

    expect(
      screen.getByText("Approximate location derived from your public IP address."),
    ).toBeInTheDocument();
    expect(screen.getAllByText("Not available").length).toBeGreaterThan(0);
    expect(
      screen
        .getByRole("heading", { name: "Browser", level: 2 })
        .querySelector(".doodle-icon--browser"),
    ).toBeInTheDocument();
  });

  it("uses one vertical rhythm for related groups and major sections", () => {
    render(<HomeView inspection={emptyInspection} />);

    const rootStyle = getComputedStyle(document.documentElement);
    expect(rootStyle.getPropertyValue("--space-group").trim()).not.toBe("");
    expect(rootStyle.getPropertyValue("--space-section").trim()).not.toBe("");

    const network = screen.getByRole("region", { name: "Network" });
    expect(getComputedStyle(network).position).toBe("relative");
    expect(getComputedStyle(network).top).toBe("-0.75rem");
    expect(getComputedStyle(network).gridColumn).toBe("2");
    expect(getComputedStyle(network).gridRow).toBe("1");
    expect(getComputedStyle(network).justifySelf).toBe("center");
    const networkHeading = screen.getByRole("heading", { name: "Network", level: 2 });
    const networkIcon = networkHeading.querySelector(".doodle-icon") as SVGElement;
    expect(getComputedStyle(networkIcon).position).toBe("absolute");
    expect(getComputedStyle(networkIcon).width).toBe("2.4rem");
    expect(getComputedStyle(networkHeading).gap).toBe("0.2em");

    const summaryLayout = document.querySelector<HTMLElement>(".summary-layout");
    const moreDetails = document.querySelector<HTMLElement>(".more-details");
    const trustAssurances = document.querySelector<HTMLElement>(".trust-assurances");
    if (!summaryLayout || !moreDetails || !trustAssurances) {
      throw new Error("Primary section spacing targets were not rendered");
    }

    expect(getComputedStyle(summaryLayout).gridTemplateColumns).toBe(
      "minmax(0, 1.1fr) minmax(20rem, 0.9fr)",
    );
    const browserSummary = screen.getByText("Browser").closest(".browser-summary")!;
    expect(getComputedStyle(browserSummary).gridRow).toBe("1");
    expect(getComputedStyle(browserSummary).alignSelf).toBe("end");

    expect([
      getComputedStyle(screen.getByRole("banner")).marginBottom,
      getComputedStyle(summaryLayout).marginTop,
      getComputedStyle(moreDetails).marginTop,
      getComputedStyle(screen.getByRole("contentinfo")).marginTop,
    ]).toEqual(Array(4).fill("var(--space-section)"));
    expect(getComputedStyle(trustAssurances).marginTop).toBe("0px");
    expect(trustAssurances.closest("footer")).toBe(screen.getByRole("contentinfo"));
  });

  it("keeps top-level text on one horizontal rail inside full-width surfaces", () => {
    render(<HomeView inspection={emptyInspection} />);

    const rootStyle = getComputedStyle(document.documentElement);
    expect(rootStyle.getPropertyValue("--content-gutter").trim()).not.toBe("");
    expect(rootStyle.getPropertyValue("--content-inset").trim()).not.toBe("");

    const shell = document.querySelector<HTMLElement>(".site-shell");
    const addressPanel = document.querySelector<HTMLElement>(".public-address-panel");
    const connectionOverview = document.querySelector<HTMLElement>(".connection-overview");
    const network = screen.getByRole("region", { name: "Network" });
    const summaryLayout = document.querySelector<HTMLElement>(".summary-layout");
    const location = screen
      .getByRole("heading", { name: "Approximate Location" })
      .closest<HTMLElement>("section");
    const browser = document.querySelector<HTMLElement>(".browser-summary");
    const detailsSummary = document.querySelector<HTMLElement>(".more-details > summary");
    const detailsStack = document.querySelector<HTMLElement>(".details-stack");
    const trustAssurances = document.querySelector<HTMLElement>(".trust-assurances");
    if (
      !shell ||
      !addressPanel ||
      !connectionOverview ||
      !summaryLayout ||
      !location ||
      !browser ||
      !detailsSummary ||
      !detailsStack ||
      !trustAssurances
    ) {
      throw new Error("Horizontal rail targets were not rendered");
    }

    expect(getComputedStyle(shell).paddingLeft).toBe("var(--content-gutter)");
    expect(getComputedStyle(shell).paddingRight).toBe("var(--content-gutter)");
    expect(getComputedStyle(summaryLayout).paddingLeft).toBe("var(--content-inset)");
    expect(getComputedStyle(summaryLayout).paddingRight).toBe("var(--content-inset)");
    expect(getComputedStyle(connectionOverview).paddingLeft).toBe("var(--content-inset)");
    expect(getComputedStyle(connectionOverview).paddingRight).toBe("var(--content-inset)");
    expect(getComputedStyle(location).paddingLeft).toBe("0px");
    expect(getComputedStyle(browser).paddingLeft).toBe("0px");
    expect(
      getComputedStyle(document.querySelector<HTMLElement>(".more-details")!).paddingLeft,
    ).toBe("var(--content-inset)");
    expect(getComputedStyle(detailsSummary).marginLeft).toBe("0px");
    expect(getComputedStyle(detailsStack).paddingLeft).toBe("0px");
    expect(
      [screen.getByRole("banner"), network, screen.getByRole("contentinfo")].map(
        (element) => getComputedStyle(element).paddingLeft,
      ),
    ).toEqual(Array(3).fill("var(--content-inset)"));
    expect(getComputedStyle(addressPanel).getPropertyValue("padding-inline")).toBe(
      "var(--content-inset)",
    );
    expect(getComputedStyle(trustAssurances).paddingLeft).toBe("0px");
  });

  it("reveals the remaining information sections from More technical details", async () => {
    render(<HomeView inspection={emptyInspection} />);

    expect(screen.queryByRole("separator")).not.toBeInTheDocument();

    fireEvent.click(screen.getByText("More technical details"));

    const detailsStack = document.querySelector<HTMLElement>(".details-stack");
    const requestHeaders = screen
      .getByRole("heading", { name: "Request headers" })
      .closest("section");
    expect(detailsStack).not.toBeNull();
    expect(requestHeaders).not.toBeNull();
    expect(getComputedStyle(detailsStack as HTMLElement).gridTemplateColumns).toBe(
      "repeat(2, minmax(0, 1fr))",
    );
    expect(getComputedStyle(requestHeaders as HTMLElement).gridColumn).toBe("1 / -1");

    expect(screen.getAllByRole("heading").map((heading) => heading.textContent)).toEqual([
      "whoami",
      "Public IP addresses",
      "Network",
      "Approximate Location",
      "Browser",
      "Connection",
      "Device and screen",
      "TLS",
      "Cloudflare",
      "Preferences and capabilities",
      "Request headers",
    ]);

    const technicalHeadings = screen
      .getAllByRole("heading", { level: 2 })
      .filter((heading) => heading.closest(".details-stack") !== null);
    expect(technicalHeadings).not.toHaveLength(0);
    for (const heading of technicalHeadings) {
      expect(heading).toHaveClass("technical-section-heading");
      expect(heading.querySelector(".drawably-underline")).not.toBeInTheDocument();
      const list = heading.closest("section")?.querySelector<HTMLElement>("dl");
      expect(list).not.toBeNull();
      expect(getComputedStyle(list as HTMLElement).marginLeft).toBe("var(--technical-indent)");
    }
  });

  it("uses one address card and exposes concise trust assurances", async () => {
    render(<HomeView inspection={emptyInspection} />);

    await waitFor(() => expect(document.querySelectorAll(".drawably-card")).toHaveLength(1));
    const assurances = screen.getByRole("list", { name: "Privacy assurances" });
    expect(
      within(assurances)
        .getAllByRole("listitem")
        .map((item) => item.textContent),
    ).toEqual(["No storage", "No GPS", "Browser data stays local"]);
    expect(screen.getByRole("main")).toHaveClass("inspection-main");
    expect(screen.getByRole("link", { name: "Source on GitHub" }).parentElement).toHaveClass(
      "site-header-actions",
    );
  });

  it("integrates browser details, an IP copy control, and the source link", async () => {
    render(
      <HomeView
        inspection={{
          ...emptyInspection,
          publicIp: { ipv4: "203.0.113.42", ipv6: null, pseudoIpv4: null },
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
    ).toEqual(["ASN", "Organization"]);
    const addressPanel = screen.getByRole("region", { name: "Public IP addresses" });
    expect(within(addressPanel).getByText("203.0.113.42")).toBeInTheDocument();
    expect(within(addressPanel).getByRole("button", { name: "Copy IPv4 address" })).toBeEnabled();

    expect(screen.queryByText("open source")).not.toBeInTheDocument();
    const sourceLink = screen.getByRole("link", { name: "Source on GitHub" });
    expect(sourceLink).toHaveAttribute("href", "https://github.com/ergofriend/whoami");
    expect(sourceLink).toHaveClass(
      "repository-link",
      "drawably-host",
      "drawably-badge",
      "drawably-badge--outline",
    );
    expect(getComputedStyle(sourceLink).whiteSpace).toBe("nowrap");
    expect(getComputedStyle(sourceLink.parentElement as HTMLElement).position).toBe("absolute");
    expect(getComputedStyle(sourceLink.parentElement as HTMLElement).transform).toBe(
      "translateY(-50%) rotate(5deg)",
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

    fireEvent.click(screen.getByText("More technical details"));

    const requestHeaders = screen
      .getByRole("heading", { name: "Request headers", level: 2 })
      .closest("section");
    if (!requestHeaders) {
      throw new Error("Request headers section was not rendered");
    }
    expect(within(requestHeaders).getAllByText("Not available").length).toBe(14);
  });
});
