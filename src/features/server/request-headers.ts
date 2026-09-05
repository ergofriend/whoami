import * as v from "valibot";

import { NullableStringSchema } from "./cloudflare-schema";

export const ALLOWED_REQUEST_HEADERS = [
  "Accept",
  "Accept-Encoding",
  "Accept-Language",
  "CF-Connecting-IP",
  "CF-Connecting-IPv6",
  "CF-IPCountry",
  "CF-Pseudo-IPv4",
  "Host",
  "Sec-CH-UA",
  "Sec-CH-UA-Mobile",
  "Sec-CH-UA-Platform",
  "Upgrade-Insecure-Requests",
  "User-Agent",
  "X-Forwarded-Proto",
] as const;

const RequestHeadersSchema = v.object(
  v.entriesFromList(ALLOWED_REQUEST_HEADERS, NullableStringSchema),
);

export type RequestHeaders = v.InferOutput<typeof RequestHeadersSchema>;

export function collectRequestHeaders(request: Request): RequestHeaders {
  return v.parse(
    RequestHeadersSchema,
    Object.fromEntries(
      ALLOWED_REQUEST_HEADERS.map((header) => [header, request.headers.get(header)]),
    ),
  );
}
