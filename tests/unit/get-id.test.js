const request = require('supertest');
const app = require('../../src/app');

describe('GET /v1/fragments/:id', () => {

  test('raw request with no auth', () =>
    request(app).get('/v1/fragments/anything').expect(401)
  );

  test('get fragment that doesn\'t exist', async () => {
    const res = await request(app)
      .get('/v1/fragments/not-real')
      .auth('test-user1@fragments-testing.com', 'test-password1');

    expect(res.statusCode).toBe(404);
  });

  test('get an existing fragment', async () => {
    // create fragment
    const postRes = await request(app)
      .post('/v1/fragments')
      .auth('test-user1@fragments-testing.com', 'test-password1')
      .set('Content-Type', 'text/plain')
      .send('abc');

    const id = postRes.body.fragment.id;

    // get it (with auth)
    const getRes = await request(app)
      .get(`/v1/fragments/${id}`)
      .auth('test-user1@fragments-testing.com', 'test-password1');

    expect(getRes.statusCode).toBe(200);
  });

  test('deny access to fragment if credentials don\'t match', async () => {
    // create fragment
    const postRes = await request(app)
      .post('/v1/fragments')
      .auth('test-user1@fragments-testing.com', 'test-password1')
      .set('Content-Type', 'text/plain')
      .send('abc');

    const id = postRes.body.fragment.id;

    // get but with invalid auth
    const getRes = await request(app)
      .get(`/v1/fragments/${id}`)
      .auth('wrongUser@email.com', 'wrongUserPassword');

    expect(getRes.statusCode).toBe(401);
  });
});
