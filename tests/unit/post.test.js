const request = require('supertest');
const app = require('../../src/app');

describe('POST /v1/fragments', () => {

  test('raw request with no auth', () =>
    request(app).post('/v1/fragments').expect(401)
  );

  test('unsupported content type', async () => {
    const res = await request(app)
      .post('/v1/fragments')
      .auth('test-user1@fragments-testing.com', 'test-password1')
      .set('Content-Type', 'video/mp4') // not supported
      .send('fake');

    expect(res.statusCode).toBe(415);
  });

  test('valid text fragment', async () => {
    const res = await request(app)
      .post('/v1/fragments')
      .auth('test-user1@fragments-testing.com', 'test-password1')
      .set('Content-Type', 'text/plain')
      .send('hello');

    expect(res.statusCode).toBe(201);
  });
});
