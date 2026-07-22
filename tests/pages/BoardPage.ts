import { type Page, expect } from '@playwright/test';
import { CreateBugModal } from './CreateBugModal';
import { EditBugModal } from './EditBugModal';

export class BoardPage {
  readonly page: Page;
  readonly table;

  constructor(page: Page) {
    this.page = page;
    this.table = this.page.getByRole('table', { name: 'Bugs' });
  }

  async goto() {
    await this.page.goto('/board');
  }

  async expectLoaded() {
    await expect(this.table).toBeVisible();
  }

  bugRow(title: string) {
    return this.page.locator('table[aria-label="Bugs"] tbody tr', { hasText: title }).first();
  }

  async expectBugVisible(title: string) {
    await expect(this.bugRow(title)).toBeVisible();
  }

  async expectBugNotVisible(title: string) {
    await expect(this.bugRow(title)).not.toBeVisible();
  }

  async openCreateBugModal() {
    await this.page.getByRole('button', { name: 'New Bug' }).click();
    const modal = new CreateBugModal(this.page);
    await modal.waitForOpen();
    return modal;
  }

  async openEditBugModalForTitle(title: string) {
    const row = this.bugRow(title);
    await expect(row).toBeVisible();
    await row.click();
    const modal = new EditBugModal(this.page);
    await modal.waitForOpen();
    return modal;
  }
}
