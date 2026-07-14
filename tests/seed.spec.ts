import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { test, expect } from '@playwright/test';

const usersPath = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../users.json');
const users = JSON.parse(readFileSync(usersPath, 'utf8')) as Array<{ username: string; password: string }>;

test.describe('Seed tests', () => {
  test('logs in with the first seeded user', {tag: '@seed'}, async ({ page }) => {
    const firstUser = users[0];

    await page.goto('/login');
    await page.getByLabel('Username').fill(firstUser.username);
    await page.getByLabel('Password').fill(firstUser.password);
    await page.getByRole('button', { name: 'Login' }).click();

    await expect(page).toHaveURL(/\/board/);
    await expect(page.getByRole('table', { name: 'Bugs' })).toBeVisible();
  });
});
