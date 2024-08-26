import { join } from 'upath';
import { readFile as fsReadFile } from 'fs-extra';

export async function readFile(
  path: string,
  file: string,
): Promise<string | null> {
  try {
    const fullPath = join(path, file);
    return await fsReadFile(fullPath, 'utf8');
  } catch (_) {
    return null;
  }
}
