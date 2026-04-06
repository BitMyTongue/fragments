// tests/unit/app.test.js

const request = require('supertest');

const app = require('../../src/app');

describe('app', () => {
  test('unknown route returns a 404', async () => {
    const res = await request(app).get('/an unknown route');

    expect(res.statusCode).toBe(404);
    expect(res.body).toEqual({
      status: 'error',
      error: {
        message: 'not found',
        code: 404,
      },
    });
  });
});
