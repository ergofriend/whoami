import type { ServerInspection } from "../features/server/server-inspection";
import { BrowserDetails } from "./BrowserDetails";
import { CopyButton } from "./CopyButton";
import { ServerDetails } from "./ServerDetails";
import { SketchBadgeLink, SketchUnderline } from "./Sketch";

type HomeViewProps = {
  inspection: ServerInspection;
};

export function HomeView({ inspection }: HomeViewProps) {
  return (
    <div className="site-shell">
      <header className="site-header">
        <h1 className="sketch-heading">
          <SketchUnderline>whoami</SketchUnderline>
        </h1>
        <p className="site-intro">
          See the network and browser information available to this site.
        </p>
        <div className="source-callout">
          <span className="source-label">open source</span>
          <SketchBadgeLink className="repository-link" href="https://github.com/ergofriend/whoami">
            Source on GitHub <span aria-hidden="true">↗</span>
          </SketchBadgeLink>
        </div>
      </header>
      <main className="information-stack">
        <ServerDetails
          inspection={inspection}
          browserDetails={<BrowserDetails groups={["browser"]} />}
          extendedBrowserDetails={<BrowserDetails groups={["device", "preferences"]} />}
          copyControl={
            inspection.publicIp.address === null ? undefined : (
              <CopyButton value={inspection.publicIp.address} label="Copy" />
            )
          }
        />
      </main>
      <footer className="site-footer">
        <p>This site does not store the information displayed above.</p>
        <p>
          Browser details are processed only in your browser and are not sent back to this site.
        </p>
        <p>Cloudflare Web Analytics is used for privacy-focused performance and visit analytics.</p>
      </footer>
    </div>
  );
}
