import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { test, expect } from './fixtures/test';
import { LoginPage, firstSeededUser } from './pages/LoginPage';

const usersPath = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../users.json');
const users = JSON.parse(readFileSync(usersPath, 'utf8')) as Array<{ username: string; password: string }>;

test.describe('Seed tests', () => {
  test('logs in with the first seeded user', { tag: '@seed' }, async ({ loginPage, page }) => {
    const firstUser = users[0];

    await loginPage.goto();
    await loginPage.login(firstUser.username, firstUser.password);

    await expect(page).toHaveURL(/\/board/);
    await expect(page.getByRole('table', { name: 'Bugs' })).toBeVisible();
  });
});
