import { describe, expect, it } from 'vitest';
import { GUIDE_SECTIONS, GUIDE_TEXT } from './guide.js';
import { hr } from './i18n/hr.js';

describe('guide', () => {
  const strings = [
    ...Object.values(GUIDE_TEXT),
    ...GUIDE_SECTIONS.flatMap((s) => [s.title, s.intro, ...s.points, ...(s.tip ? [s.tip] : []), ...s.images.map((i) => i.caption)]),
  ];

  it('is translated into Croatian, every sentence of it', () => {
    const missing = strings.filter((text) => !(text in hr));
    expect(missing).toEqual([]);
  });

  it('has unique section ids and image names that exist per language', () => {
    const ids = GUIDE_SECTIONS.map((s) => s.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const section of GUIDE_SECTIONS) for (const image of section.images) expect(image.file).toMatch(/^[a-z-]+$/);
  });
});
