// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { KeyValueSection } from "./KeyValueSection";
import { ServerDetails } from "./ServerDetails";
import type { ServerInspection } from "../features/server/server-inspection";

const inspection: ServerInspection = {
  publicIp: { ipv4: "203.0.113.42", ipv6: null, pseudoIpv4: null },
  network: { asn: 64500, organization: "Example Network" },
  location: {
    continent: "NA",
    country: "US",
    region: "California",
    regionCode: "CA",
    city: "San Francisco",
    postalCode: "94107",
    metroCode: "807",
    latitude: "37.77",
    longitude: "-122.39",
    timezone: "America/Los_Angeles",
  },
  connection: {
    httpProtocol: "HTTP/3",
    requestPriority: "u=1",
    clientAcceptEncoding: "gzip, br",
    tcpRttMs: 12,
    quicRttMs: null,
  },
  tls: {
    version: "TLSv1.3",
    cipher: "AEAD-AES256-GCM-SHA384",
    clientHelloLength: "512",
  },
  cloudflare: { colo: "SFO" },
  headers: {
    Accept: "text/html",
    "Accept-Encoding": "gzip, br",
    "Accept-Language": "en-US",
    "CF-Connecting-IP": "203.0.113.42",
    "CF-Connecting-IPv6": null,
    "CF-IPCountry": "US",
    "CF-Pseudo-IPv4": null,
    Host: "whoami.example.com",
    "Sec-CH-UA": "Chromium",
    "Sec-CH-UA-Mobile": "?0",
    "Sec-CH-UA-Platform": "Windows",
    "Upgrade-Insecure-Requests": "1",
    "User-Agent": "whoami-test-agent/1.0",
    "X-Forwarded-Proto": "https",
  },
};

describe("ServerDetails", () => {
  afterEach(cleanup);

  it("renders server groups in semantic order with null values and links", () => {
    render(
      <ServerDetails
        inspection={{
          ...inspection,
          connection: { ...inspection.connection, quicRttMs: null },
          location: { ...inspection.location, region: null },
        }}
        browserDetails={
          <KeyValueSection
            title="Browser"
            items={[{ label: "User agent", value: "Not supported" }]}
          />
        }
        extendedBrowserDetails={
          <KeyValueSection
            title="Device and screen"
            items={[{ label: "Screen", value: "1 × 1" }]}
          />
        }
      />,
    );

    const addressPanel = screen.getByRole("region", { name: "Public IP addresses" });
    expect(within(addressPanel).getByText("203.0.113.42")).toBeInTheDocument();
    expect(within(addressPanel).getByRole("button", { name: "Copy IPv4 address" })).toBeEnabled();

    const connectionOverview = screen.getByRole("region", {
      name: "Connection summary",
    });
    const networkSection = within(connectionOverview).getByRole("region", { name: "Network" });
    expect(
      Array.from(networkSection.querySelectorAll("dt")).map((term) => term.textContent),
    ).toEqual(["ASN", "Organization"]);

    const summaryLayout = document.querySelector(".summary-layout");
    expect(summaryLayout).not.toBeNull();
    expect(Array.from(summaryLayout?.children ?? []).map((child) => child.className)).toEqual([
      "key-value-section location-summary",
      "browser-summary",
    ]);

    fireEvent.click(screen.getByText("More technical details"));

    expect(screen.getAllByRole("heading").map((heading) => heading.textContent)).toEqual([
      "Public IP addresses",
      "Network",
      "Approximate location",
      "Browser",
      "Connection",
      "TLS",
      "Cloudflare",
      "Device and screen",
      "Request headers",
    ]);

    const locationHeading = screen.getByRole("heading", {
      name: "Approximate location",
      level: 2,
    });
    const locationSection = locationHeading.closest("section");
    if (!locationSection) {
      throw new Error("Approximate location section was not rendered");
    }
    expect(
      within(locationSection).getByText(
        "Approximate location derived from your public IP address.",
      ),
    ).toBeInTheDocument();
    expect(within(locationSection).getByText("Region")).toBeInTheDocument();
    expect(within(locationSection).getAllByText("Not available")).toHaveLength(1);

    const headerHeading = screen.getByRole("heading", { name: "Request headers", level: 2 });
    const headerSection = headerHeading.closest("section");
    if (!headerSection) {
      throw new Error("Request headers section was not rendered");
    }
    expect(
      Array.from(headerSection.querySelectorAll("dt")).map((term) => term.textContent),
    ).toEqual(Object.keys(inspection.headers));
  });

  it("labels an IPv6 connection in the public address panel", () => {
    render(
      <ServerDetails
        inspection={{
          ...inspection,
          publicIp: { ipv4: null, ipv6: "2001:db8::42", pseudoIpv4: null },
        }}
        browserDetails={null}
      />,
    );

    const addressPanel = screen.getByRole("region", { name: "Public IP addresses" });
    expect(within(addressPanel).getByText("Your IPv6 address")).toBeInTheDocument();
    expect(within(addressPanel).getByText("2001:db8::42")).toBeInTheDocument();
    expect(within(addressPanel).getByText("Not available")).toBeInTheDocument();
  });

  it("shows Cloudflare pseudo IPv4 as a separate value", () => {
    render(
      <ServerDetails
        inspection={{
          ...inspection,
          publicIp: { ipv4: null, ipv6: "2001:db8::42", pseudoIpv4: "240.16.0.1" },
        }}
        browserDetails={null}
      />,
    );

    const addressPanel = screen.getByRole("region", { name: "Public IP addresses" });
    expect(within(addressPanel).getByText("Pseudo IPv4")).toBeInTheDocument();
    expect(within(addressPanel).getByText("240.16.0.1")).toBeInTheDocument();
    expect(within(addressPanel).getByRole("button", { name: "Copy pseudo IPv4" })).toBeEnabled();

    const networkSection = screen.getByRole("region", { name: "Network" });
    expect(within(networkSection).queryByText("Pseudo IPv4")).not.toBeInTheDocument();
  });
});
