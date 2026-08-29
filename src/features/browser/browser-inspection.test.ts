import { describe, expect, it } from 'vitest';

import {
  collectBrowserInspection,
  type BrowserInspection,
  type BrowserSource,
} from './browser-inspection';

function createCompleteSource(): BrowserSource {
  return {
    userAgent: () => 'Example Browser',
    languages: () => ['en-US', 'en'],
    timezone: () => 'Asia/Tokyo',
    utcOffsetMinutes: () => -540,
    cookiesEnabled: () => true,
    doNotTrack: () => '1',
    platform: () => 'Win32',
    screenWidth: () => 1920,
    screenHeight: () => 1080,
    availableScreenWidth: () => 1920,
    availableScreenHeight: () => 1040,
    viewportWidth: () => 1280,
    viewportHeight: () => 720,
    devicePixelRatio: () => 1.5,
    colorDepth: () => 24,
    pixelDepth: () => 24,
    maxTouchPoints: () => 0,
    logicalProcessors: () => 8,
    deviceMemoryGiB: () => 8,
    colorScheme: () => 'dark',
    reducedMotion: () => true,
    contrast: () => null,
    online: () => true,
    effectiveConnectionType: () => '4g',
    downlinkMbps: () => 10,
    rttMs: () => 50,
    saveData: () => false,
  };
}

const failingGetterCases: ReadonlyArray<
  readonly [string, keyof BrowserSource, (result: BrowserInspection) => unknown]
> = [
  ['user agent', 'userAgent', (result) => result.browser.userAgent],
  ['languages', 'languages', (result) => result.browser.languages],
  ['timezone', 'timezone', (result) => result.browser.timezone],
  ['UTC offset', 'utcOffsetMinutes', (result) => result.browser.utcOffsetMinutes],
  ['cookies', 'cookiesEnabled', (result) => result.browser.cookiesEnabled],
  ['Do Not Track', 'doNotTrack', (result) => result.browser.doNotTrack],
  ['platform', 'platform', (result) => result.browser.platform],
  ['screen width', 'screenWidth', (result) => result.device.screen],
  ['screen height', 'screenHeight', (result) => result.device.screen],
  ['available screen width', 'availableScreenWidth', (result) => result.device.availableScreen],
  ['available screen height', 'availableScreenHeight', (result) => result.device.availableScreen],
  ['viewport width', 'viewportWidth', (result) => result.device.viewport],
  ['viewport height', 'viewportHeight', (result) => result.device.viewport],
  ['device pixel ratio', 'devicePixelRatio', (result) => result.device.devicePixelRatio],
  ['color depth', 'colorDepth', (result) => result.device.colorDepth],
  ['pixel depth', 'pixelDepth', (result) => result.device.pixelDepth],
  ['maximum touch points', 'maxTouchPoints', (result) => result.device.maxTouchPoints],
  ['logical processors', 'logicalProcessors', (result) => result.device.logicalProcessors],
  ['device memory', 'deviceMemoryGiB', (result) => result.device.deviceMemoryGiB],
  ['color scheme', 'colorScheme', (result) => result.preferences.colorScheme],
  ['reduced motion', 'reducedMotion', (result) => result.preferences.reducedMotion],
  ['contrast', 'contrast', (result) => result.preferences.contrast],
  ['online state', 'online', (result) => result.preferences.online],
  [
    'effective connection type',
    'effectiveConnectionType',
    (result) => result.preferences.effectiveConnectionType,
  ],
  ['downlink', 'downlinkMbps', (result) => result.preferences.downlinkMbps],
  ['round-trip time', 'rttMs', (result) => result.preferences.rttMs],
  ['data saver', 'saveData', (result) => result.preferences.saveData],
];

