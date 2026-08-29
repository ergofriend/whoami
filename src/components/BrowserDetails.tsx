"use client";

import { useEffect, useState } from "react";

import {
  collectBrowserInspection,
  type BrowserInspection,
} from "../features/browser/browser-inspection";
import { KeyValueSection, type KeyValueItem } from "./KeyValueSection";

type BrowserDetailsProps = {
  collect?: () => BrowserInspection;
  groups?: readonly BrowserGroup[];
};

type BrowserGroup = "browser" | "device" | "preferences";

const allBrowserGroups: readonly BrowserGroup[] = ["browser", "device", "preferences"];

const browserLabels = [
  "User agent",
  "Browser languages",
  "Browser timezone",
  "UTC offset",
  "Cookies enabled",
  "Do Not Track",
  "Platform",
] as const;

const deviceLabels = [
  "Screen size",
  "Available screen size",
  "Viewport size",
  "Device pixel ratio",
  "Color depth",
  "Pixel depth",
  "Maximum touch points",
  "Logical processors",
  "Device memory",
] as const;

const preferenceLabels = [
  "Preferred color scheme",
  "Reduced motion",
  "Contrast preference",
  "Online",
  "Effective connection type",
  "Downlink",
  "Round-trip time",
  "Data saver",
] as const;

function unsupportedItems(labels: readonly string[]): KeyValueItem[] {
  return labels.map((label) => ({ label, value: "Not supported" }));
}

function readable(value: string | number | boolean | null | string[]): string {
  if (value === null) return "Not supported";
  if (Array.isArray(value)) return value.length === 0 ? "Not supported" : value.join(", ");
  if (typeof value === "boolean") return value ? "Yes" : "No";
  return value === "" ? "Not supported" : String(value);
}

function formatUtcOffset(minutes: number | null): string {
  if (minutes === null) return "Not supported";
  const absoluteMinutes = Math.abs(minutes);
  const hours = Math.floor(absoluteMinutes / 60);
  const remainingMinutes = absoluteMinutes % 60;
  const sign = minutes <= 0 ? "+" : "-";
  return `UTC${sign}${String(hours).padStart(2, "0")}:${String(remainingMinutes).padStart(2, "0")}`;
}

function formatMeasurement(value: number | null, unit: string): string {
  return value === null ? "Not supported" : `${value} ${unit}`;
}

function inspectionItems(inspection: BrowserInspection): {
  browser: KeyValueItem[];
  device: KeyValueItem[];
  preferences: KeyValueItem[];
} {
  return {
    browser: [
      { label: browserLabels[0], value: readable(inspection.browser.userAgent) },
      { label: browserLabels[1], value: readable(inspection.browser.languages) },
      { label: browserLabels[2], value: readable(inspection.browser.timezone) },
      { label: browserLabels[3], value: formatUtcOffset(inspection.browser.utcOffsetMinutes) },
      { label: browserLabels[4], value: readable(inspection.browser.cookiesEnabled) },
      { label: browserLabels[5], value: readable(inspection.browser.doNotTrack) },
      { label: browserLabels[6], value: readable(inspection.browser.platform) },
    ],
    device: [
      { label: deviceLabels[0], value: readable(inspection.device.screen) },
      { label: deviceLabels[1], value: readable(inspection.device.availableScreen) },
      { label: deviceLabels[2], value: readable(inspection.device.viewport) },
      { label: deviceLabels[3], value: readable(inspection.device.devicePixelRatio) },
      { label: deviceLabels[4], value: readable(inspection.device.colorDepth) },
      { label: deviceLabels[5], value: readable(inspection.device.pixelDepth) },
      { label: deviceLabels[6], value: readable(inspection.device.maxTouchPoints) },
      { label: deviceLabels[7], value: readable(inspection.device.logicalProcessors) },
      {
        label: deviceLabels[8],
        value: formatMeasurement(inspection.device.deviceMemoryGiB, "GiB"),
      },
    ],
    preferences: [
      { label: preferenceLabels[0], value: readable(inspection.preferences.colorScheme) },
      { label: preferenceLabels[1], value: readable(inspection.preferences.reducedMotion) },
      { label: preferenceLabels[2], value: readable(inspection.preferences.contrast) },
      { label: preferenceLabels[3], value: readable(inspection.preferences.online) },
      {
        label: preferenceLabels[4],
        value: readable(inspection.preferences.effectiveConnectionType),
      },
      {
        label: preferenceLabels[5],
        value: formatMeasurement(inspection.preferences.downlinkMbps, "Mbps"),
      },
      {
        label: preferenceLabels[6],
        value: formatMeasurement(inspection.preferences.rttMs, "ms"),
      },
      { label: preferenceLabels[7], value: readable(inspection.preferences.saveData) },
    ],
  };
}

export function BrowserDetails({
  collect = collectBrowserInspection,
  groups = allBrowserGroups,
}: BrowserDetailsProps) {
  const [inspection, setInspection] = useState<BrowserInspection | null>(null);

  useEffect(() => {
    setInspection(collect());
  }, [collect]);

  const items = inspection
    ? inspectionItems(inspection)
    : {
        browser: unsupportedItems(browserLabels),
        device: unsupportedItems(deviceLabels),
        preferences: unsupportedItems(preferenceLabels),
      };

  return (
    <>
      {groups.includes("browser") && <KeyValueSection title="Browser" items={items.browser} />}
      {groups.includes("device") && (
        <KeyValueSection title="Device and screen" items={items.device} />
      )}
      {groups.includes("preferences") && (
        <KeyValueSection title="Preferences and capabilities" items={items.preferences} />
      )}
    </>
  );
}
