import { readFile } from './fs.ts';

describe('fs', () => {
  it('returns null for non-exitent file', async () => {
    expect(
      await readFile('some-random-path', 'some-random-file.txt'),
    ).toBeNull();
  });
});
