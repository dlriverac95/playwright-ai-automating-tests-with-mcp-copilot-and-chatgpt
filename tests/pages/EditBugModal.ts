import { type Page, expect } from '@playwright/test';

export class EditBugModal {
  readonly page: Page;
  readonly dialog;

  constructor(page: Page) {
    this.page = page;
    this.dialog = this.page.getByRole('dialog', { name: /Edit bug #/ });
  }

  async waitForOpen() {
    await expect(this.dialog).toBeVisible();
  }

  async expectDeleteButtonVisible() {
    await expect(this.dialog.getByRole('button', { name: 'Delete' })).toBeVisible();
  }

  async delete() {
    await this.dialog.getByRole('button', { name: 'Delete' }).click();

    const confirmDialog = this.page.getByRole('dialog', { name: 'Confirm deletion' });
    await expect(confirmDialog).toBeVisible();
    await confirmDialog.getByRole('button', { name: 'Delete' }).click();

    await expect(this.dialog).not.toBeVisible();
  }

  async cancelDelete() {
    await this.dialog.getByRole('button', { name: 'Delete' }).click();

    const confirmDialog = this.page.getByRole('dialog', { name: 'Confirm deletion' });
    await expect(confirmDialog).toBeVisible();
    await confirmDialog.getByRole('button', { name: 'Cancel' }).click();

    await expect(confirmDialog).not.toBeVisible();
    await expect(this.dialog).toBeVisible();
  }

  async cancel() {
    await this.dialog.getByRole('button', { name: 'Cancel' }).click();
    await expect(this.dialog).not.toBeVisible();
  }

  async close() {
    await this.dialog.getByRole('button', { name: 'Close' }).click();
    await expect(this.dialog).not.toBeVisible();
  }
}
