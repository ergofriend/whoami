import { createBrowserSource } from "./browser-source";

export { createBrowserSource } from "./browser-source";
export type { BrowserInspection, BrowserSource } from "./types";

type Nullable<T> = T | null;

type Guard<T> = (value: unknown) => value is T;

function readSupported<T>(read: () => unknown, guard: Guard<T>): Nullable<T> {
  try {
    const value = read();
    return guard(value) ? value : null;
  } catch {
    return null;
  }
}

function isBoolean(value: unknown): value is boolean {
  return typeof value === "boolean";
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function isLanguageList(value: unknown): value is string[] {
  return Array.isArray(value) && value.length > 0 && value.every(isNonEmptyString);
}

function isColorScheme(value: unknown): value is "light" | "dark" {
  return value === "light" || value === "dark";
}

function isContrast(value: unknown): value is "more" | "less" {
  return value === "more" || value === "less";
}

function formatSize(width: Nullable<number>, height: Nullable<number>): Nullable<string> {
  return typeof width === "number" && typeof height === "number" ? `${width} × ${height}` : null;
}

export function collectBrowserInspection(source = createBrowserSource()) {
  return {
    browser: {
      userAgent: readSupported(source.userAgent, isNonEmptyString),
      languages: readSupported(source.languages, isLanguageList),
      timezone: readSupported(source.timezone, isNonEmptyString),
      utcOffsetMinutes: readSupported(source.utcOffsetMinutes, isFiniteNumber),
      cookiesEnabled: readSupported(source.cookiesEnabled, isBoolean),
      doNotTrack: readSupported(source.doNotTrack, isNonEmptyString),
      platform: readSupported(source.platform, isNonEmptyString),
    },
    device: {
      screen: formatSize(
        readSupported(source.screenWidth, isFiniteNumber),
        readSupported(source.screenHeight, isFiniteNumber),
      ),
      availableScreen: formatSize(
        readSupported(source.availableScreenWidth, isFiniteNumber),
        readSupported(source.availableScreenHeight, isFiniteNumber),
      ),
      viewport: formatSize(
        readSupported(source.viewportWidth, isFiniteNumber),
        readSupported(source.viewportHeight, isFiniteNumber),
      ),
      devicePixelRatio: readSupported(source.devicePixelRatio, isFiniteNumber),
      colorDepth: readSupported(source.colorDepth, isFiniteNumber),
      pixelDepth: readSupported(source.pixelDepth, isFiniteNumber),
      maxTouchPoints: readSupported(source.maxTouchPoints, isFiniteNumber),
      logicalProcessors: readSupported(source.logicalProcessors, isFiniteNumber),
      deviceMemoryGiB: readSupported(source.deviceMemoryGiB, isFiniteNumber),
    },
    preferences: {
      colorScheme: readSupported(source.colorScheme, isColorScheme),
      reducedMotion: readSupported(source.reducedMotion, isBoolean),
      contrast: readSupported(source.contrast, isContrast),
      online: readSupported(source.online, isBoolean),
      effectiveConnectionType: readSupported(source.effectiveConnectionType, isNonEmptyString),
      downlinkMbps: readSupported(source.downlinkMbps, isFiniteNumber),
      rttMs: readSupported(source.rttMs, isFiniteNumber),
      saveData: readSupported(source.saveData, isBoolean),
    },
  };
}
