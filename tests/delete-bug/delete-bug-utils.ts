import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { type APIRequestContext, expect } from '@playwright/test';
import { LoginPage, firstSeededUser } from '../pages/LoginPage';
import type { Page } from '@playwright/test';

export async function loginToBoard(loginPage: LoginPage, boardPage: { expectLoaded: () => Promise<void> }) {
  const firstUser = firstSeededUser();

  await loginPage.goto();
  await loginPage.login(firstUser.username, firstUser.password);
  await boardPage.expectLoaded();

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
