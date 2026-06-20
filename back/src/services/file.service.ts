import { mkdir, access } from 'node:fs/promises';
import { constants } from 'node:fs';

export const fileService = {
  async ensureDirectory(dir: string) {
    try {
      await access(dir, constants.F_OK);
    } catch {
      await mkdir(dir, { recursive: true });
    }
  },
};
