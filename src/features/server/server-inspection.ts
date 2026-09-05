import * as v from "valibot";

import { CloudflareSchema, NullableStringSchema } from "./cloudflare-schema";
import { collectRequestHeaders } from "./request-headers";

export { ALLOWED_REQUEST_HEADERS } from "./request-headers";
export type { ServerInspection } from "./types";

const IPv4Schema = v.pipe(v.string(), v.ipv4());
const IPv6Schema = v.pipe(v.string(), v.ipv6());
const parseNullableString = v.parser(NullableStringSchema);

export function detectIpVersion(address: string | null): "IPv4" | "IPv6" | null {
  if (address === null) {
    return null;
  }

  if (v.is(IPv4Schema, address)) return "IPv4";

  if (v.is(IPv6Schema, address)) return "IPv6";

  return null;
}

export function buildServerInspection(request: Request) {
  const rawCloudflare = (request as unknown as { cf?: unknown }).cf;
  const cloudflare = v.parse(
    CloudflareSchema,
    typeof rawCloudflare === "object" && rawCloudflare !== null ? rawCloudflare : {},
  );
  const publicIpAddress = parseNullableString(request.headers.get("CF-Connecting-IP"));
  const connectingIpv6 = parseNullableString(request.headers.get("CF-Connecting-IPv6"));
  const addedPseudoIpv4 = parseNullableString(request.headers.get("CF-Pseudo-IPv4"));
  const publicIpVersion = detectIpVersion(publicIpAddress);
  const realIpv6 = detectIpVersion(connectingIpv6) === "IPv6" ? connectingIpv6 : null;
  const pseudoIpv4 = detectIpVersion(addedPseudoIpv4) === "IPv4" ? addedPseudoIpv4 : null;
  const usesOverwrittenPseudoIpv4 = realIpv6 !== null && publicIpVersion === "IPv4";

  return {
    publicIp: {
      ipv4: publicIpVersion === "IPv4" && !usesOverwrittenPseudoIpv4 ? publicIpAddress : null,
      ipv6: realIpv6 ?? (publicIpVersion === "IPv6" ? publicIpAddress : null),
      pseudoIpv4: usesOverwrittenPseudoIpv4 ? publicIpAddress : pseudoIpv4,
    },
    network: {
      asn: cloudflare.asn,
      organization: cloudflare.asOrganization,
    },
    location: {
      continent: cloudflare.continent,
      country: cloudflare.country,
      region: cloudflare.region,
      regionCode: cloudflare.regionCode,
      city: cloudflare.city,
      postalCode: cloudflare.postalCode,
      metroCode: cloudflare.metroCode,
      latitude: cloudflare.latitude,
      longitude: cloudflare.longitude,
      timezone: cloudflare.timezone,
    },
    connection: {
      httpProtocol: cloudflare.httpProtocol,
      requestPriority: cloudflare.requestPriority,
      clientAcceptEncoding: cloudflare.clientAcceptEncoding,
      tcpRttMs: cloudflare.clientTcpRtt,
      quicRttMs: cloudflare.clientQuicRtt,
    },
    tls: {
      version: cloudflare.tlsVersion,
      cipher: cloudflare.tlsCipher,
      clientHelloLength: cloudflare.tlsClientHelloLength,
    },
    cloudflare: {
      colo: cloudflare.colo,
    },
    headers: collectRequestHeaders(request),
  };
}
