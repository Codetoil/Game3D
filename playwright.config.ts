import type { PlaywrightTestConfig } from "@playwright/test";

const config: PlaywrightTestConfig = {
  webServer: {
    command: "echo test",
    port: 4173,
  },
  testDir: "tests",
};

export default config;
