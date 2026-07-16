# Playwright MCP Test Plan: Create Bug

## Overview
This test plan covers end-to-end flows for creating a new bug in the BuggyBoard application. It uses Playwright MCP-style exploratory testing to validate the create-bug modal, form validation, save/cancel behavior, and bug persistence.

## Test Scope
- Opening the create bug modal from the board page
- Verifying modal fields: title, severity, owner, description
- Validating default owner behavior
- Creating a bug and confirming it appears in the bug board
- Canceling creation via Cancel button, close icon, and Escape key
- Ensuring required-field validation blocks save for blank fields
- Confirming clicking the modal backdrop does not close the modal

## Assumptions
- User can log in via `/login`
- The board page is accessible at `/board`
- The app uses a `New Bug` button in the title bar to open the modal
- Severity dropdown values are `HIGH`, `MID`, `LOW`
- Severity is displayed on the board in all caps and with color-coded styling

## Exploration Notes
1. Start by logging in with a seeded valid user.
2. Navigate to `/board` and verify the `New Bug` button is visible in the title bar.
3. Open the new bug modal and confirm the presence of title, severity, owner, description, Save, and Cancel controls.
4. Inspect default field values, especially owner and severity.
5. Enter valid values and save the bug, then confirm the modal closes and the new bug is present in the board table with correct values.
6. Repeat with different severity values to validate UI and board display text.
7. Open the modal again, enter partial data, then try canceling via Cancel, the X button, and Escape. Confirm no bug is created.
8. Test that clicking outside the modal does not close it and that field values remain.
9. Remove required values one by one and confirm validation prevents save.

## Suite: Create Bug

### Seed
- `test/seed.spec.ts`
 
## Test Cases

### 1. Open create bug modal from board page
- Given the user is logged in
- When the user navigates to `/board`
- Then the `New Bug` button is visible in the title bar
- When the user clicks `New Bug`
- Then the create bug modal opens
- And the modal includes fields for title, severity, owner, description
- And the modal includes Save and Cancel buttons

### 2. Default owner is current user
- Given the user is logged in as `alice`
- When the user opens the create bug modal
- Then the owner field is pre-filled with `alice`

### 3. Save a new bug with valid fields
- Given the user is logged in and on `/board`
- When the user opens the create bug modal
- And enters a title, selects `HIGH` severity, enters a description, and leaves or confirms the owner
- And clicks Save
- Then the modal closes
- And the new bug is saved and visible in the bug board table
- And the board row shows the title, owner, and severity in all caps

### 4. Cancel creation does not save
- Given the user opens the create bug modal and enters some data
- When the user clicks Cancel
- Then the modal closes
- And no new bug appears on the board

### 5. Close modal with X button does not save
- Given the user opens the create bug modal and enters some data
- When the user clicks the X button
- Then the modal closes
- And no new bug appears on the board

### 6. Close modal with Escape does not save
- Given the user opens the create bug modal and enters some data
- When the user presses Escape
- Then the modal closes
- And no new bug appears on the board

### 7. Backdrop click does not dismiss modal
- Given the create bug modal is open
- When the user clicks outside the modal backdrop
- Then the modal remains open
- And entered values remain in the modal fields

### 8. Required field validation blocks save
- Given the create bug modal is open
- When the user leaves a required field blank and clicks Save
- Then the modal remains open
- And the user is shown validation errors for required fields
- And the bug is not saved

### 9. Required fields individually enforced
- Given the create bug modal is open
- When the user leaves the `title` field blank and fills in other fields
- Then Save is blocked
- Repeat for `severity`, `owner`, and `description`

## Notes for Playwright MCP Exploration
- Use JavaScript or TypeScript selectors based on form labels and button text for stable interaction.
- Capture the modal DOM structure and ensure controls are keyboard accessible.
- Observe whether the form submission is asynchronous and if the board refreshes automatically after save.
- Confirm if the owner defaults to the logged-in user and if the severity dropdown values are displayed in uppercase.
- If any required-field validation is client-side only, note whether the backend API also rejects invalid bug creation.

## Output
Save this plan to `specs/testing/create-bug.md` and use it as the basis for implementing Playwright end-to-end tests.
