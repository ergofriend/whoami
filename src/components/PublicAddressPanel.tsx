"use client";

import { CopyButton } from "./CopyButton";
import { SketchCard } from "./Sketch";

type PublicAddressPanelProps = {
  ipv4: string | null;
  ipv6: string | null;
  pseudoIpv4?: string | null;
};

export function PublicAddressPanel({ ipv4, ipv6, pseudoIpv4 = null }: PublicAddressPanelProps) {
  const primaryIsIpv6 = ipv4 === null && ipv6 !== null;
  const primaryAddress = primaryIsIpv6
    ? { accessibleLabel: "Copy IPv6 address", label: "Your public IPv6 address", value: ipv6 }
    : { accessibleLabel: "Copy IPv4 address", label: "Your public IPv4 address", value: ipv4 };
  const secondaryAddress = primaryIsIpv6
    ? pseudoIpv4 !== null
      ? {
          accessibleLabel: "Copy pseudo IPv4",
          copyLabel: "Copy",
          label: "Cloudflare Pseudo IPv4",
          value: pseudoIpv4,
        }
      : {
          accessibleLabel: "Copy IPv4 address",
          copyLabel: "Copy",
          label: "Your IPv4 address",
          value: ipv4,
        }
    : {
        accessibleLabel: "Copy IPv6 address",
        copyLabel: "Copy",
        label: "Your IPv6 address",
        value: ipv6,
      };
  const showSecondaryAddress = secondaryAddress.value !== null;

  return (
    <SketchCard className="public-address-panel">
      <section aria-labelledby="public-ip-addresses">
        <h2 id="public-ip-addresses" className="visually-hidden">
          Public IP addresses
        </h2>
        <div
          className={`public-address-column public-address-column--primary${
            showSecondaryAddress ? "" : " public-address-column--single"
          }`}
        >
          <div className="public-address-main">
            <div className="address-heading-row">
              <p className="public-address-label">{primaryAddress.label}</p>
            </div>
            <div className="address-value-row">
              <p
                className={`public-address-value public-address-value--primary${
                  primaryAddress.value === null ? " public-address-value--unavailable" : ""
                }${primaryIsIpv6 ? " public-address-value--ipv6" : ""}`}
              >
                {primaryAddress.value ?? "Not available"}
              </p>
              <div className="primary-copy-target">
                <CopyButton
                  value={primaryAddress.value}
                  label="Copy"
                  accessibleLabel={primaryAddress.accessibleLabel}
                />
              </div>
            </div>
          </div>
          {!showSecondaryAddress ? (
            <div className="public-address-aside">
              <span className="public-address-note public-address-note--single" aria-hidden="true">
                visible to this site
              </span>
            </div>
          ) : null}
        </div>
        {showSecondaryAddress ? (
          <div className="public-address-column public-address-column--secondary public-address-column--single">
            <div className="public-address-main">
              <div className="address-heading-row">
                <p className="public-address-label">{secondaryAddress.label}</p>
              </div>
              <div className="address-value-row address-value-row--secondary">
                <p className="public-address-value public-address-value--secondary">
                  {secondaryAddress.value}
                </p>
                <CopyButton
                  value={secondaryAddress.value}
                  label={secondaryAddress.copyLabel}
                  accessibleLabel={secondaryAddress.accessibleLabel}
                  variant="outline"
                />
              </div>
            </div>
            <div className="public-address-aside">
              <span className="public-address-note" aria-hidden="true">
                ↖ visible to this site
              </span>
            </div>
          </div>
        ) : null}
      </section>
    </SketchCard>
  );
}
