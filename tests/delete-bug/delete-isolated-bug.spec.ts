// spec: specs/testing/delete-bug.md
// seed: tests/seed.spec.ts

import { test, expect } from '../fixtures/test';
import { createBug, loginToBoard } from './delete-bug-utils';

test.describe('Delete Bug - Isolation', () => {
  let createdBugId: number | undefined;
  let controlBugId: number | undefined;
  let bugTitle: string;
  let controlBugTitle: string;

  test.beforeEach(async ({ page, boardPage, loginPage }) => {
    const firstUser = await loginToBoard(loginPage, boardPage);

    bugTitle = `Isolated delete bug ${Date.now()}`;
    controlBugTitle = `Control bug ${Date.now()}`;

    createdBugId = await createBug(page.request, bugTitle, firstUser.username);
    controlBugId = await createBug(page.request, controlBugTitle, firstUser.username);

    await boardPage.goto();
    await boardPage.expectBugVisible(bugTitle);
    await boardPage.expectBugVisible(controlBugTitle);
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

  test('Deleting a bug created during setup does not affect other bugs', async ({ boardPage }) => {
    const editModal = await boardPage.openEditBugModalForTitle(bugTitle);
    await editModal.delete();

    await boardPage.expectBugNotVisible(bugTitle);
    await boardPage.expectBugVisible(controlBugTitle);

    createdBugId = undefined;
  });
});
