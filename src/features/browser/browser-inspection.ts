type Nullable<T> = T | null;

export type BrowserInspection = {
  browser: {
    userAgent: string;
    languages: string[];
    timezone: Nullable<string>;
    utcOffsetMinutes: number;
    cookiesEnabled: boolean;
    doNotTrack: Nullable<string>;
    platform: Nullable<string>;
  };
  device: {
    screen: string;
    availableScreen: string;
    viewport: string;
    devicePixelRatio: number;
    colorDepth: number;
    pixelDepth: number;
    maxTouchPoints: number;
    logicalProcessors: Nullable<number>;
    deviceMemoryGiB: Nullable<number>;
  };
  preferences: {
    colorScheme: Nullable<'light' | 'dark'>;
    reducedMotion: Nullable<boolean>;
    contrast: Nullable<'more' | 'less'>;
    online: boolean;
    effectiveConnectionType: Nullable<string>;
    downlinkMbps: Nullable<number>;
    rttMs: Nullable<number>;
    saveData: Nullable<boolean>;
  };
};

export type BrowserSource = {
  userAgent: () => string;
  languages: () => string[];
  timezone: () => Nullable<string>;
  utcOffsetMinutes: () => number;
  cookiesEnabled: () => boolean;
  doNotTrack: () => Nullable<string>;
  platform: () => Nullable<string>;
  screenWidth: () => Nullable<number>;
  screenHeight: () => Nullable<number>;
  availableScreenWidth: () => Nullable<number>;
  availableScreenHeight: () => Nullable<number>;
  viewportWidth: () => Nullable<number>;
  viewportHeight: () => Nullable<number>;
  devicePixelRatio: () => number;
  colorDepth: () => number;
  pixelDepth: () => number;
  maxTouchPoints: () => number;
  logicalProcessors: () => Nullable<number>;
  deviceMemoryGiB: () => Nullable<number>;
  colorScheme: () => Nullable<'light' | 'dark'>;
  reducedMotion: () => Nullable<boolean>;
  contrast: () => Nullable<'more' | 'less'>;
  online: () => boolean;
  effectiveConnectionType: () => Nullable<string>;
  downlinkMbps: () => Nullable<number>;
  rttMs: () => Nullable<number>;
  saveData: () => Nullable<boolean>;
};

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

export function createBrowserSource(): BrowserSource {
  const browserNavigator = navigator as NavigatorExtensions;

  return {
    userAgent: () => browserNavigator.userAgent,
    languages: () => [...browserNavigator.languages],
    timezone: () => Intl.DateTimeFormat().resolvedOptions().timeZone ?? null,
    utcOffsetMinutes: () => new Date().getTimezoneOffset(),
    cookiesEnabled: () => browserNavigator.cookieEnabled,
    doNotTrack: () => browserNavigator.doNotTrack ?? null,
    platform: () => browserNavigator.platform ?? null,
    screenWidth: () => window.screen.width,
    screenHeight: () => window.screen.height,
    availableScreenWidth: () => window.screen.availWidth,
    availableScreenHeight: () => window.screen.availHeight,
    viewportWidth: () => window.innerWidth,
    viewportHeight: () => window.innerHeight,
    devicePixelRatio: () => window.devicePixelRatio,
    colorDepth: () => window.screen.colorDepth,
    pixelDepth: () => window.screen.pixelDepth,
    maxTouchPoints: () => browserNavigator.maxTouchPoints,
    logicalProcessors: () => browserNavigator.hardwareConcurrency ?? null,
    deviceMemoryGiB: () => browserNavigator.deviceMemory ?? null,
    colorScheme: () => (readMediaQuery('(prefers-color-scheme: dark)') ? 'dark' : 'light'),
    reducedMotion: () => readMediaQuery('(prefers-reduced-motion: reduce)'),
    contrast: () => {
      if (readMediaQuery('(prefers-contrast: more)')) return 'more';
      return readMediaQuery('(prefers-contrast: less)') ? 'less' : null;
    },
    online: () => browserNavigator.onLine,
    effectiveConnectionType: () => browserNavigator.connection?.effectiveType ?? null,
    downlinkMbps: () => browserNavigator.connection?.downlink ?? null,
    rttMs: () => browserNavigator.connection?.rtt ?? null,
    saveData: () => browserNavigator.connection?.saveData ?? null,
  };
}

function safe<T>(read: () => T, fallback: T): T {
  try {
    return read();
  } catch {
    return fallback;
  }
}

function formatSize(width: Nullable<number>, height: Nullable<number>): string {
  return typeof width === 'number' && typeof height === 'number'
    ? `${width} × ${height}`
    : 'Not supported';
}

export function collectBrowserInspection(source = createBrowserSource()): BrowserInspection {
  return {
    browser: {
      userAgent: safe(source.userAgent, ''),
      languages: safe(source.languages, []),
      timezone: safe(source.timezone, null),
      utcOffsetMinutes: safe(source.utcOffsetMinutes, 0),
      cookiesEnabled: safe(source.cookiesEnabled, false),
      doNotTrack: safe(source.doNotTrack, null),
      platform: safe(source.platform, null),
    },
    device: {
      screen: formatSize(safe(source.screenWidth, null), safe(source.screenHeight, null)),
      availableScreen: formatSize(
        safe(source.availableScreenWidth, null),
        safe(source.availableScreenHeight, null),
      ),
      viewport: formatSize(safe(source.viewportWidth, null), safe(source.viewportHeight, null)),
      devicePixelRatio: safe(source.devicePixelRatio, 1),
      colorDepth: safe(source.colorDepth, 0),
      pixelDepth: safe(source.pixelDepth, 0),
      maxTouchPoints: safe(source.maxTouchPoints, 0),
      logicalProcessors: safe(source.logicalProcessors, null),
      deviceMemoryGiB: safe(source.deviceMemoryGiB, null),
    },
    preferences: {
      colorScheme: safe(source.colorScheme, null),
      reducedMotion: safe(source.reducedMotion, null),
      contrast: safe(source.contrast, null),
      online: safe(source.online, true),
      effectiveConnectionType: safe(source.effectiveConnectionType, null),
      downlinkMbps: safe(source.downlinkMbps, null),
      rttMs: safe(source.rttMs, null),
      saveData: safe(source.saveData, null),
    },
  };
}
