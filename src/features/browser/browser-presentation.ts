import type { BrowserGroup, BrowserInspection } from "./types";

type BrowserField = {
  label: string;
  read: (inspection: BrowserInspection) => string;
};

export const browserSections = [
  { group: "browser", title: "Browser" },
  { group: "device", title: "Device and screen" },
  { group: "preferences", title: "Preferences and capabilities" },
] as const satisfies readonly { group: BrowserGroup; title: string }[];

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

const fields: Record<BrowserGroup, readonly BrowserField[]> = {
  browser: [
    { label: "User agent", read: (inspection) => readable(inspection.browser.userAgent) },
    { label: "Browser languages", read: (inspection) => readable(inspection.browser.languages) },
    { label: "Browser timezone", read: (inspection) => readable(inspection.browser.timezone) },
    {
      label: "UTC offset",
      read: (inspection) => formatUtcOffset(inspection.browser.utcOffsetMinutes),
    },
    { label: "Cookies enabled", read: (inspection) => readable(inspection.browser.cookiesEnabled) },
    { label: "Do Not Track", read: (inspection) => readable(inspection.browser.doNotTrack) },
    { label: "Platform", read: (inspection) => readable(inspection.browser.platform) },
  ],
  device: [
    { label: "Screen size", read: (inspection) => readable(inspection.device.screen) },
    {
      label: "Available screen size",
      read: (inspection) => readable(inspection.device.availableScreen),
    },
    { label: "Viewport size", read: (inspection) => readable(inspection.device.viewport) },
    {
      label: "Device pixel ratio",
      read: (inspection) => readable(inspection.device.devicePixelRatio),
    },
    { label: "Color depth", read: (inspection) => readable(inspection.device.colorDepth) },
    { label: "Pixel depth", read: (inspection) => readable(inspection.device.pixelDepth) },
    {
      label: "Maximum touch points",
      read: (inspection) => readable(inspection.device.maxTouchPoints),
    },
    {
      label: "Logical processors",
      read: (inspection) => readable(inspection.device.logicalProcessors),
    },
    {
      label: "Device memory",
      read: (inspection) => formatMeasurement(inspection.device.deviceMemoryGiB, "GiB"),
    },
  ],
  preferences: [
    {
      label: "Preferred color scheme",
      read: (inspection) => readable(inspection.preferences.colorScheme),
    },
    {
      label: "Reduced motion",
      read: (inspection) => readable(inspection.preferences.reducedMotion),
    },
    {
      label: "Contrast preference",
      read: (inspection) => readable(inspection.preferences.contrast),
    },
    { label: "Online", read: (inspection) => readable(inspection.preferences.online) },
    {
      label: "Effective connection type",
      read: (inspection) => readable(inspection.preferences.effectiveConnectionType),
    },
    {
      label: "Downlink",
      read: (inspection) => formatMeasurement(inspection.preferences.downlinkMbps, "Mbps"),
    },
    {
      label: "Round-trip time",
      read: (inspection) => formatMeasurement(inspection.preferences.rttMs, "ms"),
    },
    { label: "Data saver", read: (inspection) => readable(inspection.preferences.saveData) },
  ],
};

export function browserInspectionItems(group: BrowserGroup, inspection: BrowserInspection | null) {
  return fields[group].map(({ label, read }) => ({
    label,
    value: inspection === null ? "Not supported" : read(inspection),
  }));
}
