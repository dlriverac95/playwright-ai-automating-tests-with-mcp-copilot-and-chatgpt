# Board State and Severity Test Plan

## Overview

Explore board-level behaviors that influence how users scan and filter bugs, including the state filter controls, the severity badges, and the visual distinction between severities. These flows are not yet covered by the existing automated specs.

## Test Scenarios

### 1. Open and Closed state filters change the visible bug list

**Seed:** `tests/seed.spec.ts`

**Steps:**
1. Log in and open the board.
   - expect: The board shows the state filter group with Open and Closed buttons.
2. Click Closed.
   - expect: The visible table updates to only show bugs whose state is Closed.
3. Click Open again.
   - expect: The table returns to the open-bug view.

**File:** `tests/board/state-filter.spec.ts`

### 2. Severity badges render with the expected labels and styling

**Seed:** `tests/seed.spec.ts`

**Steps:**
1. Open the board with seeded bugs present.
   - expect: Each severity value is rendered as a badge in the table.
2. Confirm that HIGH, MID, and LOW appear with the appropriate visible styling and distinct visual treatment.
   - expect: The badges remain visibly distinct from one another.

**File:** `tests/board/severity-badges.spec.ts`

### 3. Severity styling uses the board’s design tokens

**Seed:** `tests/seed.spec.ts`

**Steps:**
1. Open the board page.
2. Inspect the severity badge elements in the DOM.
   - expect: The badges use the shared severity CSS classes or design tokens expected by the UI.
3. Confirm that the high, mid, and low severity styles are applied consistently.

**File:** `tests/board/severity-tokens.spec.ts`
