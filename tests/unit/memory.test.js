const {
  writeFragment,
  readFragment,
  writeFragmentData,
  readFragmentData,
  listFragments,
  deleteFragment,
} = require('../../src/model/data/memory');

describe('memory data storage', () => {
  test('writeFragment and readFragment', async () => {
    const fragment = {
      id: '123',
      ownerId: 'testUser',
      created: new Date().toISOString(),
      updated: new Date().toISOString(),
      type: 'text/plain',
      size: 0,
    };

    await writeFragment(fragment);
    const result = await readFragment('testUser', '123');

    expect(result.id).toBe('123');
  });

  test('writeFragmentData and readFragmentData', async () => {
    const data = Buffer.from('hello');

    await writeFragmentData('testUser', '123', data);
    const result = await readFragmentData('testUser', '123');

    expect(Buffer.isBuffer(result)).toBe(true);
  });

  test('listFragments() returns ids', async () => {
    const ownerId = 'listFragmentUser';

    await writeFragment({
      id: '321',
      ownerId,
      created: new Date().toISOString(),
      updated: new Date().toISOString(),
      type: 'text/plain',
      size: 0,
    });

    const ids = await listFragments(ownerId);
    expect(ids).toEqual(['321']);
  });

  test('deleteFragment() removes metadata and data from memory', async () => {
    const ownerId = 'testDeleteUser';
    const id = '6767';

    await writeFragment({
      id,
      ownerId,
      created: new Date().toISOString(),
      updated: new Date().toISOString(),
      type: 'text/plain',
      size: 3,
    });

    await writeFragmentData(ownerId, id, Buffer.from(''));

    await deleteFragment(ownerId, id);

    // should be gone now
    expect(await readFragment(ownerId, id)).toBeFalsy();
    expect(await readFragmentData(ownerId, id)).toBeFalsy();
  });
});
