export const ALLOWED_REQUEST_HEADERS = [
  'Accept',
  'Accept-Encoding',
  'Accept-Language',
  'CF-Connecting-IP',
  'CF-IPCountry',
  'CF-Ray',
  'Host',
  'Sec-CH-UA',
  'Sec-CH-UA-Mobile',
  'Sec-CH-UA-Platform',
  'Upgrade-Insecure-Requests',
  'User-Agent',
  'X-Forwarded-Proto',
] as const;

type Nullable<T> = T | null;
type AllowedHeader = (typeof ALLOWED_REQUEST_HEADERS)[number];

export type ServerInspection = {
  schemaVersion: 1;
  publicIp: { address: Nullable<string>; version: Nullable<'IPv4' | 'IPv6'> };
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
  cloudflare: { colo: Nullable<string>; rayId: Nullable<string> };
  headers: Record<AllowedHeader, Nullable<string>>;
};

type CloudflareRequestProperties = Partial<{
  asn: number;
  asOrganization: string;
  continent: string;
  country: string;
  region: string;
  regionCode: string;
  city: string;
  postalCode: string;
  metroCode: string;
  latitude: string;
  longitude: string;
  timezone: string;
  httpProtocol: string;
  requestPriority: string;
  clientAcceptEncoding: string;
  clientTcpRtt: number;
  clientQuicRtt: number;
  tlsVersion: string;
  tlsCipher: string;
  tlsClientHelloLength: string;
  colo: string;
}>;

function nullableString(value: unknown): Nullable<string> {
  return typeof value === 'string' && value.length > 0 ? value : null;
}

function nullableNumber(value: unknown): Nullable<number> {
  return typeof value === 'number' && Number.isFinite(value) ? value : null;
}

export function detectIpVersion(address: string | null): 'IPv4' | 'IPv6' | null {
  if (address === null) {
    return null;
  }

  if (/^(?:\d{1,3}\.){3}\d{1,3}$/.test(address)) {
    const octets = address.split('.');
    if (octets.every((octet) => Number(octet) <= 255)) {
      return 'IPv4';
    }
  }

  if (address.includes(':') && /^[0-9a-fA-F:.]+$/.test(address)) {
    return 'IPv6';
  }

  return null;
}

export function buildServerInspection(request: Request): ServerInspection {
  const cloudflare = (request as unknown as { cf?: CloudflareRequestProperties }).cf;
  const publicIpAddress = nullableString(request.headers.get('CF-Connecting-IP'));
  const headers = {} as ServerInspection['headers'];

  for (const header of ALLOWED_REQUEST_HEADERS) {
    headers[header] = nullableString(request.headers.get(header));
  }

  return {
    schemaVersion: 1,
    publicIp: {
      address: publicIpAddress,
      version: detectIpVersion(publicIpAddress),
    },
    network: {
      asn: nullableNumber(cloudflare?.asn),
      organization: nullableString(cloudflare?.asOrganization),
    },
    location: {
      continent: nullableString(cloudflare?.continent),
      country: nullableString(cloudflare?.country),
      region: nullableString(cloudflare?.region),
      regionCode: nullableString(cloudflare?.regionCode),
      city: nullableString(cloudflare?.city),
      postalCode: nullableString(cloudflare?.postalCode),
      metroCode: nullableString(cloudflare?.metroCode),
      latitude: nullableString(cloudflare?.latitude),
      longitude: nullableString(cloudflare?.longitude),
      timezone: nullableString(cloudflare?.timezone),
    },
    connection: {
      httpProtocol: nullableString(cloudflare?.httpProtocol),
      requestPriority: nullableString(cloudflare?.requestPriority),
      clientAcceptEncoding: nullableString(cloudflare?.clientAcceptEncoding),
      tcpRttMs: nullableNumber(cloudflare?.clientTcpRtt),
      quicRttMs: nullableNumber(cloudflare?.clientQuicRtt),
    },
    tls: {
      version: nullableString(cloudflare?.tlsVersion),
      cipher: nullableString(cloudflare?.tlsCipher),
      clientHelloLength: nullableString(cloudflare?.tlsClientHelloLength),
    },
    cloudflare: {
      colo: nullableString(cloudflare?.colo),
      rayId: nullableString(request.headers.get('CF-Ray')),
    },
    headers,
  };
}
