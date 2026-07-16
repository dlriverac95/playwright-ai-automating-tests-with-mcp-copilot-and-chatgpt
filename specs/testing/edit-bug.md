# Playwright MCP Test Plan: Edit and Close Bug

## Overview

This plan covers end-to-end BuggyBoard flows for editing an existing bug and testing close-without-save behavior. It follows the existing repo test style with clear exploration notes, assumptions, and independent scenarios.

### Seed
- `tests/seed.spec.ts`

## Assumptions

- App is accessible at `/board`
- User can log in via seeded credentials
- `tests/seed.spec.ts` is available to prepare the app state and authenticated session
- The board page exposes bug rows as table rows
- Clicking a bug row opens the edit modal
- The edit modal title is `Edit bug #<id>`
- Edit modal fields:
  - `ID` (read-only)
  - `Title`
  - `Severity` (`HIGH`, `MID`, `LOW`)
  - `State` (`Open`, `Closed`)
  - `Owner`
  - `Description`
- Edit modal actions:
  - `Save`
  - `Cancel`
  - `Delete`
  - Close icon `×`
- Save is disabled with no changes or when required fields are blank
- Clicking the modal backdrop does not dismiss the modal

## Seed / Starting State

- Use `tests/seed.spec.ts` to initialize the app with known users and bugs
- Start each scenario from a fresh seeded state
- Prefer a known existing bug row such as:
  - `ID 1`
  - `Title: E2E test bug ...`
  - `Severity: HIGH`
  - `Owner: buggy`

## Exploration Notes

1. Navigate to the board page after login.
2. Confirm the title bar contains:
   - `BuggyBoard`
   - `Search bugs by title`
   - `New Bug`
   - `Logout`
3. Locate a bug row by visible text in the board table.
4. Click the bug row to open the edit modal.
5. Confirm the modal title is `Edit bug #<id>`.
6. Verify modal fields and controls:
   - `ID` is present and read-only
   - `Title` is editable
   - `Severity` is a select control
   - `State` is a select control
   - `Owner` is editable
   - `Description` is editable
   - `Delete`, `Cancel`, and `Save` buttons exist
   - Close icon `×` exists
7. Inspect field selectors and DOM attributes for stable Playwright interaction:
   - `#edit-bug-id`
   - `#edit-bug-title`
   - `#edit-bug-severity`
   - `#edit-bug-state`
   - `#edit-bug-owner`
   - `#edit-bug-description`
8. Confirm the save button is initially disabled when the modal opens.
9. Confirm the modal remains open when clicking the backdrop.
10. Confirm `Escape` and `×` behave like `Cancel`.

## Test Scenarios

### 1. Open edit modal from board row
- Start from the seeded board page
- Click a known bug row
- Expect the modal with title `Edit bug #<id>`
- Expect fields: `ID`, `Title`, `Severity`, `State`, `Owner`, `Description`
- Expect buttons: `Save`, `Cancel`, `Delete`, and close `×`

### 2. Edit a bug and save changes
- Open the edit modal for a seeded bug
- Change one or more editable fields:
  - `Title`
  - `Severity`
  - `State`
  - `Owner`
  - `Description`
- Confirm the save button becomes enabled after change
- Click `Save`
- Expect the modal to close
- Verify the board row updates with the modified fields
- Confirm the changed bug persists after board refresh or page reload if relevant

### 3. Close edit modal with Cancel without saving
- Open the edit modal
- Modify a field such as `Title` or `Description`
- Click `Cancel`
- Expect the modal to close
- Verify the board row still shows the original bug values
- Re-open the same bug and confirm the original values remain unchanged

### 4. Close edit modal with X without saving
- Open the edit modal
- Modify at least one field
- Click the close icon `×`
- Expect the modal to close
- Verify no changes were saved to the board row
- Re-open the same bug and confirm values are unchanged

### 5. Close edit modal with Escape without saving
- Open the edit modal
- Modify at least one field
- Press `Escape`
- Expect the modal to close
- Verify the bug row remains unchanged
- Re-open the same bug and confirm the edit was discarded

### 6. Backdrop click does not dismiss modal
- Open the edit modal
- Modify one or more fields
- Click on the dimmed backdrop area outside the modal
- Expect the modal to remain open
- Confirm field edits are still present in the modal

### 7. Save remains disabled when no changes are made
- Open the edit modal
- Do not change any field
- Confirm the `Save` button is disabled
- Verify the user cannot save without modifications

### 8. Save is disabled when required fields are blank
- Open the edit modal
- Clear one required field at a time:
  - `Title`
  - `Severity`
  - `Owner`
  - `Description`
- Confirm the `Save` button becomes disabled for each blank required field
- Attempting to save should not persist changes
- Confirm the modal remains open and the user is prevented from saving

## Board Behavior Verification

- After saving, the row should immediately reflect updated bug data.
- After canceling or closing without saving, the board row should remain unchanged.
- Verify that saving an edit does not create a duplicate bug.
- Verify that closing without saving does not change API data.
- If the app supports filtering by state, verify the bug remains in the expected filter view after edit/save.

## Notes for Playwright Exploration

- Use accessible selectors first: role + name, label text, and visible row text.
- Use the modal field IDs discovered in the DOM for stable input and select interaction.
- Validate both UI state and persistence:
  - modal closes
  - row content updates
  - no duplicate rows appear
- Use `tests/seed.spec.ts` as setup when possible to avoid brittle state assumptions.
- If test setup cannot rely on seed data, create a bug through the app UI first, then edit that bug in the same scenario.
