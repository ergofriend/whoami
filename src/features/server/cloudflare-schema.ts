import * as v from "valibot";

export const NullableStringSchema = v.fallback(
  v.nullish(v.pipe(v.string(), v.nonEmpty()), null),
  null,
);
const NullableNumberSchema = v.fallback(v.nullish(v.pipe(v.number(), v.finite()), null), null);
export const CloudflareSchema = v.object({
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
