import type { ReactNode } from "react";

import "@fontsource-variable/inter";
import "drawably/style.css";
import "drawably/font.css";
import "../styles.css";

const siteUrl = "https://whoami.kasu.dev/";
const title = "whoami — See what the web can infer";
const description =
  "See the public IP, network, approximate location, and browser information available to this site.";
const socialImageUrl = `${siteUrl}og.jpg`;
const socialImageAlt =
  "Hand-drawn world map with the whoami title and an approximate location card.";

export default function Root({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>{title}</title>
        <meta name="description" content={description} />
        <meta name="robots" content="index, follow, max-image-preview:large" />
        <meta name="theme-color" content="#f5efe2" />
        <link rel="canonical" href={siteUrl} />

        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="whoami" />
        <meta property="og:locale" content="en_US" />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta property="og:url" content={siteUrl} />
        <meta property="og:image" content={socialImageUrl} />
        <meta property="og:image:type" content="image/jpeg" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:image:alt" content={socialImageAlt} />

        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={title} />
        <meta name="twitter:description" content={description} />
        <meta name="twitter:image" content={socialImageUrl} />
        <meta name="twitter:image:alt" content={socialImageAlt} />
      </head>
      <body>{children}</body>
    </html>
  );
}
