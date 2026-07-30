# Authentication Test Plan

## Overview

Explore the BuggyBoard authentication journey end to end, including login form validation, redirects, and session persistence. This plan focuses on the behaviors defined in the login feature spec and the app’s current auth flow.

## Test Scenarios

### 1. Login form renders and supports the expected flow

**Seed:** `tests/seed.spec.ts`

**Steps:**
1. Open the app at `/login`.
   - expect: The login page is visible.
   - expect: The page shows a username field, a password field, and a Login button.
2. Enter valid credentials from the seeded users list.
   - expect: The user is authenticated and redirected to `/board`.
3. Refresh the page.
   - expect: The user remains authenticated and the board remains available.

**File:** `tests/authentication/login-flow.spec.ts`

### 2. Invalid credentials show the correct error state

**Seed:** `tests/seed.spec.ts`

**Steps:**
1. Open `/login` and enter a known invalid username and a password.
   - expect: The user is not authenticated.
   - expect: The page shows a generic error message indicating that the login attempt failed.
2. Repeat with a valid username and an invalid password.
   - expect: The same generic error message is shown.

**File:** `tests/authentication/invalid-credentials.spec.ts`

### 3. Blank fields show field-specific validation errors

**Seed:** `tests/seed.spec.ts`

**Steps:**
1. Open `/login` and leave the username blank while entering a password.
   - expect: The user is not authenticated.
   - expect: The page shows an error message for a blank username.
2. Enter a valid username and leave the password blank.
   - expect: The user is not authenticated.
   - expect: The page shows an error message for a blank password.
3. Leave both fields blank and submit.
   - expect: The user is not authenticated.
   - expect: The page shows a missing-credentials error message.

**File:** `tests/authentication/blank-fields.spec.ts`

### 4. Authentication redirects protect board routes

**Seed:** `tests/seed.spec.ts`

**Steps:**
1. Open the app without authenticating.
   - expect: Visiting `/board` redirects the user to `/login`.
2. Authenticate successfully.
   - expect: The board page loads at `/board`.
3. Log out or clear the session.
   - expect: Direct navigation back to `/board` again redirects the user to `/login`.

**File:** `tests/authentication/redirects.spec.ts`

### 5. Whitespace in the username is trimmed on login

**Seed:** `tests/seed.spec.ts`

**Steps:**
1. Open `/login` and enter a valid username with leading or trailing whitespace.
2. Submit the form with the correct password.
   - expect: Login succeeds.
   - expect: The user is authenticated as the trimmed username.

**File:** `tests/authentication/trimmed-username.spec.ts`
