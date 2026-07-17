# Board Search Test Plan

## Application Overview

Explore the BuggyBoard board search behavior end to end using the seeded app state. The plan covers the visible search input, filtering by title text, expected matching rows, and the empty or cleared states observed in the UI.

## Test Scenarios

### 1. Board Search

**Seed:** `tests/seed.spec.ts`

#### 1.1. Search input filters the board by title text

**File:** `tests/search-board/search-input-filters.spec.ts`

**Steps:**
  1. Open the app at /board after the seeded login flow completes.
    - expect: The page shows the search input in the title bar with the accessible name 'Search bugs by title'.
    - expect: The search input is initially empty and the board shows the seeded bug rows.
  2. Type 'Playwright' into the search input.
    - expect: Only bugs whose titles contain 'Playwright' remain visible in the board table.
    - expect: The visible row list includes the seeded bug entries that contain that text.
  3. Type '1784304510349' into the search input.
    - expect: The board narrows to the single bug whose title contains that exact text.
    - expect: The visible table content matches that bug title and no unrelated rows are shown.

#### 1.2. Search with no matches shows the empty state

**File:** `tests/search-board/search-no-results.spec.ts`

**Steps:**
  1. Open the board and enter a query that should not match any seeded bug title, such as 'zzzz'.
    - expect: The board displays the message 'No bugs matched.'.
    - expect: No bug rows remain visible in the table.

#### 1.3. Clearing the search query restores the full board

**File:** `tests/search-board/clear-search-restores-board.spec.ts`

**Steps:**
  1. Enter a search term that narrows the board to one or more rows.
    - expect: The board updates to the filtered result set.
  2. Clear the search input by deleting the entered text.
    - expect: The search input becomes empty.
    - expect: The full seeded board list is shown again.
    - expect: The previous filtered rows are restored.
