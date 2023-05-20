import type { PlaywrightTestConfig } from "@playwright/test";

const config: PlaywrightTestConfig = {
  testDir: "tests",
  webServer: {
    command: "echo test",
    port: 4173,
  },
};

/* tslint:disable */
export default config;
