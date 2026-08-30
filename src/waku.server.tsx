import { fsRouter } from "waku";
import adapter from "waku/adapters/cloudflare";

export default adapter(fsRouter(import.meta.glob("./pages/**/*.{tsx,ts}")), {
  middlewareModules: import.meta.glob("./middleware/security.ts"),
});
