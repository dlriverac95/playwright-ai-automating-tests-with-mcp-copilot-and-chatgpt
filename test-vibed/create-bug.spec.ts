import { test, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';

test('log in and create a bug', async ({ page }) => {
  const usersPath = path.resolve(process.cwd(), 'users.json');
  const users = JSON.parse(fs.readFileSync(usersPath, 'utf-8')) as Array<{ username: string; password: string }>;
  const { username, password } = users[0];

  await page.goto('/login');
  await page.fill('#username', username);
  await page.fill('#password', password);
  await page.click('button:has-text("Login")');
  await page.waitForURL('**/board');

  await page.click('button:has-text("New Bug")');

  const title = `E2E test bug ${Date.now()}`;
  await page.fill('#bug-title', title);
  await page.selectOption('#bug-severity', 'high');
  await page.fill('#bug-owner', username);
  await page.fill('#bug-description', 'Created by Playwright test');
  await page.click('button:has-text("Save")');

  // wait for modal to close
  await page.waitForSelector('#bug-title', { state: 'detached', timeout: 5000 }).catch(() => { });

  // assert the new bug appears in the table
  await expect(page.locator(`text=${title}`)).toBeVisible({ timeout: 5000 });
});
