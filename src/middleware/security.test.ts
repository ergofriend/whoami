import { Hono } from "hono";
import { describe, expect, it } from "vitest";

import securityMiddleware from "./security";

function createApp() {
  const app = new Hono();
  app.use("*", securityMiddleware());
  app.get("/", (c) => c.text("ok"));
  return app;
}

describe("securityMiddleware", () => {
  it("rejects unsupported page methods with an explicit allow list", async () => {
    const app = createApp();
    const response = await app.request("/", { method: "POST" });

    expect(response.status).toBe(405);
    expect(response.headers.get("allow")).toBe("GET, HEAD");
    expect(response.headers.get("cache-control")).toBe("no-store");
  });

  it("adds the dynamic response and browser security policy", async () => {
    const response = await createApp().request("/");
    const contentSecurityPolicy = response.headers.get("content-security-policy");

    expect(response.headers.get("cache-control")).toBe("no-store");
    expect(contentSecurityPolicy).toContain("frame-ancestors 'none'");
    expect(contentSecurityPolicy).toMatch(/'nonce-[^']+'/);
    expect(response.headers.get("referrer-policy")).toBe("no-referrer");
  });
});
