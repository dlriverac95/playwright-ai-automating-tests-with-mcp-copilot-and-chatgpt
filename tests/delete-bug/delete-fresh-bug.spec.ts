// spec: specs/testing/delete-bug.md
// seed: tests/seed.spec.ts

import { test, expect } from '../fixtures/test';
import { createBug, loginToBoard } from './delete-bug-utils';

test.describe('Delete Bug - Fresh Bug Deletion', () => {
  let createdBugId: number | undefined;
  let bugTitle: string;

  test.beforeEach(async ({ page, boardPage, loginPage }) => {
    const firstUser = await loginToBoard(loginPage, boardPage);

    bugTitle = `Fresh delete bug ${Date.now()}`;
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

  test('Deleting a fresh bug removes it from the board and closes the modal', async ({ boardPage }) => {
    const editModal = await boardPage.openEditBugModalForTitle(bugTitle);

    await editModal.delete();
    await boardPage.expectBugNotVisible(bugTitle);

    createdBugId = undefined;
  });

  test('Canceling deletion keeps the bug on the board and leaves the modal open', async ({ boardPage }) => {
    const editModal = await boardPage.openEditBugModalForTitle(bugTitle);

    await editModal.cancelDelete();
    await boardPage.expectBugVisible(bugTitle);
  });
});
