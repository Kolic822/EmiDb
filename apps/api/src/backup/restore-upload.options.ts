import { BadRequestException } from '@nestjs/common';
import type { MulterOptions } from '@nestjs/platform-express/multer/interfaces/multer-options.interface.js';
import { randomUUID } from 'node:crypto';
import { mkdirSync } from 'node:fs';
import path from 'node:path';
import { diskStorage } from 'multer';
import { config } from '../config.js';

/** Backups can be much bigger than a single attachment, so they get their own limit and a scratch folder. */
export const restoreUploadOptions: MulterOptions = {
  storage: diskStorage({
    destination: (_req, _file, cb) => {
      const dir = path.join(config.dataDir, 'restore-uploads');
      mkdirSync(dir, { recursive: true });
      cb(null, dir);
    },
    filename: (_req, _file, cb) => cb(null, `${randomUUID()}.zip`),
  }),
  limits: { fileSize: config.maxRestoreBytes, files: 1 },
  fileFilter: (_req, file, cb) => {
    if (path.extname(file.originalname).toLowerCase() === '.zip') return cb(null, true);
    cb(new BadRequestException('A backup is a .zip file'), false);
  },
};
