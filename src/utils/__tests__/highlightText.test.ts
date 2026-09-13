import { splitHighlightedSegments } from '../highlightText';

describe('splitHighlightedSegments', () => {
  it('returns a single non-highlighted segment when there is no match', () => {
    expect(splitHighlightedSegments('بسم الرحمن الرحيم')).toEqual([
      { text: 'بسم الرحمن الرحيم', highlighted: false },
    ]);
  });

  it('highlights known patterns like اللَّهِ', () => {
    const segments = splitHighlightedSegments('بِسْمِ اللَّهِ الرَّحْمَٰنِ');
    expect(segments.some((s) => s.highlighted && s.text === 'اللَّهِ')).toBe(true);
  });

  it('never drops or duplicates characters when reassembled', () => {
    const input = 'قُلْ هُوَ اللَّهُ أَحَدٌ اللَّهُ الصَّمَدُ';
    const segments = splitHighlightedSegments(input);
    expect(segments.map((s) => s.text).join('')).toBe(input);
  });
});
