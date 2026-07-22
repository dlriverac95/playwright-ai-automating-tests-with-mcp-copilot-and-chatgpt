// spec: specs/testing/create-bug.md
// seed: tests/seed.spec.ts

import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { test, expect } from '../fixtures/test';
import type { Page } from '@playwright/test';
import { LoginPage, firstSeededUser } from '../pages/LoginPage';
import { BoardPage } from '../pages/BoardPage';

const usersPath = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../users.json');
const users = JSON.parse(readFileSync(usersPath, 'utf8')) as Array<{ username: string; password: string }>;

async function loginToBoard(loginPage: LoginPage, boardPage: BoardPage, user: { username: string; password: string }) {
  await loginPage.goto();
  await loginPage.login(user.username, user.password);
  await boardPage.expectLoaded();
}

test.describe('Create Bug', () => {
  test('Open create bug modal from board page', async ({ page, loginPage, boardPage }) => {
    const firstUser = users[0];
    await loginToBoard(loginPage, boardPage, firstUser);

    const createBugModal = await boardPage.openCreateBugModal();
    await createBugModal.waitForOpen();

    await expect(createBugModal.dialog.getByLabel('Title')).toBeVisible();
    await expect(createBugModal.dialog.getByLabel('Severity')).toBeVisible();
    await expect(createBugModal.dialog.getByLabel('Owner')).toBeVisible();
    await expect(createBugModal.dialog.getByLabel('Description')).toBeVisible();
    await expect(createBugModal.dialog.getByRole('button', { name: 'Save' })).toBeVisible();
    await expect(createBugModal.dialog.getByRole('button', { name: 'Cancel' })).toBeVisible();
  });

  test('Default owner is current user', async ({ loginPage, boardPage }) => {
    const firstUser = users[0];
    await loginToBoard(loginPage, boardPage, firstUser);

    const createBugModal = await boardPage.openCreateBugModal();
    await expect(createBugModal.dialog.getByLabel('Owner')).toHaveValue(firstUser.username);
  });

  test('Save a new bug with valid fields', async ({ page, loginPage, boardPage }) => {
    const firstUser = users[0];
    const uniqueTitle = `Playwright bug ${Date.now()}`;
    await loginToBoard(loginPage, boardPage, firstUser);

    const createBugModal = await boardPage.openCreateBugModal();
    await createBugModal.fillTitle(uniqueTitle);
    await createBugModal.selectSeverity('high');
    await createBugModal.fillDescription('Created by Playwright automation');
    await createBugModal.save();

    await boardPage.expectBugVisible(uniqueTitle);
    await expect(page.getByRole('table', { name: 'Bugs' })).toContainText(firstUser.username);
    await expect(page.getByRole('table', { name: 'Bugs' })).toContainText('HIGH');
  });

  test('Cancel creation does not save the bug', async ({ page, loginPage, boardPage }) => {
    const firstUser = users[0];
    const title = `Cancel test ${Date.now()}`;
    await loginToBoard(loginPage, boardPage, firstUser);

    const createBugModal = await boardPage.openCreateBugModal();
    await createBugModal.fillTitle(title);
    await createBugModal.fillDescription('Should not be saved');
    await createBugModal.cancel();

    await expect(page.getByRole('table', { name: 'Bugs' })).not.toContainText(title);
  });

  test('Close modal with X button does not save the bug', async ({ page, loginPage, boardPage }) => {
    const firstUser = users[0];
    const title = `Close X test ${Date.now()}`;
    await loginToBoard(loginPage, boardPage, firstUser);

    const createBugModal = await boardPage.openCreateBugModal();
    await createBugModal.fillTitle(title);
    await createBugModal.fillDescription('Should not be saved');
    await createBugModal.close();

    await expect(page.getByRole('table', { name: 'Bugs' })).not.toContainText(title);
  });

  test('Close modal with Escape does not save the bug', async ({ page, loginPage, boardPage }) => {
    const firstUser = users[0];
    const title = `Escape test ${Date.now()}`;
    await loginToBoard(loginPage, boardPage, firstUser);

    const createBugModal = await boardPage.openCreateBugModal();
    await createBugModal.fillTitle(title);
    await createBugModal.fillDescription('Should not be saved');
    await page.keyboard.press('Escape');

    await expect(createBugModal.dialog).not.toBeVisible();
    await expect(page.getByRole('table', { name: 'Bugs' })).not.toContainText(title);
  });

  test('Required field validation blocks save', async ({ loginPage, boardPage }) => {
    const firstUser = users[0];
    await loginToBoard(loginPage, boardPage, firstUser);

    const createBugModal = await boardPage.openCreateBugModal();
    await createBugModal.dialog.getByRole('button', { name: 'Save' }).click();

    await expect(createBugModal.dialog).toBeVisible();
    await expect(createBugModal.dialog).toContainText('Title is required.');
    await expect(createBugModal.dialog).toContainText('Description is required.');
  });
});
