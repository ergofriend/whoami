"use client";

import { useRef } from "react";

import { CopyButton } from "./CopyButton";
import { SketchArrow, SketchBadge, SketchCard, SketchCircle } from "./Sketch";

type PublicAddressPanelProps = {
  ipv4: string | null;
  ipv6: string | null;
};

export function PublicAddressPanel({ ipv4, ipv6 }: PublicAddressPanelProps) {
  const annotationRef = useRef<HTMLSpanElement>(null);
  const primaryCopyRef = useRef<HTMLDivElement>(null);

  return (
    <SketchCard className="public-address-panel">
      <section aria-labelledby="public-ip-addresses">
        <h2 id="public-ip-addresses" className="visually-hidden">
          Public IP addresses
        </h2>
        <SketchBadge className="privacy-badge" variant="outline">
          private by design
        </SketchBadge>
        <div className="public-address-column public-address-column--primary">
          <p className="public-address-label">Your public IPv4 address</p>
          <p className="public-address-value public-address-value--primary">
            {ipv4 ?? "Not available"}
          </p>
          <div ref={primaryCopyRef} className="primary-copy-target">
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
        </div>
        <span ref={annotationRef} className="copy-annotation" aria-hidden="true">
          <SketchCircle>not stored</SketchCircle>
        </span>
        <SketchArrow from={annotationRef} to={primaryCopyRef} />
      </section>
    </SketchCard>
  );
}
