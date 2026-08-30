// @vitest-environment jsdom

import { statSync } from "node:fs";
import { resolve } from "node:path";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import Root from "../pages/_root";

function metadata(document: Document, key: string): string | null {
  return (
    document
      .querySelector(`meta[name="${key}"], meta[property="${key}"]`)
      ?.getAttribute("content") ?? null
  );
}

describe("Root metadata", () => {
  it("publishes consistent Open Graph and X card metadata", () => {
    const markup = renderToStaticMarkup(
      <Root>
        <main />
      </Root>,
    );
    const document = new DOMParser().parseFromString(markup, "text/html");
    const title = "whoami — See what the web can infer";
    const imageUrl = "https://whoami.kasu.dev/og.jpg";

    expect(document.title).toBe(title);
    expect(document.querySelector('link[rel="canonical"]')?.getAttribute("href")).toBe(
      "https://whoami.kasu.dev/",
    );
    expect(metadata(document, "og:title")).toBe(title);
    expect(metadata(document, "og:image")).toBe(imageUrl);
    expect(metadata(document, "og:image:type")).toBe("image/jpeg");
    expect(metadata(document, "og:image:width")).toBe("1200");
    expect(metadata(document, "og:image:height")).toBe("630");
    expect(metadata(document, "twitter:card")).toBe("summary_large_image");
    expect(metadata(document, "twitter:title")).toBe(title);
    expect(metadata(document, "twitter:image")).toBe(imageUrl);
    expect(statSync(resolve(process.cwd(), "public/og.jpg")).size).toBeLessThan(400_000);
  });
});
