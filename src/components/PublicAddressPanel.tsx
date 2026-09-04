"use client";

import { CopyButton } from "./CopyButton";
import { SketchBadge, SketchCard } from "./Sketch";

type PublicAddressPanelProps = {
  ipv4: string | null;
  ipv6: string | null;
  pseudoIpv4?: string | null;
};

export function PublicAddressPanel({ ipv4, ipv6, pseudoIpv4 = null }: PublicAddressPanelProps) {
  return (
    <SketchCard className="public-address-panel">
      <section aria-labelledby="public-ip-addresses">
        <h2 id="public-ip-addresses" className="visually-hidden">
          Public IP addresses
        </h2>
        <div className="address-card-meta">
          <SketchBadge className="privacy-badge" variant="outline">
            <span className="privacy-sparkle" aria-hidden="true" />
            private by design
          </SketchBadge>
        </div>
        <div className="public-address-column public-address-column--primary">
          <p className="public-address-label">Your public IPv4 address</p>
          <p className="public-address-value public-address-value--primary">
            {ipv4 ?? "Not available"}
          </p>
          <div className="primary-copy-target">
            <CopyButton value={ipv4} label="Copy IPv4" accessibleLabel="Copy IPv4 address" />
          </div>
        </div>
        <div className="public-address-column public-address-column--secondary">
          <p className="public-address-label">Your IPv6 address</p>
          <p className="public-address-value public-address-value--secondary">
            {ipv6 ?? "Not available"}
          </p>
          <CopyButton
            value={ipv6}
            label="Copy IPv6"
            accessibleLabel="Copy IPv6 address"
            variant="outline"
          />
          {pseudoIpv4 === null ? null : (
            <div className="pseudo-address">
              <div>
                <p className="public-address-label">Pseudo IPv4</p>
                <p className="public-address-value public-address-value--pseudo">{pseudoIpv4}</p>
              </div>
              <CopyButton
                value={pseudoIpv4}
                label="Copy"
                accessibleLabel="Copy pseudo IPv4"
                variant="outline"
              />
            </div>
          )}
        </div>
      </section>
    </SketchCard>
  );
}
