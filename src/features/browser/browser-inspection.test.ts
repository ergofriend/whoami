import { describe, expect, it } from 'vitest';

import { collectBrowserInspection, type BrowserSource } from './browser-inspection';

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
});
