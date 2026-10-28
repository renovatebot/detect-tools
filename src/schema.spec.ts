import { Json, Toml } from './schema.ts';

describe('schema', () => {
  it('throws invalid json', () => {
    expect(() => Json.parse('{')).toThrow();
  });
  it('throws invalid toml', () => {
    expect(() => Toml.parse('{')).toThrow();
  });
});
