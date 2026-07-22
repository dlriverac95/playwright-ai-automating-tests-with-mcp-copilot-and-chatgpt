import { type Page, expect } from '@playwright/test';

export class CreateBugModal {
  readonly page: Page;
  readonly dialog;

  constructor(page: Page) {
    this.page = page;
    this.dialog = this.page.getByRole('dialog', { name: 'Create bug' });
  }

  async waitForOpen() {
    await expect(this.dialog).toBeVisible();
  }

  async fillTitle(title: string) {
    await this.dialog.getByLabel('Title').fill(title);
  }

  async selectSeverity(severity: 'high' | 'mid' | 'low') {
    await this.dialog.getByLabel('Severity').selectOption(severity);
  }

  async fillOwner(owner: string) {
    await this.dialog.getByLabel('Owner').fill(owner);
  }

  async fillDescription(description: string) {
    await this.dialog.getByLabel('Description').fill(description);
  }

  async save() {
    await this.dialog.getByRole('button', { name: 'Save' }).click();
    await expect(this.dialog).not.toBeVisible();
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
