import { tryGetContext } from 'hono/context-storage';
import { Hono } from 'hono/tiny';
import type { MiddlewareHandler } from 'hono';
import { unstable_honoMiddleware as honoMiddleware } from 'waku/internals';
import { beforeAll, describe, expect, it, vi } from 'vitest';

const captured = vi.hoisted(() => ({
  options: undefined as Record<string, unknown> | undefined,
}));

vi.mock('waku', () => ({
  fsRouter: vi.fn(() => ({
    handleBuild: vi.fn(),
    handleRequest: vi.fn(),
  })),
}));

vi.mock('waku/adapters/cloudflare', () => ({
  default: vi.fn((_handlers: unknown, options: Record<string, unknown> | undefined) => {
    captured.options = options;
    return {};
  }),
}));

await import('./waku.server');

type ServerEntry = {
  fetch: (request: Request) => Response | Promise<Response>;
};

let serverEntry: ServerEntry;

beforeAll(() => {
  // Vitest has no Waku RSC/SSR virtual-module runtime. Capture the exact adapter
  // options from waku.server.tsx, then exercise those modules with Waku's runner.
  const app = new Hono();
  const middlewareModules = (captured.options?.middlewareModules ?? {}) as Record<
    string,
    () => Promise<{ default: (options: { app: Hono }) => MiddlewareHandler }>
  >;

  app.use(honoMiddleware.middlewareRunner(middlewareModules, { app }));
  app.all('*', (context) => {
    const nonce = tryGetContext()?.get('secureHeadersNonce');
    const headers = new Headers({
      'content-type': context.req.path === '/api.json' ? 'application/json' : 'text/html',
    });
    if (typeof nonce === 'string') headers.set('x-render-nonce', nonce);

    if (context.req.method === 'HEAD') return new Response(null, { headers });
    if (context.req.path === '/api.json') {
      return new Response('{"schemaVersion":1}', { headers });
    }
    return new Response('<!doctype html><p>downstream response</p>', { headers });
  });

  serverEntry = { fetch: (request) => app.fetch(request) };
});

function request(path: string, method = 'GET') {
  return serverEntry.fetch(new Request(`https://whoami.test${path}`, { method }));
}

function cspNonce(response: Response): string {
  const csp = response.headers.get('content-security-policy') ?? '';
  const match = csp.match(/'nonce-([^']+)'/);
  if (!match?.[1]) throw new Error('CSP nonce was not present');
  return match[1];
}

describe('production Cloudflare adapter middleware configuration', () => {
  it.each([
    ['GET', '/'],
    ['HEAD', '/'],
    ['GET', '/api.json'],
    ['HEAD', '/api.json'],
  ])('applies the dynamic security policy to %s %s', async (method, path) => {
    const response = await request(path, method);

    expect(response.status).toBe(200);
    expect(response.headers.get('cache-control')).toBe('no-store');
    expect(response.headers.get('referrer-policy')).toBe('no-referrer');
    expect(response.headers.get('x-content-type-options')).toBe('nosniff');
    expect(response.headers.get('x-render-nonce')).toBe(cspNonce(response));
  });

  it.each([
    ['POST', '/'],
    ['OPTIONS', '/api.json'],
  ])('rejects unsupported %s requests to %s before route handling', async (method, path) => {
    const response = await request(path, method);

    expect(response.status).toBe(405);
    expect(response.headers.get('allow')).toBe('GET, HEAD');
    expect(response.headers.get('cache-control')).toBe('no-store');
  });
});
