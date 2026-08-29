type Nullable<T> = T | null;

export type BrowserInspection = {
  browser: {
    userAgent: Nullable<string>;
    languages: Nullable<string[]>;
    timezone: Nullable<string>;
    utcOffsetMinutes: Nullable<number>;
    cookiesEnabled: Nullable<boolean>;
    doNotTrack: Nullable<string>;
    platform: Nullable<string>;
  };
  device: {
    screen: Nullable<string>;
    availableScreen: Nullable<string>;
    viewport: Nullable<string>;
    devicePixelRatio: Nullable<number>;
    colorDepth: Nullable<number>;
    pixelDepth: Nullable<number>;
    maxTouchPoints: Nullable<number>;
    logicalProcessors: Nullable<number>;
    deviceMemoryGiB: Nullable<number>;
  };
  preferences: {
    colorScheme: Nullable<'light' | 'dark'>;
    reducedMotion: Nullable<boolean>;
    contrast: Nullable<'more' | 'less'>;
    online: Nullable<boolean>;
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
  return typeof value === 'boolean';
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value);
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

function isLanguageList(value: unknown): value is string[] {
  return Array.isArray(value) && value.length > 0 && value.every(isNonEmptyString);
}

function isColorScheme(value: unknown): value is 'light' | 'dark' {
  return value === 'light' || value === 'dark';
}

function isContrast(value: unknown): value is 'more' | 'less' {
  return value === 'more' || value === 'less';
}

function formatSize(width: Nullable<number>, height: Nullable<number>): Nullable<string> {
  return typeof width === 'number' && typeof height === 'number'
    ? `${width} × ${height}`
    : null;
}

export function collectBrowserInspection(source = createBrowserSource()): BrowserInspection {
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
      effectiveConnectionType: readSupported(
        source.effectiveConnectionType,
        isNonEmptyString,
      ),
      downlinkMbps: readSupported(source.downlinkMbps, isFiniteNumber),
      rttMs: readSupported(source.rttMs, isFiniteNumber),
      saveData: readSupported(source.saveData, isBoolean),
    },
  };
}
