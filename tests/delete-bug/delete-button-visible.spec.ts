// spec: specs/testing/delete-bug.md
// seed: tests/seed.spec.ts

import { test, expect } from '../fixtures/test';
import { createBug, loginToBoard } from './delete-bug-utils';
import { BoardPage } from '../pages/BoardPage';

test.describe('Delete Bug - Button Visibility', () => {
  let createdBugId: number | undefined;
  let bugTitle: string;

  test.beforeEach(async ({ page, boardPage, loginPage }) => {
    const firstUser = await loginToBoard(loginPage, boardPage);

    bugTitle = `Delete button bug ${Date.now()}`;
    createdBugId = await createBug(page.request, bugTitle, firstUser.username);

    await boardPage.goto();
    await boardPage.expectBugVisible(bugTitle);
  });

  test.afterEach(async ({ page }) => {
    if (createdBugId !== undefined) {
      await page.request.delete(`/api/bugs/${createdBugId}`);
      createdBugId = undefined;
    }
  });

  test('Delete button appears in edit modal for a freshly created bug', async ({ boardPage }) => {
    const editModal = await boardPage.openEditBugModalForTitle(bugTitle);

    await editModal.expectDeleteButtonVisible();
  });
});
