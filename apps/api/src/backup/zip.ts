import { createWriteStream } from 'node:fs';
import { mkdir } from 'node:fs/promises';
import path from 'node:path';
import { pipeline } from 'node:stream/promises';
import yauzl from 'yauzl';

/** A backup contains exactly these entries; anything else (or a path trick) is refused. */
const UPLOAD_ENTRY = /^uploads\/([A-Za-z0-9][A-Za-z0-9._-]*)$/;

export interface Extracted {
  database: boolean;
  files: number;
}

/**
 * Streams a backup zip into `destination`: `emidb.db` at the top and uploaded files under `uploads/`.
 * Entry names are matched against a strict pattern, so nothing can be written outside `destination`.
 */
export function extractBackup(zipFile: string, destination: string): Promise<Extracted> {
  return new Promise((resolve, reject) => {
    yauzl.open(zipFile, { lazyEntries: true, autoClose: true }, (openError, zip) => {
      if (openError) return reject(new Error('That file is not a valid backup zip'));
      const result: Extracted = { database: false, files: 0 };
      const fail = (error: unknown) => {
        zip.close();
        reject(error);
      };

      zip.on('error', fail);
      zip.on('end', () => resolve(result));
      zip.on('entry', (entry: yauzl.Entry) => {
        const name = entry.fileName;
        const target = name === 'emidb.db' ? 'emidb.db' : UPLOAD_ENTRY.test(name) ? name : null;
        if (!target) return zip.readEntry(); // manifest, folders, unknown entries
        zip.openReadStream(entry, (streamError, stream) => {
          if (streamError) return fail(streamError);
          const out = path.join(destination, target);
          mkdir(path.dirname(out), { recursive: true })
            .then(() => pipeline(stream, createWriteStream(out)))
            .then(() => {
              if (target === 'emidb.db') result.database = true;
              else result.files += 1;
              zip.readEntry();
            })
            .catch(fail);
        });
      });
      zip.readEntry();
    });
  });
}
