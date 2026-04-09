const request = require('supertest');
const app = require('../../src/app');

describe('PUT /v1/fragments/:id', () => {

  test('raw request with no auth', () =>
    request(app).put('/v1/fragments/anything').expect(401)
  );

  test('update fragment that doesn\'t exist', async () => {
    const res = await request(app)
      .put('/v1/fragments/not-real')
      .auth('test-user1@fragments-testing.com', 'test-password1')
      .set('Content-Type', 'text/plain')
      .send('updated text');

    expect(res.statusCode).toBe(404);
  });

  test('update an existing fragment', async () => {
    const postRes = await request(app)
      .post('/v1/fragments')
      .auth('test-user1@fragments-testing.com', 'test-password1')
      .set('Content-Type', 'text/plain')
      .send('abc');

    const id = postRes.body.fragment.id;

    const putRes = await request(app)
      .put(`/v1/fragments/${id}`)
      .auth('test-user1@fragments-testing.com', 'test-password1')
      .set('Content-Type', 'text/plain')
      .send('updated');

    expect(putRes.statusCode).toBe(200);

    const getRes = await request(app)
      .get(`/v1/fragments/${id}`)
      .auth('test-user1@fragments-testing.com', 'test-password1');

    expect(getRes.statusCode).toBe(200);
    expect(getRes.text).toBe('updated');
  });

  test('deny update if credentials don\'t match', async () => {
    const postRes = await request(app)
      .post('/v1/fragments')
      .auth('test-user1@fragments-testing.com', 'test-password1')
      .set('Content-Type', 'text/plain')
      .send('abc');

    const id = postRes.body.fragment.id;

    const putRes = await request(app)
      .put(`/v1/fragments/${id}`)
      .auth('wrongUser@email.com', 'wrongUserPassword')
      .set('Content-Type', 'text/plain')
      .send('updated');

    expect(putRes.statusCode).toBe(401);
  });

});