// spec: specs/testing/delete-bug.md
// seed: tests/seed.spec.ts

import { test, expect, type Page } from '@playwright/test';
import { createBug, loginToBoard, openEditModalForBug, bugRowLocator } from './delete-bug-utils';

test.describe('Delete Bug - Button Visibility', () => {
  let createdBugId: number | undefined;
  let bugTitle: string;

  test.beforeEach(async ({ page }) => {
    const firstUser = await loginToBoard(page);
    bugTitle = `Delete button bug ${Date.now()}`;
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

  test('Delete button appears in edit modal for a freshly created bug', async ({ page }) => {
    const editModal = await openEditModalForBug(page, bugTitle);
    await expect(editModal.getByRole('button', { name: 'Delete' })).toBeVisible();
  });
});
