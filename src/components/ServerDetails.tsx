import type { ReactNode } from "react";

import type { ServerInspection } from "../features/server/server-inspection";
import { DoodleIcon } from "./DoodleIcon";
import { KeyValueSection } from "./KeyValueSection";
import { PublicAddressPanel } from "./PublicAddressPanel";
import { SketchBadge, SketchUnderline } from "./Sketch";

type ServerDetailsProps = {
  inspection: ServerInspection;
  browserDetails: ReactNode;
  deviceDetails?: ReactNode;
  preferenceDetails?: ReactNode;
};

export function ServerDetails({
  inspection,
  browserDetails,
  deviceDetails,
  preferenceDetails,
}: ServerDetailsProps) {
  const requestHeaderItems = Object.entries(inspection.headers).map(([label, value]) => ({
    label,
    value,
  }));

  return (
    <>
      <section className="connection-overview" aria-label="Connection summary">
        <PublicAddressPanel
          ipv4={inspection.publicIp.ipv4}
          ipv6={inspection.publicIp.ipv6}
          pseudoIpv4={inspection.publicIp.pseudoIpv4}
        />
      </section>
      <div className="summary-layout">
        <section className="network-summary" aria-labelledby="network-heading">
          <h2 id="network-heading" className="sketch-heading network-heading">
            Network
            <DoodleIcon kind="globe" />
          </h2>
          <dl>
            <div>
              <dt>ASN</dt>
              <dd>{inspection.network.asn ?? "Not available"}</dd>
            </div>
            <div>
              <dt>Organization</dt>
              <dd>{inspection.network.organization ?? "Not available"}</dd>
            </div>
          </dl>
        </section>
        <KeyValueSection
          className="location-summary"
          icon="location"
          title="Approximate Location"
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
        >
          <SketchBadge className="approximation-badge" variant="outline">
            IP-derived · approximate
          </SketchBadge>
        </KeyValueSection>
        <div className="browser-summary">{browserDetails}</div>
      </div>

      <details className="more-details">
        <summary className="sketch-heading">
          <SketchUnderline>More technical details</SketchUnderline>
        </summary>
        <div className="details-stack">
          <div className="details-column details-column--server">
            <KeyValueSection
              headingVariant="technical"
              title="Connection"
              items={[
                { label: "HTTP protocol", value: inspection.connection.httpProtocol },
                { label: "Request priority", value: inspection.connection.requestPriority },
                {
                  label: "Accepted encodings",
                  value: inspection.connection.clientAcceptEncoding,
                },
                { label: "TCP RTT (ms)", value: inspection.connection.tcpRttMs },
                { label: "QUIC RTT (ms)", value: inspection.connection.quicRttMs },
              ]}
            />

            {deviceDetails}
          </div>

          <div className="details-column details-column--client">
            <KeyValueSection
              headingVariant="technical"
              title="TLS"
              items={[
                { label: "Version", value: inspection.tls.version },
                { label: "Cipher", value: inspection.tls.cipher },
                { label: "ClientHello length", value: inspection.tls.clientHelloLength },
              ]}
            />

            <KeyValueSection
              headingVariant="technical"
              title="Cloudflare"
              items={[{ label: "Data center", value: inspection.cloudflare.colo }]}
            />

            {preferenceDetails}
          </div>

          <KeyValueSection
            className="request-headers-section"
            headingVariant="technical"
            title="Request headers"
            items={requestHeaderItems}
          />
        </div>
      </details>
    </>
  );
}
