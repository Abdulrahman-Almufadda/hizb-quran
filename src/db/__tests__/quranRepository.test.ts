import { clampPageNumber, clampSurahId, TOTAL_MUSHAF_PAGES } from '../quranRepository';
import { TOTAL_SURAHS } from '../database';

describe('clampPageNumber', () => {
  it('clamps below range to 1', () => {
    expect(clampPageNumber(0)).toBe(1);
    expect(clampPageNumber(-5)).toBe(1);
  });

  it('clamps above range to the last page', () => {
    expect(clampPageNumber(9999)).toBe(TOTAL_MUSHAF_PAGES);
  });

  it('passes valid values through unchanged', () => {
    expect(clampPageNumber(150)).toBe(150);
  });

  it('falls back to 1 for non-finite input', () => {
    expect(clampPageNumber(NaN)).toBe(1);
    expect(clampPageNumber(Infinity)).toBe(1);
  });
});

describe('clampSurahId', () => {
  it('clamps to the valid surah range', () => {
    expect(clampSurahId(0)).toBe(1);
    expect(clampSurahId(200)).toBe(TOTAL_SURAHS);
    expect(clampSurahId(55)).toBe(55);
  });
});
