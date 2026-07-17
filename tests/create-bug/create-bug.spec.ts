// spec: specs/testing/create-bug.md
// seed: tests/seed.spec.ts

import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { test, expect, type Page } from '@playwright/test';

const usersPath = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../users.json');
const users = JSON.parse(readFileSync(usersPath, 'utf8')) as Array<{ username: string; password: string }>;

async function loginToBoard(page: Page, user: { username: string; password: string }) {
  await page.goto('/login');
  await page.getByLabel('Username').fill(user.username);
  await page.getByLabel('Password').fill(user.password);
  await page.getByRole('button', { name: 'Login' }).click();

  await expect(page).toHaveURL(/\/board/);
  await expect(page.getByRole('table', { name: 'Bugs' })).toBeVisible();
}

test.describe('Create Bug', () => {
  test('Open create bug modal from board page', async ({ page }) => {
    const firstUser = users[0];

    // Given the user is logged in
    await loginToBoard(page, firstUser);

    // When the user navigates to /board
    await page.goto('/board');

    // Then the New Bug button is visible in the title bar
    const newBugButton = page.getByRole('button', { name: 'New Bug' });
    await expect(newBugButton).toBeVisible();

    // When the user clicks New Bug
    await newBugButton.click();

    // Then the create bug modal opens
    const createBugModal = page.getByRole('dialog', { name: 'Create bug' });
    await expect(createBugModal).toBeVisible();

    // And the modal includes fields for title, severity, owner, and description
    await expect(createBugModal.getByLabel('Title')).toBeVisible();
    await expect(createBugModal.getByLabel('Severity')).toBeVisible();
    await expect(createBugModal.getByLabel('Owner')).toBeVisible();
    await expect(createBugModal.getByLabel('Description')).toBeVisible();

    // And the modal includes Save and Cancel buttons
    await expect(createBugModal.getByRole('button', { name: 'Save' })).toBeVisible();
    await expect(createBugModal.getByRole('button', { name: 'Cancel' })).toBeVisible();
  });

  test('Default owner is current user', async ({ page }) => {
    const firstUser = users[0];

    // Given the user is logged in as alice
    await loginToBoard(page, firstUser);

    // When the user opens the create bug modal
    await page.goto('/board');
    await page.getByRole('button', { name: 'New Bug' }).click();

    // Then the owner field is pre-filled with the current user
    await expect(page.getByRole('dialog', { name: 'Create bug' }).getByLabel('Owner')).toHaveValue(firstUser.username);
  });

  test('Save a new bug with valid fields', async ({ page }) => {
    const firstUser = users[0];
    const uniqueTitle = `Playwright bug ${Date.now()}`;

    // Given the user is logged in and on /board
    await loginToBoard(page, firstUser);
    await page.goto('/board');

    // When the user opens the create bug modal and fills in valid fields
    await page.getByRole('button', { name: 'New Bug' }).click();
    await page.getByRole('dialog', { name: 'Create bug' }).getByLabel('Title').fill(uniqueTitle);
    await page.getByRole('dialog', { name: 'Create bug' }).getByLabel('Severity').selectOption('high');
    await page.getByRole('dialog', { name: 'Create bug' }).getByLabel('Description').fill('Created by Playwright automation');

    // And clicks Save
    await page.getByRole('dialog', { name: 'Create bug' }).getByRole('button', { name: 'Save' }).click();

    // Then the modal closes and the bug is visible in the board table
    await expect(page.getByRole('dialog', { name: 'Create bug' })).not.toBeVisible();
    await expect(page.getByRole('table', { name: 'Bugs' })).toContainText(uniqueTitle);
    await expect(page.getByRole('table', { name: 'Bugs' })).toContainText(firstUser.username);
    await expect(page.getByRole('table', { name: 'Bugs' })).toContainText('HIGH');
  });

  test('Cancel creation does not save the bug', async ({ page }) => {
    const firstUser = users[0];
    const title = `Cancel test ${Date.now()}`;

    await loginToBoard(page, firstUser);
    await page.goto('/board');

    await page.getByRole('button', { name: 'New Bug' }).click();
    const modal = page.getByRole('dialog', { name: 'Create bug' });
    await modal.getByLabel('Title').fill(title);
    await modal.getByLabel('Description').fill('Should not be saved');
    await modal.getByRole('button', { name: 'Cancel' }).click();

    await expect(modal).not.toBeVisible();
    await expect(page.getByRole('table', { name: 'Bugs' })).not.toContainText(title);
  });

  test('Close modal with X button does not save the bug', async ({ page }) => {
    const firstUser = users[0];
    const title = `Close X test ${Date.now()}`;

    await loginToBoard(page, firstUser);
    await page.goto('/board');

    await page.getByRole('button', { name: 'New Bug' }).click();
    const modal = page.getByRole('dialog', { name: 'Create bug' });
    await modal.getByLabel('Title').fill(title);
    await modal.getByLabel('Description').fill('Should not be saved');
    await modal.getByRole('button', { name: 'Close' }).click();

    await expect(modal).not.toBeVisible();
    await expect(page.getByRole('table', { name: 'Bugs' })).not.toContainText(title);
  });

  test('Close modal with Escape does not save the bug', async ({ page }) => {
    const firstUser = users[0];
    const title = `Escape test ${Date.now()}`;

    await loginToBoard(page, firstUser);
    await page.goto('/board');

    await page.getByRole('button', { name: 'New Bug' }).click();
    const modal = page.getByRole('dialog', { name: 'Create bug' });
    await modal.getByLabel('Title').fill(title);
    await modal.getByLabel('Description').fill('Should not be saved');
    await page.keyboard.press('Escape');

    await expect(modal).not.toBeVisible();
    await expect(page.getByRole('table', { name: 'Bugs' })).not.toContainText(title);
  });

  test('Required field validation blocks save', async ({ page }) => {
    const firstUser = users[0];

    await loginToBoard(page, firstUser);
    await page.goto('/board');

    await page.getByRole('button', { name: 'New Bug' }).click();
    const modal = page.getByRole('dialog', { name: 'Create bug' });
    await modal.getByRole('button', { name: 'Save' }).click();

    await expect(modal).toBeVisible();
    await expect(modal).toContainText('Title is required.');
    await expect(modal).toContainText('Description is required.');
  });
});
