import { describe, expect, it } from "vitest";

import {
  ALLOWED_REQUEST_HEADERS,
  buildServerInspection,
  detectIpVersion,
} from "./server-inspection";

function createRequest(headers: HeadersInit = {}, cf: Record<string, unknown> = {}): Request {
  const request = new Request("https://whoami.kasu.dev/", { headers });
  Object.defineProperty(request, "cf", { value: cf });
  return request;
}

describe("detectIpVersion", () => {
  it.each([
    ["203.0.113.42", "IPv4"],
    ["2001:db8::42", "IPv6"],
    ["2001:db8:0:1:2:3:4:5", "IPv6"],
    ["::", "IPv6"],
    ["::ffff:192.0.2.1", "IPv6"],
    ["999.1.1.1", null],
    [":", null],
    ["2001:db8:::42", null],
    ["2001:db8:00000::42", null],
    ["1:2:3:4:5:6:7:8:9", null],
    ["1:2:3", null],
    ["1::2::3", null],
    ["::ffff:192.0.2.999", null],
    ["::192.0.2.1:1", null],
    ["192.0.2.1::", null],
    ["1:192.0.2.1::", null],
    ["not-an-ip", null],
    [null, null],
  ] as const)("returns %s for %s", (address, expected) => {
    expect(detectIpVersion(address)).toBe(expected);
  });
});

describe("buildServerInspection", () => {
  it("maps public request data without serializing secret headers", () => {
    const result = buildServerInspection(
      createRequest(
        {
          "cf-connecting-ip": "203.0.113.42",
          "cf-ray": "8a1234567890abcd-NRT",
          "user-agent": "whoami-test-agent/1.0",
          cookie: "session=secret-cookie-value",
          authorization: "Bearer secret-authorization-value",
          "x-unknown": "secret-unknown-value",
        },
        {
          asn: 64500,
          asOrganization: "Example Network",
          city: "Tokyo",
          country: "JP",
          colo: "NRT",
          httpProtocol: "HTTP/3",
          tlsVersion: "TLSv1.3",
          tlsCipher: "AEAD-AES256-GCM-SHA384",
        },
      ),
    );

    expect(result.publicIp).toEqual({
      ipv4: "203.0.113.42",
      ipv6: null,
      pseudoIpv4: null,
    });
    expect(result.network).toEqual({ asn: 64500, organization: "Example Network" });
    expect(result.location.region).toBeNull();
    expect(result.connection.httpProtocol).toBe("HTTP/3");
    expect(result.tls.version).toBe("TLSv1.3");
    expect(result.cloudflare).toEqual({ colo: "NRT" });
    expect(result.headers).not.toHaveProperty("CF-Ray");
    expect(result.headers["User-Agent"]).toBe("whoami-test-agent/1.0");
    expect(JSON.stringify(result)).not.toContain("secret-");
    expect(Object.keys(result.headers)).toEqual(ALLOWED_REQUEST_HEADERS);
  });

  it("keeps the real IPv6 separate from Cloudflare pseudo IPv4", () => {
    const result = buildServerInspection(
      createRequest({
        "cf-connecting-ip": "240.16.0.1",
        "cf-connecting-ipv6": "2001:db8::42",
      }),
    );

    expect(result.publicIp).toEqual({
      ipv4: null,
      ipv6: "2001:db8::42",
      pseudoIpv4: "240.16.0.1",
    });
    expect(result.headers["CF-Connecting-IPv6"]).toBe("2001:db8::42");
  });

  it("exposes an added pseudo IPv4 alongside the real IPv6", () => {
    const result = buildServerInspection(
      createRequest({
        "cf-connecting-ip": "2001:db8::42",
        "cf-pseudo-ipv4": "240.16.0.1",
      }),
    );

    expect(result.publicIp).toEqual({
      ipv4: null,
      ipv6: "2001:db8::42",
      pseudoIpv4: "240.16.0.1",
    });
    expect(result.headers["CF-Pseudo-IPv4"]).toBe("240.16.0.1");
  });

  it("normalizes invalid Cloudflare values without discarding valid siblings", () => {
    const result = buildServerInspection(
      createRequest(
        {},
        {
          asn: Number.NaN,
          asOrganization: 42,
          city: "Tokyo",
          clientQuicRtt: Number.POSITIVE_INFINITY,
          tlsVersion: "",
        },
      ),
    );

    expect(result.network).toEqual({ asn: null, organization: null });
    expect(result.location.city).toBe("Tokyo");
    expect(result.connection.quicRttMs).toBeNull();
    expect(result.tls.version).toBeNull();
  });
});
