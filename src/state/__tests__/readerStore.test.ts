import { clampPage, TOTAL_MUSHAF_PAGES } from '../readerStore';

describe('clampPage', () => {
  it('clamps to [1, TOTAL_MUSHAF_PAGES]', () => {
    expect(clampPage(0)).toBe(1);
    expect(clampPage(-10)).toBe(1);
    expect(clampPage(1000)).toBe(TOTAL_MUSHAF_PAGES);
    expect(clampPage(300)).toBe(300);
  });

  it('rounds fractional pages', () => {
    expect(clampPage(10.6)).toBe(11);
  });

  it('falls back to 1 for non-finite input', () => {
    expect(clampPage(NaN)).toBe(1);
  });
});
