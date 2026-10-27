/** Longest side of a stored photo; plenty for a diagram or a pickup close-up. */
const MAX_SIDE = 2400;
/** Files already this small are left exactly as they are. */
const SKIP_BELOW_BYTES = 400 * 1024;
const JPEG_QUALITY = 0.85;

/**
 * Scales a large photo down before it is uploaded, so a 12 MP camera shot does not
 * take 6 MB of the server's disk. PNGs stay PNGs (sharp lines in drawings), JPEGs stay
 * JPEGs. Anything else, or any failure, returns the original file untouched.
 */
export async function shrinkImage(file: File): Promise<File> {
  const type = file.type;
  if ((type !== 'image/jpeg' && type !== 'image/png' && type !== 'image/webp') || file.size < SKIP_BELOW_BYTES) {
    return file;
  }
  try {
    // 'from-image' applies the camera's rotation, so the stored picture is upright.
    const bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' });
    const scale = Math.min(1, MAX_SIDE / Math.max(bitmap.width, bitmap.height));
    const width = Math.round(bitmap.width * scale);
    const height = Math.round(bitmap.height * scale);

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext('2d');
    if (!context) return file;
    context.drawImage(bitmap, 0, 0, width, height);
    bitmap.close();

    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, type, JPEG_QUALITY));
    if (!blob || blob.size >= file.size) return file;
    return new File([blob], file.name, { type, lastModified: file.lastModified });
  } catch {
    return file;
  }
}
