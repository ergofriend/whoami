import type { ServerInspection } from "../features/server/server-inspection";
import { BrowserDetails } from "./BrowserDetails";
import { ServerDetails } from "./ServerDetails";
import { SketchBadgeLink, SketchHighlight, SketchList, SketchUnderline } from "./Sketch";

type HomeViewProps = {
  inspection: ServerInspection;
};

export function HomeView({ inspection }: HomeViewProps) {
  return (
    <div className="site-shell">
      <header className="site-header">
        <div className="site-header-copy">
          <h1 className="sketch-heading">
            <SketchUnderline>whoami</SketchUnderline>
          </h1>
          <p className="site-intro">
            See the <SketchHighlight>network and browser information</SketchHighlight> available to
            this site.
          </p>
        </div>
        <div className="site-header-actions">
          <SketchBadgeLink className="repository-link" href="https://github.com/ergofriend/whoami">
            <svg aria-hidden="true" focusable="false" height="16" viewBox="0 0 16 16" width="16">
              <path
                fill="currentColor"
                d="M6.766 11.328c-2.063-.25-3.516-1.734-3.516-3.656 0-.781.281-1.625.75-2.188-.203-.515-.172-1.609.063-2.062.625-.078 1.468.25 1.968.703.594-.187 1.219-.281 1.985-.281.765 0 1.39.094 1.953.265.484-.437 1.344-.765 1.969-.687.218.422.25 1.515.046 2.047.5.593.766 1.39.766 2.203 0 1.922-1.453 3.375-3.547 3.64.531.344.89 1.094.89 1.954v1.625c0 .468.391.734.86.547C13.781 14.359 16 11.53 16 8.03 16 3.61 12.406 0 7.984 0 3.563 0 0 3.61 0 8.031a7.88 7.88 0 0 0 5.172 7.422c.422.156.828-.125.828-.547v-1.25c-.219.094-.5.156-.75.156-1.031 0-1.64-.562-2.078-1.609-.172-.422-.36-.672-.719-.719-.187-.015-.25-.093-.25-.187 0-.188.313-.328.625-.328.453 0 .844.281 1.25.86.313.452.64.655 1.031.655s.641-.14 1-.5c.266-.265.47-.5.657-.656"
              />
            </svg>
            Source on GitHub
          </SketchBadgeLink>
        </div>
      </header>
      <main className="inspection-main">
        <ServerDetails
          inspection={inspection}
          browserDetails={<BrowserDetails groups={["browser"]} />}
          extendedBrowserDetails={<BrowserDetails groups={["device", "preferences"]} />}
        />
        <SketchList className="trust-assurances" marker="check" aria-label="Privacy assurances">
          <li>No storage</li>
          <li>No GPS</li>
          <li>Browser data stays local</li>
        </SketchList>
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
