import { defineConfig } from "cf/config";

export default defineConfig({
  worker: {
    name: "money-talks",
    compatibilityDate: "2026-10-01",
    // LAB-DOMAIN: domains: ["money-talks.<lab domain>"] once it's picked
    workersDev: true,
    previewUrls: false,
    observability: { enabled: true, issues: { enabled: true } },
  },
});
