import type { collectBrowserInspection } from "./browser-inspection";
import type { createBrowserSource } from "./browser-source";

export type BrowserInspection = ReturnType<typeof collectBrowserInspection>;
export type BrowserSource = ReturnType<typeof createBrowserSource>;
export type BrowserGroup = keyof BrowserInspection;
