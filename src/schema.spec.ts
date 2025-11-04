import { Json, Toml } from './schema';

describe('schema', () => {
  it('throws invalid json', async () => {
    expect(() => Json.parse('{')).toThrow();
  });
  it('throws invalid toml', async () => {
    expect(() => Toml.parse('{')).toThrow();
  });
});
