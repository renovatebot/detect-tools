export function mockFs(
  module: typeof import('./fs'),
  files: Record<string, string>,
) {
  const fsMod = module as jest.Mocked<typeof module>;
  const fsData = new Map<string, string>(Object.entries(files));

  const readFile = (path: string, file: string): Promise<string | null> => {
    const fullPath = `${path}/${file}`;
    const res = fsData.get(fullPath) || null;
    return Promise.resolve(res);
  };

  fsMod.readFile.mockImplementation(readFile);
}
