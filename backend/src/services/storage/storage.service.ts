import crypto from 'crypto';
import path from 'path';
import fs from 'fs/promises';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const UPLOADS_DIR = path.resolve(__dirname, '../../../../uploads/photos');

export interface SavedFile {
  storageKey: string;
  originalUrl: string;
  thumbnailUrl: string | null;
}

export interface StorageService {
  save(filename: string, buffer: Buffer, mimeType: string): Promise<SavedFile>;
  delete(storageKey: string): Promise<void>;
}

async function ensureDir(dir: string): Promise<void> {
  try {
    await fs.mkdir(dir, { recursive: true });
  } catch {
    // directory already exists
  }
}

function generateStorageKey(originalFilename: string): string {
  const ext = path.extname(originalFilename) || '.jpg';
  return `${crypto.randomUUID()}${ext}`;
}

export const diskStorage: StorageService = {
  async save(filename: string, buffer: Buffer, mimeType: string): Promise<SavedFile> {
    await ensureDir(UPLOADS_DIR);
    const storageKey = generateStorageKey(filename);
    const filePath = path.join(UPLOADS_DIR, storageKey);
    await fs.writeFile(filePath, buffer);
    const originalUrl = `/uploads/photos/${storageKey}`;
    return { storageKey, originalUrl, thumbnailUrl: null };
  },

  async delete(storageKey: string): Promise<void> {
    const filePath = path.join(UPLOADS_DIR, storageKey);
    try {
      await fs.unlink(filePath);
    } catch {
      // file already removed
    }
  },
};
