import multer, { FileFilterCallback } from 'multer';
import { Request } from 'express';

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

// Use memory storage so the StorageService abstraction handles all disk I/O.
// Swap to diskStorage directly only if the service layer becomes a bottleneck.
const storage = multer.memoryStorage();

function fileFilter(_req: Request, file: Express.Multer.File, cb: FileFilterCallback) {
  if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only JPEG, PNG, and WebP images are allowed'));
  }
}

export const uploadPhoto = multer({
  storage,
  fileFilter,
  limits: { fileSize: MAX_FILE_SIZE },
});
