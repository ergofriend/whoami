import type { ServerInspection } from '../features/server/server-inspection';
import { BrowserDetails } from './BrowserDetails';
import { CopyButton } from './CopyButton';
import { ServerDetails } from './ServerDetails';

type HomeViewProps = {
  inspection: ServerInspection;
};

export function HomeView({ inspection }: HomeViewProps) {
  return (
    <>
      <header>
        <h1>whoami</h1>
        <a href="https://github.com/ergofriend/whoami">GitHub repository</a>
      </header>
      <main>
        <ServerDetails
          inspection={inspection}
          browserDetails={<BrowserDetails />}
          copyControl={
            inspection.publicIp.address === null ? undefined : (
              <CopyButton value={inspection.publicIp.address} label="Copy IP" />
            )
          }
        />
      </main>
      <footer>
        <a href="https://github.com/ergofriend/whoami">GitHub repository</a>
        <p>This site does not store the information displayed above.</p>
        <p>Browser details are processed only in your browser and are not sent back to this site.</p>
        <p>Cloudflare Web Analytics is used for privacy-focused performance and visit analytics.</p>
        <a href="https://github.com/ergofriend/whoami/blob/main/LICENSE">MIT License</a>
      </footer>
    </>
  );
}
