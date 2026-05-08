import { join } from 'upath';
import fs from 'fs-extra';

export async function readFile(
  path: string,
  file: string,
): Promise<string | null> {
  try {
    const fullPath = join(path, file);
    return await fs.readFile(fullPath, 'utf8');
  } catch {
    return null;
  }
}
