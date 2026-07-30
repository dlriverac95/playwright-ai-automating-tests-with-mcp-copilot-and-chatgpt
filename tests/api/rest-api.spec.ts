import { test, expect, type APIRequestContext } from '@playwright/test';

const API_BASE_URL = process.env.API_BASE_URL ?? 'http://localhost:3000';

function uniqueSuffix() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

async function createBug(request: APIRequestContext, overrides: Record<string, unknown> = {}) {
  const title = `api-${uniqueSuffix()}`;
  const payload = {
    title,
    severity: 'high',
    owner: 'buggy',
    description: 'created by Playwright API test',
    ...overrides,
  };

  const response = await request.post(`${API_BASE_URL}/api/bugs`, { data: payload });
  const body = await response.json();
  return { response, body, payload };
}

async function deleteBug(request: APIRequestContext, id: number) {
  return request.delete(`${API_BASE_URL}/api/bugs/${id}`);
}

test.describe('BuggyBoard REST API', () => {
  test('GET /api/health returns the API status', async ({ request }) => {
    const response = await request.get(`${API_BASE_URL}/api/health`);

    expect(response.status()).toBe(200);

    const body = await response.json();
    expect(body).toEqual(
      expect.objectContaining({
        ok: true,
        message: 'BuggyBoard API is running',
      })
    );
    expect(typeof body.database).toBe('string');
  });

  test('POST /api/login succeeds with valid credentials', async ({ request }) => {
    const response = await request.post(`${API_BASE_URL}/api/login`, {
      data: { username: 'buggy', password: '1970beetle' },
    });

    expect(response.status()).toBe(200);
    await expect(response.json()).resolves.toEqual({ username: 'buggy' });
  });

  test('POST /api/login rejects missing credentials', async ({ request }) => {
    const response = await request.post(`${API_BASE_URL}/api/login`, {
      data: { username: '', password: '' },
    });

    expect(response.status()).toBe(400);
    await expect(response.json()).resolves.toEqual({
      error: 'missing_credentials',
      message: 'Please enter your username and password.',
    });
  });

  test('POST /api/login rejects invalid credentials', async ({ request }) => {
    const response = await request.post(`${API_BASE_URL}/api/login`, {
      data: { username: 'buggy', password: 'wrong-password' },
    });

    expect(response.status()).toBe(401);
    await expect(response.json()).resolves.toEqual({
      error: 'invalid_credentials',
      message: 'Invalid username or password.',
    });
  });

  test('GET /api/bugs returns an array of bugs', async ({ request }) => {
    const response = await request.get(`${API_BASE_URL}/api/bugs`);

    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(Array.isArray(body)).toBeTruthy();
    if (body.length > 0) {
      expect(body[0]).toEqual(
        expect.objectContaining({
          id: expect.any(Number),
          title: expect.any(String),
          severity: expect.any(String),
          owner: expect.any(String),
          description: expect.any(String),
          state: expect.any(String),
        })
      );
    }
  });

  test('GET /api/bugs/:id returns a stored bug', async ({ request }) => {
    const created = await createBug(request);
    const bugId = created.body.id;

    try {
      const response = await request.get(`${API_BASE_URL}/api/bugs/${bugId}`);
      expect(response.status()).toBe(200);
      await expect(response.json()).resolves.toEqual(
        expect.objectContaining({
          id: bugId,
          title: created.payload.title,
          severity: 'HIGH',
          owner: 'buggy',
          description: 'created by Playwright API test',
          state: 'OPEN',
        })
      );
    } finally {
      await deleteBug(request, bugId);
    }
  });

  test('GET /api/bugs/:id rejects non-numeric ids', async ({ request }) => {
    const response = await request.get(`${API_BASE_URL}/api/bugs/not-a-number`);

    expect(response.status()).toBe(400);
    await expect(response.json()).resolves.toEqual({
      error: 'invalid_id',
      message: 'Bug ID must be a number.',
    });
  });

  test('GET /api/bugs/:id returns 404 for unknown bugs', async ({ request }) => {
    const response = await request.get(`${API_BASE_URL}/api/bugs/999999`);

    expect(response.status()).toBe(404);
    await expect(response.json()).resolves.toEqual({
      error: 'not_found',
      message: 'Bug not found.',
    });
  });

  test('POST /api/bugs creates a bug with OPEN state', async ({ request }) => {
    const created = await createBug(request, {
      title: `create-${uniqueSuffix()}`,
      severity: 'low',
      owner: 'vanny',
      description: 'created for coverage',
    });
    const bugId = created.body.id;

    try {
      expect(created.response.status()).toBe(201);
      await expect(created.response.json()).resolves.toEqual(
        expect.objectContaining({
          id: bugId,
          title: created.payload.title,
          severity: 'LOW',
          owner: 'vanny',
          description: 'created for coverage',
          state: 'OPEN',
        })
      );

      const followUp = await request.get(`${API_BASE_URL}/api/bugs/${bugId}`);
      expect(followUp.status()).toBe(200);
      await expect(followUp.json()).resolves.toEqual(
        expect.objectContaining({
          id: bugId,
          state: 'OPEN',
        })
      );
    } finally {
      await deleteBug(request, bugId);
    }
  });

  test('POST /api/bugs rejects blank title', async ({ request }) => {
    const response = await request.post(`${API_BASE_URL}/api/bugs`, {
      data: {
        title: '   ',
        severity: 'high',
        owner: 'buggy',
        description: 'invalid title',
      },
    });

    expect(response.status()).toBe(400);
    await expect(response.json()).resolves.toEqual({
      error: 'blank_title',
      message: 'Title is required.',
    });
  });

  test('POST /api/bugs rejects invalid severity', async ({ request }) => {
    const response = await request.post(`${API_BASE_URL}/api/bugs`, {
      data: {
        title: 'bad severity',
        severity: 'urgent',
        owner: 'buggy',
        description: 'invalid severity',
      },
    });

    expect(response.status()).toBe(400);
    await expect(response.json()).resolves.toEqual({
      error: 'blank_severity',
      message: 'Severity is required (high, mid, or low).',
    });
  });

  test('PUT /api/bugs/:id updates an existing bug', async ({ request }) => {
    const created = await createBug(request, {
      title: `update-${uniqueSuffix()}`,
      severity: 'high',
      owner: 'buggy',
      description: 'before update',
    });
    const bugId = created.body.id;

    try {
      const response = await request.put(`${API_BASE_URL}/api/bugs/${bugId}`, {
        data: {
          title: 'updated title',
          severity: 'mid',
          owner: 'vanny',
          description: 'after update',
          state: 'closed',
        },
      });

      expect(response.status()).toBe(200);
      await expect(response.json()).resolves.toEqual(
        expect.objectContaining({
          id: bugId,
          title: 'updated title',
          severity: 'MID',
          owner: 'vanny',
          description: 'after update',
          state: 'CLOSED',
        })
      );

      const followUp = await request.get(`${API_BASE_URL}/api/bugs/${bugId}`);
      expect(followUp.status()).toBe(200);
      await expect(followUp.json()).resolves.toEqual(
        expect.objectContaining({
          title: 'updated title',
          state: 'CLOSED',
        })
      );
    } finally {
      await deleteBug(request, bugId);
    }
  });

  test('PUT /api/bugs/:id rejects invalid state values', async ({ request }) => {
    const created = await createBug(request, {
      title: `state-${uniqueSuffix()}`,
      severity: 'low',
      owner: 'buggy',
      description: 'state validation',
    });
    const bugId = created.body.id;

    try {
      const response = await request.put(`${API_BASE_URL}/api/bugs/${bugId}`, {
        data: {
          title: 'still valid',
          severity: 'mid',
          owner: 'buggy',
          description: 'stay open',
          state: 'in-progress',
        },
      });

      expect(response.status()).toBe(400);
      await expect(response.json()).resolves.toEqual({
        error: 'invalid_state',
        message: 'State must be Open or Closed.',
      });
    } finally {
      await deleteBug(request, bugId);
    }
  });

  test('DELETE /api/bugs/:id removes an existing bug', async ({ request }) => {
    const created = await createBug(request, {
      title: `delete-${uniqueSuffix()}`,
    });
    const bugId = created.body.id;

    const deleteResponse = await deleteBug(request, bugId);
    expect(deleteResponse.status()).toBe(204);

    const followUp = await request.get(`${API_BASE_URL}/api/bugs/${bugId}`);
    expect(followUp.status()).toBe(404);
    await expect(followUp.json()).resolves.toEqual({
      error: 'not_found',
      message: 'Bug not found.',
    });
  });

  test('DELETE /api/bugs/:id returns 404 for unknown bugs', async ({ request }) => {
    const response = await request.delete(`${API_BASE_URL}/api/bugs/999999`);

    expect(response.status()).toBe(404);
    await expect(response.json()).resolves.toEqual({
      error: 'not_found',
      message: 'Bug not found.',
    });
  });
});
