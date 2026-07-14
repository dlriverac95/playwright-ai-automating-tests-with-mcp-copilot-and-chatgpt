import { test, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';

test('log in and edit the most recently created bug', async ({ page }) => {
  const usersPath = path.resolve(process.cwd(), 'users.json');
  const users = JSON.parse(fs.readFileSync(usersPath, 'utf-8')) as Array<{ username: string; password: string }>;
  const { username, password } = users[0];

  await page.goto('/login');
  await page.fill('#username', username);
  await page.fill('#password', password);
  await page.click('button:has-text("Login")');
  await page.waitForURL('**/board');

  await page.click('button:has-text("New Bug")');

  const title = `E2E edit bug ${Date.now()}`;
  await page.fill('#bug-title', title);
  await page.selectOption('#bug-severity', 'mid');
  await page.fill('#bug-owner', username);
  await page.fill('#bug-description', 'Edited by Playwright test');
  await page.click('button:has-text("Save")');

  await page.waitForSelector('#bug-title', { state: 'detached', timeout: 5000 }).catch(() => { });

  const createdBugRow = page.locator('tr[role="button"]').filter({ hasText: title }).first();
  await expect(createdBugRow).toBeVisible({ timeout: 5000 });
  await createdBugRow.click();

  const bugIdInput = page.locator('#edit-bug-id');
  await expect(bugIdInput).toBeVisible();
  const bugId = await bugIdInput.inputValue();

  await page.selectOption('#edit-bug-state', 'closed');
  await page.click('button:has-text("Save")');
  await page.waitForSelector('#edit-bug-id', { state: 'detached', timeout: 5000 }).catch(() => { });

  await page.getByRole('button', { name: 'Closed' }).click();
  await expect(page.locator('table[aria-label="Bugs"]')).toContainText(bugId);
});
