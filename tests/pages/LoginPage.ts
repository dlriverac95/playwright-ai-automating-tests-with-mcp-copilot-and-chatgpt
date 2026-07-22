import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { type Page, expect } from '@playwright/test';

const usersPath = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../users.json');
const users = JSON.parse(readFileSync(usersPath, 'utf8')) as Array<{ username: string; password: string }>;

export class LoginPage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async goto() {
    await this.page.goto('/login');
  }

  async login(username: string, password: string) {
    await this.page.getByLabel('Username').fill(username);
    await this.page.getByLabel('Password').fill(password);
    await this.page.getByRole('button', { name: 'Login' }).click();
  }

  async expectLoaded() {
    await expect(this.page).toHaveURL(/\/board/);
    await expect(this.page.getByRole('table', { name: 'Bugs' })).toBeVisible();
  }
}

export function firstSeededUser() {
  return users[0];
}
