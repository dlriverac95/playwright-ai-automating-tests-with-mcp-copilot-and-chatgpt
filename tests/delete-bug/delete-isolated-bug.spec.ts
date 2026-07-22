// spec: specs/testing/delete-bug.md
// seed: tests/seed.spec.ts

import { test, expect, type Page } from '@playwright/test';
import { createBug, loginToBoard, openEditModalForBug, bugRowLocator } from './delete-bug-utils';

test.describe('Delete Bug - Isolation', () => {
  let createdBugId: number | undefined;
  let controlBugId: number | undefined;
  let bugTitle: string;
  let controlBugTitle: string;

  test.beforeEach(async ({ page }) => {
    const firstUser = await loginToBoard(page);
    bugTitle = `Isolated delete bug ${Date.now()}`;
    controlBugTitle = `Control bug ${Date.now()}`;

    createdBugId = await createBug(page.request, bugTitle, firstUser.username);
    controlBugId = await createBug(page.request, controlBugTitle, firstUser.username);

    await page.goto('/board');
    await expect(bugRowLocator(page, bugTitle)).toBeVisible();
    await expect(bugRowLocator(page, controlBugTitle)).toBeVisible();
  });

  test.afterEach(async ({ page }) => {
    if (createdBugId !== undefined) {
      await page.request.delete(`/api/bugs/${createdBugId}`);
      createdBugId = undefined;
    }
    if (controlBugId !== undefined) {
      await page.request.delete(`/api/bugs/${controlBugId}`);
      controlBugId = undefined;
    }
  });

  test('Deleting a bug created during setup does not affect other bugs', async ({ page }) => {
    const editModal = await openEditModalForBug(page, bugTitle);
    await editModal.getByRole('button', { name: 'Delete' }).click();

    await expect(editModal).not.toBeVisible();
    await expect(bugRowLocator(page, bugTitle)).not.toBeVisible();
    await expect(bugRowLocator(page, controlBugTitle)).toBeVisible();

    createdBugId = undefined;
  });
});
