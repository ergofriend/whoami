type NavigatorExtensions = Navigator & {
  deviceMemory?: number;
  connection?: {
    effectiveType?: string;
    downlink?: number;
    rtt?: number;
    saveData?: boolean;
  };
};

function readMediaQuery(query: string): boolean {
  return window.matchMedia(query).matches;
}

export function createBrowserSource() {
  const browserNavigator = navigator as NavigatorExtensions;

  return {
    userAgent: () => browserNavigator.userAgent,
    languages: () => [...browserNavigator.languages],
    timezone: (): string | null => Intl.DateTimeFormat().resolvedOptions().timeZone ?? null,
    utcOffsetMinutes: () => new Date().getTimezoneOffset(),
    cookiesEnabled: () => browserNavigator.cookieEnabled,
    doNotTrack: (): string | null => browserNavigator.doNotTrack ?? null,
    platform: (): string | null => browserNavigator.platform ?? null,
    screenWidth: (): number | null => window.screen.width,
    screenHeight: (): number | null => window.screen.height,
    availableScreenWidth: (): number | null => window.screen.availWidth,
    availableScreenHeight: (): number | null => window.screen.availHeight,
    viewportWidth: (): number | null => window.innerWidth,
    viewportHeight: (): number | null => window.innerHeight,
    devicePixelRatio: () => window.devicePixelRatio,
    colorDepth: () => window.screen.colorDepth,
    pixelDepth: () => window.screen.pixelDepth,
    maxTouchPoints: () => browserNavigator.maxTouchPoints,
    logicalProcessors: (): number | null => browserNavigator.hardwareConcurrency ?? null,
    deviceMemoryGiB: (): number | null => browserNavigator.deviceMemory ?? null,
    colorScheme: (): "light" | "dark" | null =>
      readMediaQuery("(prefers-color-scheme: dark)") ? "dark" : "light",
    reducedMotion: (): boolean | null => readMediaQuery("(prefers-reduced-motion: reduce)"),
    contrast: (): "more" | "less" | null => {
      if (readMediaQuery("(prefers-contrast: more)")) return "more";
      return readMediaQuery("(prefers-contrast: less)") ? "less" : null;
    },
    online: () => browserNavigator.onLine,
    effectiveConnectionType: (): string | null =>
      browserNavigator.connection?.effectiveType ?? null,
    downlinkMbps: (): number | null => browserNavigator.connection?.downlink ?? null,
    rttMs: (): number | null => browserNavigator.connection?.rtt ?? null,
    saveData: (): boolean | null => browserNavigator.connection?.saveData ?? null,
  };
}