describe('collectBrowserInspection', () => {
  it('collects the documented ordinary browser details into the stable schema', () => {
    expect(collectBrowserInspection(createCompleteSource())).toEqual({
      browser: {
        userAgent: 'Example Browser',
        languages: ['en-US', 'en'],
        timezone: 'Asia/Tokyo',
        utcOffsetMinutes: -540,
        cookiesEnabled: true,
        doNotTrack: '1',
        platform: 'Win32',
      },
      device: {
        screen: '1920 × 1080',
        availableScreen: '1920 × 1040',
        viewport: '1280 × 720',
        devicePixelRatio: 1.5,
        colorDepth: 24,
        pixelDepth: 24,
        maxTouchPoints: 0,
        logicalProcessors: 8,
        deviceMemoryGiB: 8,
      },
      preferences: {
        colorScheme: 'dark',
        reducedMotion: true,
        contrast: null,
        online: true,
        effectiveConnectionType: '4g',
        downlinkMbps: 10,
        rttMs: 50,
        saveData: false,
      },
    });
  });

  it('uses documented fallbacks when media queries and Network Information are unavailable', () => {
    const source = createCompleteSource();
    source.colorScheme = () => null;
    source.reducedMotion = () => null;
    source.contrast = () => null;
    source.effectiveConnectionType = () => null;
    source.downlinkMbps = () => null;
    source.rttMs = () => null;
    source.saveData = () => null;

    const result = collectBrowserInspection(source);

    expect(result.preferences).toEqual({
      colorScheme: null,
      reducedMotion: null,
      contrast: null,
      online: true,
      effectiveConnectionType: null,
      downlinkMbps: null,
      rttMs: null,
      saveData: null,
    });
  });

  it.each(failingGetterCases)(
    'normalizes an independently failing %s getter without erasing other fields',
    (_name, key, readResult) => {
      const source = createCompleteSource();
      source[key] = (() => {
        throw new Error('unsupported');
      }) as never;

      const result = collectBrowserInspection(source);

      expect(readResult(result)).toBeNull();
      if (key === 'doNotTrack') {
        expect(result.browser.userAgent).toBe('Example Browser');
      } else {
        expect(result.browser.doNotTrack).toBe('1');
      }
    },
  );

  it('normalizes absent, wrong-type, and non-finite values without leaking invalid output', () => {
    const invalidSource = {
      ...createCompleteSource(),
      userAgent: () => undefined,
      languages: () => ['en-US', 42],
      timezone: () => 9,
      utcOffsetMinutes: () => Number.NaN,
      cookiesEnabled: () => 'yes',
      doNotTrack: () => false,
      platform: () => [],
      screenWidth: () => Number.POSITIVE_INFINITY,
      screenHeight: () => 1080,
      availableScreenWidth: () => undefined,
      availableScreenHeight: () => 1040,
      viewportWidth: () => 1280,
      viewportHeight: () => Number.NEGATIVE_INFINITY,
      devicePixelRatio: () => Number.NaN,
      colorDepth: () => '24',
      pixelDepth: () => undefined,
      maxTouchPoints: () => Number.POSITIVE_INFINITY,
      logicalProcessors: () => Number.NaN,
      deviceMemoryGiB: () => '8',
      colorScheme: () => 'sepia',
      reducedMotion: () => 0,
      contrast: () => 'custom',
      online: () => undefined,
      effectiveConnectionType: () => 4,
      downlinkMbps: () => Number.NEGATIVE_INFINITY,
      rttMs: () => Number.NaN,
      saveData: () => 'false',
    } as unknown as BrowserSource;

    expect(collectBrowserInspection(invalidSource)).toEqual({
      browser: {
        userAgent: null,
        languages: null,
        timezone: null,
        utcOffsetMinutes: null,
        cookiesEnabled: null,
        doNotTrack: null,
        platform: null,
      },
      device: {
        screen: null,
        availableScreen: null,
        viewport: null,
        devicePixelRatio: null,
        colorDepth: null,
        pixelDepth: null,
        maxTouchPoints: null,
        logicalProcessors: null,
        deviceMemoryGiB: null,
      },
      preferences: {
        colorScheme: null,
        reducedMotion: null,
        contrast: null,
        online: null,
        effectiveConnectionType: null,
        downlinkMbps: null,
        rttMs: null,
        saveData: null,
      },
    });
  });
});
