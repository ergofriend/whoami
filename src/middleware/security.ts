import type { MiddlewareHandler } from "hono";
import { every } from "hono/combine";
import { contextStorage } from "hono/context-storage";
import { NONCE, secureHeaders } from "hono/secure-headers";

const ALLOWED_METHODS = new Set(["GET", "HEAD"]);

const dynamicResponsePolicy: MiddlewareHandler = async (c, next) => {
  const isPageRequest = c.req.path === "/";
  if (isPageRequest && !ALLOWED_METHODS.has(c.req.method)) {
    return new Response(null, {
      status: 405,
      headers: { Allow: "GET, HEAD", "Cache-Control": "no-store" },
    });
  }

  await next();
  if (!isPageRequest) return;

  c.header("Cache-Control", "no-store");
  c.header("X-Content-Type-Options", "nosniff");
  c.header("Referrer-Policy", "no-referrer");
};

const securityMiddleware = (): MiddlewareHandler =>
  every(
    contextStorage(),
    secureHeaders({
      contentSecurityPolicy: {
        defaultSrc: ["'self'"],
        baseUri: ["'none'"],
        connectSrc: ["'self'"],
        frameAncestors: ["'none'"],
        objectSrc: ["'none'"],
        scriptSrc: ["'self'", NONCE, "https://static.cloudflareinsights.com"],
      },
      referrerPolicy: "no-referrer",
      xContentTypeOptions: "nosniff",
    }),
    dynamicResponsePolicy,
  );

export default securityMiddleware;
