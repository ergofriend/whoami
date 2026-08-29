import type { ServerInspection } from '../features/server/server-inspection';
import { KeyValueSection } from './KeyValueSection';
import { ServerDetails } from './ServerDetails';

type HomeViewProps = {
  inspection: ServerInspection;
};

const unsupportedItems = (labels: string[]) =>
  labels.map((label) => ({ label, value: 'Not supported' }));

export function HomeView({ inspection }: HomeViewProps) {
  const browserDetails = (
    <>
      <KeyValueSection
        title="Browser"
        items={unsupportedItems([
          'User agent',
          'Browser languages',
          'Browser timezone',
          'UTC offset',
          'Cookies enabled',
          'Do Not Track',
          'Platform',
        ])}
      />
      <KeyValueSection
        title="Device and screen"
        items={unsupportedItems([
          'Screen size',
          'Available screen size',
          'Viewport size',
          'Device pixel ratio',
          'Color depth',
          'Pixel depth',
          'Maximum touch points',
          'Logical processors',
          'Device memory',
        ])}
      />
      <KeyValueSection
        title="Preferences and capabilities"
        items={unsupportedItems([
          'Preferred color scheme',
          'Reduced motion',
          'Contrast preference',
          'Online',
          'Effective connection type',
          'Downlink',
          'Round-trip time',
          'Data saver',
        ])}
      />
    </>
  );

  return (
    <>
      <header>
        <h1>whoami</h1>
        <a href="https://github.com/ergofriend/whoami">GitHub repository</a>
      </header>
      <main>
        <ServerDetails inspection={inspection} browserDetails={browserDetails} />
      </main>
      <footer>
        <a href="https://github.com/ergofriend/whoami">GitHub repository</a>
      </footer>
    </>
  );
}
