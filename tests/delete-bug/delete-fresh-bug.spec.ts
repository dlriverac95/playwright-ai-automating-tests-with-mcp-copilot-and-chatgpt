// spec: specs/testing/delete-bug.md
// seed: tests/seed.spec.ts

import { test, expect, type Page } from '@playwright/test';
import { createBug, loginToBoard, openEditModalForBug, bugRowLocator } from './delete-bug-utils';

test.describe('Delete Bug - Fresh Bug Deletion', () => {
  let createdBugId: number | undefined;
  let bugTitle: string;

  test.beforeEach(async ({ page }) => {
    const firstUser = await loginToBoard(page);
    bugTitle = `Fresh delete bug ${Date.now()}`;
    createdBugId = await createBug(page.request, bugTitle, firstUser.username);

    await page.goto('/board');
    await expect(bugRowLocator(page, bugTitle)).toBeVisible();
  });

  test.afterEach(async ({ page }) => {
    if (createdBugId !== undefined) {
      await page.request.delete(`/api/bugs/${createdBugId}`);
      createdBugId = undefined;
    }
  });

  test('Deleting a fresh bug removes it from the board and closes the modal', async ({ page }) => {
    const editModal = await openEditModalForBug(page, bugTitle);
    await editModal.getByRole('button', { name: 'Delete' }).click();

    await expect(editModal).not.toBeVisible();
    await expect(bugRowLocator(page, bugTitle)).not.toBeVisible();

    createdBugId = undefined;
  });
});
