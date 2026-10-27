import { BadRequestException } from '@nestjs/common';
import type { MulterOptions } from '@nestjs/platform-express/multer/interfaces/multer-options.interface.js';
import { mkdirSync } from 'node:fs';
import { randomUUID } from 'node:crypto';
import path from 'node:path';
import { diskStorage } from 'multer';
import { config } from '../config.js';

/** Images, PDFs, office documents, plain text and CAD drawings. */
export const ALLOWED_EXTENSIONS = new Set([
  '.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp', '.svg', '.heic',
  '.pdf',
  '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx', '.odt', '.ods',
  '.txt', '.csv', '.md', '.rtf',
  '.dxf', '.dwg',
]);

export function extensionOf(fileName: string): string {
  return path.extname(fileName).toLowerCase();
}

export const uploadOptions: MulterOptions = {
  storage: diskStorage({
    destination: (_req, _file, cb) => {
      mkdirSync(config.uploadsDir, { recursive: true });
      cb(null, config.uploadsDir);
    },
    filename: (_req, file, cb) => cb(null, `${randomUUID()}${extensionOf(file.originalname)}`),
  }),
  limits: { fileSize: config.maxUploadBytes, files: 1 },
  fileFilter: (_req, file, cb) => {
    if (ALLOWED_EXTENSIONS.has(extensionOf(file.originalname))) return cb(null, true);
    cb(new BadRequestException(`File type ${extensionOf(file.originalname) || '(none)'} is not allowed`), false);
  },
};
