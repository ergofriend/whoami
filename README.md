# whoami

An open-source IP address, network, browser, and request information checker.

Live site: [whoami.kasu.dev](https://whoami.kasu.dev)

## What it shows

The Cloudflare Worker reports your public IP address, network, approximate
IP-derived location, HTTP and TLS connection, Cloudflare edge, and an explicit
allowlist of request headers. Browser and device information is read locally by
your browser and is not sent back to this site.

The application does not store the displayed result, create application
cookies, use browser storage, request GPS access, or generate a browser
fingerprint. `Cookie`, `Authorization`, `Proxy-Authorization`, and unknown
request headers are never published.

## Development

Use Node.js `^22.15.0`, `^24.0.0`, or `^26.0.0` and npm.

```powershell
npm install
npm run dev
npm test
npm run typecheck
npm run build
npm run deploy:dry-run
```

## Deploy

```powershell
npm run deploy:dry-run
npm run deploy
```

The Worker custom domain is `whoami.kasu.dev`. Cloudflare Web Analytics is
enabled with one-click automatic injection in the Cloudflare dashboard; the
repository contains no account-specific analytics token.

## License

[MIT](./LICENSE)
