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
  it("rejects unsupported dynamic-route methods with an explicit allow list", async () => {
    const app = createApp();

    expect((await app.request("/", { method: "POST" })).status).toBe(405);
    const removedApiResponse = await app.request("/api.json", { method: "POST" });
    expect(removedApiResponse.status).toBe(404);
    expect(removedApiResponse.headers.get("allow")).toBeNull();
    expect(removedApiResponse.headers.get("cache-control")).toBeNull();
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
