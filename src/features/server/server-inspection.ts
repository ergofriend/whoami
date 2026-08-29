import * as v from "valibot";

export const ALLOWED_REQUEST_HEADERS = [
  "Accept",
  "Accept-Encoding",
  "Accept-Language",
  "CF-Connecting-IP",
  "CF-IPCountry",
  "Host",
  "Sec-CH-UA",
  "Sec-CH-UA-Mobile",
  "Sec-CH-UA-Platform",
  "Upgrade-Insecure-Requests",
  "User-Agent",
  "X-Forwarded-Proto",
] as const;

type Nullable<T> = T | null;
type AllowedHeader = (typeof ALLOWED_REQUEST_HEADERS)[number];

export type ServerInspection = {
  publicIp: { address: Nullable<string>; version: Nullable<"IPv4" | "IPv6"> };
  network: { asn: Nullable<number>; organization: Nullable<string> };
  location: {
    continent: Nullable<string>;
    country: Nullable<string>;
    region: Nullable<string>;
    regionCode: Nullable<string>;
    city: Nullable<string>;
    postalCode: Nullable<string>;
    metroCode: Nullable<string>;
    latitude: Nullable<string>;
    longitude: Nullable<string>;
    timezone: Nullable<string>;
  };
  connection: {
    httpProtocol: Nullable<string>;
    requestPriority: Nullable<string>;
    clientAcceptEncoding: Nullable<string>;
    tcpRttMs: Nullable<number>;
    quicRttMs: Nullable<number>;
  };
  tls: {
    version: Nullable<string>;
    cipher: Nullable<string>;
    clientHelloLength: Nullable<string>;
  };
  cloudflare: { colo: Nullable<string> };
  headers: Record<AllowedHeader, Nullable<string>>;
};

const NullableStringSchema = v.optional(
  v.fallback(v.union([v.pipe(v.string(), v.nonEmpty()), v.null_()]), null),
  null,
);
const NullableNumberSchema = v.optional(
  v.fallback(v.union([v.pipe(v.number(), v.finite()), v.null_()]), null),
  null,
);
const CloudflareSchema = v.object({
  asn: NullableNumberSchema,
  asOrganization: NullableStringSchema,
  continent: NullableStringSchema,
  country: NullableStringSchema,
  region: NullableStringSchema,
  regionCode: NullableStringSchema,
  city: NullableStringSchema,
  postalCode: NullableStringSchema,
  metroCode: NullableStringSchema,
  latitude: NullableStringSchema,
  longitude: NullableStringSchema,
  timezone: NullableStringSchema,
  httpProtocol: NullableStringSchema,
  requestPriority: NullableStringSchema,
  clientAcceptEncoding: NullableStringSchema,
  clientTcpRtt: NullableNumberSchema,
  clientQuicRtt: NullableNumberSchema,
  tlsVersion: NullableStringSchema,
  tlsCipher: NullableStringSchema,
  tlsClientHelloLength: NullableStringSchema,
  colo: NullableStringSchema,
});
const IPv4Schema = v.pipe(v.string(), v.ipv4());
const IPv6Schema = v.pipe(v.string(), v.ipv6());
const parseNullableString = v.parser(NullableStringSchema);

export function detectIpVersion(address: string | null): "IPv4" | "IPv6" | null {
  if (address === null) {
    return null;
  }

  if (v.safeParse(IPv4Schema, address).success) return "IPv4";

  if (v.safeParse(IPv6Schema, address).success) return "IPv6";

  return null;
}

export function buildServerInspection(request: Request): ServerInspection {
  const rawCloudflare = (request as unknown as { cf?: unknown }).cf;
  const cloudflare = v.parse(
    CloudflareSchema,
    typeof rawCloudflare === "object" && rawCloudflare !== null ? rawCloudflare : {},
  );
  const publicIpAddress = parseNullableString(request.headers.get("CF-Connecting-IP"));
  const headers = {} as ServerInspection["headers"];

  for (const header of ALLOWED_REQUEST_HEADERS) {
    headers[header] = parseNullableString(request.headers.get(header));
  }

  return {
    publicIp: {
      address: publicIpAddress,
      version: detectIpVersion(publicIpAddress),
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
    headers,
  };
}
