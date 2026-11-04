import {defineConfig,devices} from '@playwright/test';

export default defineConfig({
 testDir:'./e2e',
 fullyParallel:true,
 forbidOnly:!!process.env.CI,
 retries:process.env.CI?1:0,
 reporter:process.env.CI?'github':'list',
 use:{baseURL:'http://127.0.0.1:3011',trace:'retain-on-failure',launchOptions:{executablePath:process.env.PLAYWRIGHT_CHROME_PATH},...devices['Desktop Chrome']},
 webServer:{command:'npx next start -p 3011',url:'http://127.0.0.1:3011',reuseExistingServer:!!process.env.CI,timeout:30_000}
});
