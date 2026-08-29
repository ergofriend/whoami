// @vitest-environment jsdom

import { cleanup, render, screen, within } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import { BrowserDetails } from './BrowserDetails';
import type { BrowserInspection } from '../features/browser/browser-inspection';

const inspection: BrowserInspection = {
  browser: {
    userAgent: 'Example Browser',
    languages: ['en-US', 'en'],
    timezone: 'Asia/Tokyo',
    utcOffsetMinutes: -540,
    cookiesEnabled: true,
    doNotTrack: null,
    platform: 'Win32',
  },
  device: {
    screen: '1920 × 1080',
    availableScreen: 'Not supported',
    viewport: '1280 × 720',
    devicePixelRatio: 1.5,
    colorDepth: 24,
    pixelDepth: 24,
    maxTouchPoints: 0,
    logicalProcessors: 8,
    deviceMemoryGiB: null,
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
};

describe('BrowserDetails', () => {
  afterEach(cleanup);

  it('renders collected browser details in the documented section and row order', async () => {
    render(<BrowserDetails collect={() => inspection} />);

    expect(await screen.findByText('Example Browser')).toBeInTheDocument();

    const expectedGroups = [
      ['Browser', ['User agent', 'Browser languages', 'Browser timezone', 'UTC offset', 'Cookies enabled', 'Do Not Track', 'Platform']],
      ['Device and screen', ['Screen size', 'Available screen size', 'Viewport size', 'Device pixel ratio', 'Color depth', 'Pixel depth', 'Maximum touch points', 'Logical processors', 'Device memory']],
      ['Preferences and capabilities', ['Preferred color scheme', 'Reduced motion', 'Contrast preference', 'Online', 'Effective connection type', 'Downlink', 'Round-trip time', 'Data saver']],
    ] as const;

    for (const [title, labels] of expectedGroups) {
      const section = screen.getByRole('heading', { name: title, level: 2 }).closest('section');
      if (!section) throw new Error(`${title} section was not rendered`);
      expect(Array.from(section.querySelectorAll('dt')).map((term) => term.textContent)).toEqual(labels);
    }

    const browserSection = screen.getByRole('heading', { name: 'Browser', level: 2 }).closest('section');
    if (!browserSection) throw new Error('Browser section was not rendered');
    expect(within(browserSection).getByText('en-US, en')).toBeInTheDocument();
    expect(within(browserSection).getAllByText('Not supported')).toHaveLength(1);
  });

  it('renders empty user-agent and language fallbacks as Not supported', async () => {
    render(
      <BrowserDetails
        collect={() => ({
          ...inspection,
          browser: { ...inspection.browser, userAgent: '', languages: [] },
        })}
      />,
    );

    const browserSection = screen.getByRole('heading', { name: 'Browser', level: 2 }).closest('section');
    if (!browserSection) throw new Error('Browser section was not rendered');

    await screen.findAllByText('Not supported');
    expect(Array.from(browserSection.querySelectorAll('dd')).map((definition) => definition.textContent)).toEqual([
      'Not supported',
      'Not supported',
      'Asia/Tokyo',
      '-540',
      'Yes',
      'Not supported',
      'Win32',
    ]);
  });
});
