import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { type Page, type APIRequestContext, expect } from '@playwright/test';

const usersPath = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../users.json');
const users = JSON.parse(readFileSync(usersPath, 'utf8')) as Array<{ username: string; password: string }>;

export function firstSeededUser() {
  return users[0];
}

export async function loginToBoard(page: Page) {
  const firstUser = firstSeededUser();

  await page.goto('/login');
  await page.getByLabel('Username').fill(firstUser.username);
  await page.getByLabel('Password').fill(firstUser.password);
  await page.getByRole('button', { name: 'Login' }).click();

  await expect(page).toHaveURL(/\/board/);
  await expect(page.getByRole('table', { name: 'Bugs' })).toBeVisible();
  return firstUser;
}

export async function createBug(request: APIRequestContext, title: string, owner: string) {
  const response = await request.post('/api/bugs', {
    data: {
      title,
      severity: 'high',
      owner,
      description: `Automated setup bug ${title}`,
    },
  });

  await expect(response.ok()).toBeTruthy();
  const data = (await response.json()) as { id: number };
  return data.id;
}

export function bugRowLocator(page: Page, title: string) {
  return page.locator('table[aria-label="Bugs"] tbody tr', { hasText: title }).first();
}

export async function openEditModalForBug(page: Page, title: string) {
  const bugRow = bugRowLocator(page, title);
  await expect(bugRow).toBeVisible();
  await bugRow.click();

  const editModal = page.getByRole('dialog', { name: /Edit bug #/ });
  await expect(editModal).toBeVisible();
  return editModal;
}
