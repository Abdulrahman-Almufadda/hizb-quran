import { getTafsir } from '../tafsirRepository';

describe('tafsirRepository', () => {
  it('returns tafsir text for an ayah', () => {
    const text = getTafsir(2, 255);
    expect(text).toBeTruthy();
    expect(text).toContain('الله');
  });

  it('returns null for an unknown surah', () => {
    expect(getTafsir(999, 1)).toBeNull();
  });

  it('returns null for an ayah past the end of the surah', () => {
    expect(getTafsir(1, 8)).toBeNull();
  });
});
