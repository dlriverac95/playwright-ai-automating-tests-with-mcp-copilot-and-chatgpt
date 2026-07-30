# Logout Test Plan

## Overview

Cover the authenticated logout flow and the session protections that follow it. This plan targets the logout behavior described in the logout feature spec.

## Test Scenarios

### 1. Authenticated user can log out from the title bar

**Seed:** `tests/seed.spec.ts`

**Steps:**
1. Log in with a seeded user.
   - expect: The board page is visible.
2. Click the Logout button in the title bar.
   - expect: The user becomes unauthenticated.
   - expect: The app redirects to `/login`.

**File:** `tests/logout/logout-button.spec.ts`

### 2. Logged-out users cannot access protected content

**Seed:** `tests/seed.spec.ts`

**Steps:**
1. Log in and then log out.
2. Attempt to navigate directly to `/board`.
   - expect: The app redirects the user back to `/login`.

**File:** `tests/logout/protected-route.spec.ts`

### 3. Browser back navigation does not restore a prior session after logout

**Seed:** `tests/seed.spec.ts`

**Steps:**
1. Log in successfully and reach the board page.
2. Log out.
3. Use the browser back button from `/login`.
   - expect: The app does not restore the previous authenticated session.
   - expect: The user remains on the unauthenticated login view.

**File:** `tests/logout/back-button-session.spec.ts`
