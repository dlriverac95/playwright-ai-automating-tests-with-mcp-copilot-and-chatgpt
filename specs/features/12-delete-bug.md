# User Story

As a BuggyBoard user,
I want to delete bugs safely,
So that I can remove bugs that are incorrect or no longer needed without accidentally deleting them.


# Design

- The "Edit bug" modal should have a "delete" button.
- Clicking the delete button should not delete the bug immediately.
- Instead, the app should open a confirmation modal that asks the user to confirm the deletion.
- The confirmation modal should provide a clear action to confirm deletion and a way to cancel.
- Confirming the deletion removes the bug from the database, closes the edit modal, and removes the bug from the board.
- Canceling the confirmation modal closes the confirmation dialog and leaves the bug in place.


# Acceptance Criteria

Scenario: Edit bug modal displays a delete button
  Given the user is authenticated into the app
  And the user is on the board page
  And there are bugs in the database
  When the user opens the edit modal for a bug
  Then the modal displays a delete button

Scenario: Clicking delete opens a confirmation modal before any deletion occurs
  Given the user is authenticated into the app
  And the user is on the board page
  And there are bugs in the database
  When the user opens the edit modal for a bug
  And the user clicks the delete button
  Then a confirmation modal is displayed
  And the bug is still present in the database
  And the edit modal remains open

Scenario: Confirming deletion removes the bug from the database and closes the modal
  Given the user is authenticated into the app
  And the user is on the board page
  And there are bugs in the database
  When the user opens the edit modal for a bug
  And the user clicks the delete button
  And the user confirms the deletion in the confirmation modal
  Then the bug is removed from the database
  And the edit modal is closed
  And the board no longer displays that bug

Scenario: Canceling deletion leaves the bug in place
  Given the user is authenticated into the app
  And the user is on the board page
  And there are bugs in the database
  When the user opens the edit modal for a bug
  And the user clicks the delete button
  And the user cancels the confirmation modal
  Then the confirmation modal is closed
  And the bug remains in the database
  And the edit modal remains open
  And the board still displays that bug

