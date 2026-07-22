# Test Automation Patterns

This file defines project-wide patterns for Playwright test automation. It is the canonical reference for how UI tests should be structured, how page objects are organized, and how tests should interact with the BuggyBoard app.

## Page object model

- All new and refactored Playwright tests must use page objects instead of long raw `page` call chains.
- Page objects belong under `tests/pages/`.
- One page object class per file.
- Page objects model UI behavior and expose expressive methods like `login`, `openCreateBugModal`, `save`, and `deleteBug`.
- Tests should stay high-level and read like user flows.

## File structure

- `tests/pages/LoginPage.ts`
- `tests/pages/BoardPage.ts`
- `tests/pages/CreateBugModal.ts`
- `tests/pages/EditBugModal.ts`

## Conventions

- The constructor accepts only a single Playwright `Page` instance.
- Locator logic lives inside the page object.
- Use stable ARIA selectors, labels, and table locators.
- Page objects should avoid domain business rules; they encapsulate UI interactions only.
- Reusable helper methods such as `expectLoaded()` and `expectBugVisible()` may be implemented in page objects.
- Tests should use page object methods and then assert results with Playwright expectations.
- Tests must not construct page objects directly inside test bodies.

## Page object fixtures

- All page object instances should be provided via Playwright fixtures, not manually constructed in tests.
- Fixture files should be saved under `tests/fixtures/`.
- Use one fixture for each page object class, following Playwright fixture patterns from https://playwright.dev/docs/test-fixtures.
- Example fixture layout:
  - `tests/fixtures/LoginPageFixture.ts`
  - `tests/fixtures/BoardPageFixture.ts`
  - `tests/fixtures/CreateBugModalFixture.ts`
  - `tests/fixtures/EditBugModalFixture.ts`
- A fixture file should extend the base Playwright `test` and expose typed page object fixtures such as `loginPage` and `boardPage`.
- Tests should import fixtures from the fixture module and receive page object instances in the test callback arguments.
- Example usage:

```ts
import { test, expect } from './fixtures/LoginPageFixture';

test('creates a bug', async ({ loginPage, boardPage }) => {
  await loginPage.goto();
  await loginPage.login('buggy', 'password');

  await boardPage.expectLoaded();
  const createBug = await boardPage.openCreateBugModal();
  await createBug.fillTitle('My bug');
  await createBug.fillDescription('Details');
  await createBug.save();

  await boardPage.expectBugVisible('My bug');
});
```

- Fixtures should use the existing Playwright `page` fixture when instantiating page objects so that all page object fixtures share the same browser context and test lifecycle.

## Recommended pattern

```ts
const loginPage = new LoginPage(page);
await loginPage.goto();
await loginPage.login('buggy', 'password');

const board = new BoardPage(page);
await board.expectLoaded();

const createBug = await board.openCreateBugModal();
await createBug.fillTitle('My bug');
await createBug.fillDescription('Details');
await createBug.save();

await board.expectBugVisible('My bug');
```

## Reference

- Playwright Page Object Model: https://playwright.dev/docs/pom
