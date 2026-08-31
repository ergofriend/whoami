import type { ReactNode } from "react";

import type { ServerInspection } from "../features/server/server-inspection";
import { CopyButton } from "./CopyButton";
import { KeyValueSection } from "./KeyValueSection";
import { SketchUnderline } from "./Sketch";

type ServerDetailsProps = {
  inspection: ServerInspection;
  browserDetails: ReactNode;
  extendedBrowserDetails?: ReactNode;
};

export function ServerDetails({
  inspection,
  browserDetails,
  extendedBrowserDetails,
}: ServerDetailsProps) {
  const requestHeaderItems = Object.entries(inspection.headers).map(([label, value]) => ({
    label,
    value,
  }));

  return (
    <>
      <KeyValueSection
        title="Network"
        items={[
          {
            label: "IPv4 address",
            value: inspection.publicIp.ipv4,
            action: (
              <CopyButton
                value={inspection.publicIp.ipv4}
                label="Copy"
                accessibleLabel="Copy IPv4 address"
              />
            ),
          },
          {
            label: "IPv6 address",
            value: inspection.publicIp.ipv6,
            action: (
              <CopyButton
                value={inspection.publicIp.ipv6}
                label="Copy"
                accessibleLabel="Copy IPv6 address"
              />
            ),
          },
          ...(inspection.publicIp.pseudoIpv4 === null
            ? []
            : [
                {
                  label: "Pseudo IPv4",
                  value: inspection.publicIp.pseudoIpv4,
                  action: (
                    <CopyButton
                      value={inspection.publicIp.pseudoIpv4}
                      label="Copy"
                      accessibleLabel="Copy pseudo IPv4"
                    />
                  ),
                },
              ]),
          { label: "ASN", value: inspection.network.asn },
          { label: "Organization", value: inspection.network.organization },
        ]}
      />

      <KeyValueSection
        title="Approximate location"
        description="Approximate location derived from your public IP address."
        items={[
          { label: "Continent", value: inspection.location.continent },
          { label: "Country", value: inspection.location.country },
          { label: "Region", value: inspection.location.region },
          { label: "Region code", value: inspection.location.regionCode },
          { label: "City", value: inspection.location.city },
          { label: "Postal code", value: inspection.location.postalCode },
          { label: "Metro code", value: inspection.location.metroCode },
          { label: "Latitude", value: inspection.location.latitude },
          { label: "Longitude", value: inspection.location.longitude },
          { label: "Timezone", value: inspection.location.timezone },
        ]}
      />

      {browserDetails}

      <details className="more-details">
        <summary className="sketch-heading">
          <SketchUnderline>More details</SketchUnderline>
        </summary>
        <div className="information-stack details-stack">
          <KeyValueSection
            title="Connection"
            items={[
              { label: "HTTP protocol", value: inspection.connection.httpProtocol },
              { label: "Request priority", value: inspection.connection.requestPriority },
              { label: "Accepted encodings", value: inspection.connection.clientAcceptEncoding },
              { label: "TCP RTT (ms)", value: inspection.connection.tcpRttMs },
              { label: "QUIC RTT (ms)", value: inspection.connection.quicRttMs },
            ]}
          />

          <KeyValueSection
            title="TLS"
            items={[
              { label: "Version", value: inspection.tls.version },
              { label: "Cipher", value: inspection.tls.cipher },
              { label: "ClientHello length", value: inspection.tls.clientHelloLength },
            ]}
          />

          <KeyValueSection
            title="Cloudflare"
            items={[{ label: "Data center", value: inspection.cloudflare.colo }]}
          />

          {extendedBrowserDetails}

          <KeyValueSection title="Request headers" items={requestHeaderItems} />
        </div>
      </details>
    </>
  );
}
