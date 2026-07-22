# Delete Bug Test Plan

## Application Overview

Test the BuggyBoard delete-bug flow by creating fresh bugs in setup, opening the edit modal, and verifying delete behavior through the UI.

## Test Scenarios

### 1. Delete Bug

**Seed:** `tests/seed.spec.ts`

#### 1.1. Delete button appears in edit modal for a freshly created bug

**File:** `tests/delete-bug/delete-button-visible.spec.ts`

**Steps:**
  1. Log in using a seeded valid user and navigate to the board page.
    - expect: The board page is visible and the title bar contains New Bug.
  2. Create a fresh bug through the create bug modal with valid title, severity, owner, and description.
    - expect: The create bug modal closes and the new bug appears on the board.
  3. Open the edit modal for the newly created bug.
    - expect: The edit modal opens.
    - expect: The modal displays a Delete button.

#### 1.2. Deleting a fresh bug removes it from the board and closes the modal

**File:** `tests/delete-bug/delete-fresh-bug.spec.ts`

**Steps:**
  1. Log in and navigate to the board page.
    - expect: The board page is visible.
  2. Create a new bug through the UI and verify it appears on the board.
    - expect: The new bug row is visible on the board.
  3. Open the edit modal for the newly created bug.
    - expect: The edit modal opens.
  4. Click the Delete button in the edit modal.
    - expect: The modal closes.
    - expect: The deleted bug no longer appears on the board.

#### 1.3. Deleting a bug that was created during test setup does not affect other bugs

**File:** `tests/delete-bug/delete-isolated-bug.spec.ts`

**Steps:**
  1. Log in and create a fresh bug through the create bug modal.
    - expect: The new bug appears on the board.
  2. Open the edit modal for the freshly created bug and delete it.
    - expect: The modal closes after delete.
  3. Verify the deleted bug is removed from the board.
    - expect: The board no longer shows the deleted bug.
  4. Verify any other seeded bugs remain visible on the board.
    - expect: Other seeded bugs still appear on the board.
