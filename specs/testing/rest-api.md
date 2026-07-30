# BuggyBoard REST API Test Plan

## Overview
This plan covers the BuggyBoard backend HTTP endpoints implemented in the Express server. It focuses on request/response behavior, status codes, validation, and persistence for the REST API surface.

## Scope
The plan covers these endpoints:
- `GET /api/health`
- `POST /api/login`
- `GET /api/bugs`
- `GET /api/bugs/:id`
- `POST /api/bugs`
- `PUT /api/bugs/:id`
- `DELETE /api/bugs/:id`

## Test assumptions
- The backend is running locally on `http://localhost:3000`.
- The API uses JSON request bodies and JSON responses.
- Seeded users are available from the backend user data, including `buggy` / `1970beetle`.
- Bug creation and update validation is enforced by the backend service layer.
- Bug IDs are numeric and persisted in the SQLite-backed bug store.

## Suggested test data
- Valid login: `username=buggy`, `password=1970beetle`
- Valid bug payload:
  - `title: "API regression bug"`
  - `severity: "high"`
  - `owner: "buggy"`
  - `description: "Regression from API test plan"`
- Valid update payload:
  - `title: "Updated API bug"`
  - `severity: "mid"`
  - `owner: "vanny"`
  - `description: "Updated via API"`
  - `state: "closed"`

## Endpoint test cases

### 1. `GET /api/health`
#### Positive cases
- Verify the endpoint returns `200 OK`.
- Verify the response body contains:
  - `ok: true`
  - `message: "BuggyBoard API is running"`
  - `database` set to either `connected` or `error`.

#### Negative cases
- Simulate a database failure and verify the API still responds with `200 OK`, while `database` reports `error`.
- Verify the endpoint does not require authentication or request body data.

### 2. `POST /api/login`
#### Positive cases
- Submit valid credentials and verify `200 OK`.
- Verify the response body returns the trimmed username, for example `{ "username": "buggy" }`.

#### Negative cases
- Submit an empty username and empty password and verify `400 Bad Request` with:
  - `error: "missing_credentials"`
- Submit a blank username and a non-empty password and verify `400 Bad Request` with:
  - `error: "blank_username"`
- Submit a non-empty username and a blank password and verify `400 Bad Request` with:
  - `error: "blank_password"`
- Submit a valid username with the wrong password and verify `401 Unauthorized` with:
  - `error: "invalid_credentials"`
- Submit a username that does not exist and verify `401 Unauthorized` with the same invalid credentials error.

### 3. `GET /api/bugs`
#### Positive cases
- Verify the endpoint returns `200 OK`.
- Verify the response body is an array of bug objects.
- Verify each returned bug includes `id`, `title`, `severity`, `owner`, `description`, and `state`.
- If bugs already exist, verify the list is returned in ascending ID order.

#### Negative cases
- When the database has no bugs, verify the endpoint returns an empty array `[]` rather than an error.
- If the database becomes unavailable during the request, verify the API surfaces the underlying failure rather than returning a misleading success payload.

### 4. `GET /api/bugs/:id`
#### Positive cases
- Submit a valid bug ID and verify `200 OK`.
- Verify the response body matches the stored bug data for that ID.

#### Negative cases
- Submit a non-numeric ID such as `abc` and verify `400 Bad Request` with:
  - `error: "invalid_id"`
- Submit an ID that does not exist and verify `404 Not Found` with:
  - `error: "not_found"`

### 5. `POST /api/bugs`
#### Positive cases
- Submit a valid bug payload and verify `201 Created`.
- Verify the response body contains the persisted bug with:
  - a generated numeric `id`
  - `severity` stored as uppercase (`HIGH`, `MID`, or `LOW`)
  - `state: "OPEN"`
- Verify the bug is retrievable through `GET /api/bugs/:id` after creation.

#### Negative cases
- Submit a payload with a blank title and verify `400 Bad Request` with:
  - `error: "blank_title"`
- Submit a payload with an invalid severity such as `urgent` and verify `400 Bad Request` with:
  - `error: "blank_severity"`
- Submit a payload with a blank owner and verify `400 Bad Request` with:
  - `error: "blank_owner"`
- Submit a payload with a blank description and verify `400 Bad Request` with:
  - `error: "blank_description"`
- Submit values that are only whitespace and verify they are treated as missing values and rejected with the same validation errors.

### 6. `PUT /api/bugs/:id`
#### Positive cases
- Submit a valid update payload for an existing bug and verify `200 OK`.
- Verify the response body contains the updated bug values.
- Verify the updated bug is returned by `GET /api/bugs/:id` after the change.

#### Negative cases
- Submit a non-numeric ID and verify `400 Bad Request` with:
  - `error: "invalid_id"`
- Submit an ID that does not exist and verify `404 Not Found` with:
  - `error: "not_found"`
- Submit an update with a blank title and verify `400 Bad Request` with:
  - `error: "blank_title"`
- Submit an update with an invalid severity and verify `400 Bad Request` with:
  - `error: "blank_severity"`
- Submit an update with a blank owner and verify `400 Bad Request` with:
  - `error: "blank_owner"`
- Submit an update with a blank description and verify `400 Bad Request` with:
  - `error: "blank_description"`
- Submit an update with an invalid state such as `in-progress` and verify `400 Bad Request` with:
  - `error: "invalid_state"`
- Submit a payload that omits required fields and verify the backend rejects it with the appropriate validation response.

### 7. `DELETE /api/bugs/:id`
#### Positive cases
- Delete an existing bug and verify `204 No Content`.
- Verify the bug can no longer be retrieved by `GET /api/bugs/:id` after deletion.
- Verify the bug is removed from `GET /api/bugs`.

#### Negative cases
- Submit a non-numeric ID and verify `400 Bad Request` with:
  - `error: "invalid_id"`
- Submit an ID that does not exist and verify `404 Not Found` with:
  - `error: "not_found"`

## Notes for implementation
- Prefer isolated, independent tests so each scenario starts from a known state.
- Create or delete bugs within each test case to avoid cross-test contamination.
- Assert both status code and response body, especially for validation failures.
- Capture the exact error codes returned by the backend so the tests remain aligned with the current implementation.
