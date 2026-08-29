import type { MiddlewareHandler } from 'hono';
import { every } from 'hono/combine';
import { contextStorage } from 'hono/context-storage';
import { NONCE, secureHeaders } from 'hono/secure-headers';

const DYNAMIC_PATHS = new Set(['/', '/api.json']);
const ALLOWED_METHODS = new Set(['GET', 'HEAD']);

const dynamicResponsePolicy: MiddlewareHandler = async (c, next) => {
  const isDynamicRoute = DYNAMIC_PATHS.has(c.req.path);
  if (isDynamicRoute && !ALLOWED_METHODS.has(c.req.method)) {
    return new Response(null, {
      status: 405,
      headers: { Allow: 'GET, HEAD', 'Cache-Control': 'no-store' },
    });
  }

  await next();
  if (!isDynamicRoute) return;

  const headers = new Headers(c.res.headers);
  headers.set('Cache-Control', 'no-store');
  headers.set('X-Content-Type-Options', 'nosniff');
  headers.set('Referrer-Policy', 'no-referrer');
  c.res = new Response(c.res.body, {
    status: c.res.status,
    statusText: c.res.statusText,
    headers,
  });
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
        scriptSrc: ["'self'", NONCE, 'https://static.cloudflareinsights.com'],
      },
      referrerPolicy: 'no-referrer',
      xContentTypeOptions: 'nosniff',
    }),
    dynamicResponsePolicy,
  );

export default securityMiddleware;
