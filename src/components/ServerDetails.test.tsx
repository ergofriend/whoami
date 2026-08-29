// @vitest-environment jsdom

import { cleanup, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { KeyValueSection } from "./KeyValueSection";
import { ServerDetails } from "./ServerDetails";
import type { ServerInspection } from "../features/server/server-inspection";

const inspection: ServerInspection = {
  publicIp: { address: "203.0.113.42", version: "IPv4" },
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
  cloudflare: { colo: "SFO", rayId: "8a1234567890abcd-SFO" },
  headers: {
    Accept: "text/html",
    "Accept-Encoding": "gzip, br",
    "Accept-Language": "en-US",
    "CF-Connecting-IP": "203.0.113.42",
    "CF-IPCountry": "US",
    "CF-Ray": "8a1234567890abcd-SFO",
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
        copyControl={<button type="button">Copy IP address</button>}
      />,
    );

    expect(screen.getAllByRole("heading").map((heading) => heading.textContent)).toEqual([
      "Public IP",
      "Network",
      "Approximate location",
      "Connection",
      "TLS",
      "Cloudflare",
      "Browser",
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

    const publicIpHeading = screen.getByRole("heading", { name: "Public IP", level: 2 });
    const publicIpSection = publicIpHeading.closest("section");
    if (!publicIpSection) {
      throw new Error("Public IP section was not rendered");
    }
    const publicIpDl = publicIpSection.querySelector("dl");
    const copyControl = within(publicIpSection).getByRole("button", {
      name: "Copy IP address",
    });
    if (!publicIpDl) {
      throw new Error("Public IP definition list was not rendered");
    }
    expect(
      publicIpDl.compareDocumentPosition(copyControl) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
    expect(
      within(publicIpSection).queryByRole("link", { name: "View server data as JSON" }),
    ).not.toBeInTheDocument();

    const headerHeading = screen.getByRole("heading", { name: "Request headers", level: 2 });
    const headerSection = headerHeading.closest("section");
    if (!headerSection) {
      throw new Error("Request headers section was not rendered");
    }
    expect(
      Array.from(headerSection.querySelectorAll("dt")).map((term) => term.textContent),
    ).toEqual(Object.keys(inspection.headers));
  });
});
