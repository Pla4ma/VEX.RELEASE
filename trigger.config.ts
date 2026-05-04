import { defineConfig } from "@trigger.dev/sdk";

export default defineConfig({
  project: "proj_tkrrzgdobcsdwoqycois",
  runtime: "node",
  maxDuration: 300, // 5 minutes (must be at least 5 seconds)
  dirs: ["./jobs"],
});
