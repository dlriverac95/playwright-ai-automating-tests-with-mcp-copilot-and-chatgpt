import { test as base } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { BoardPage } from '../pages/BoardPage';
import { CreateBugModal } from '../pages/CreateBugModal';
import { EditBugModal } from '../pages/EditBugModal';

type Fixtures = {
  loginPage: LoginPage;
  boardPage: BoardPage;
  createBugModal: CreateBugModal;
  editBugModal: EditBugModal;
};

export const test = base.extend<Fixtures>({
  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },

  boardPage: async ({ page }, use) => {
    await use(new BoardPage(page));
  },

  createBugModal: async ({ page }, use) => {
    await use(new CreateBugModal(page));
  },

  editBugModal: async ({ page }, use) => {
    await use(new EditBugModal(page));
  },
});

export { expect } from '@playwright/test';
