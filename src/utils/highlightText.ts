const HIGHLIGHT_PATTERNS = ['اللَّهِ', 'اللَّهَ', 'اللَّهُ', 'لِلَّهِ', 'رَبَّنَا', 'اللَّه'];

export type TextSegment = {
  text: string;
  highlighted: boolean;
};

export function splitHighlightedSegments(text: string): TextSegment[] {
  const segments: TextSegment[] = [];
  let start = 0;

  while (start < text.length) {
    let earliestIndex = -1;
    let matchedPattern = '';

    for (const pattern of HIGHLIGHT_PATTERNS) {
      const idx = text.indexOf(pattern, start);
      if (idx === -1) continue;
      if (earliestIndex === -1 || idx < earliestIndex) {
        earliestIndex = idx;
        matchedPattern = pattern;
      } else if (idx === earliestIndex && pattern.length > matchedPattern.length) {
        matchedPattern = pattern;
      }
    }

    if (earliestIndex === -1) {
      segments.push({ text: text.slice(start), highlighted: false });
      break;
    }
    if (earliestIndex > start) {
      segments.push({ text: text.slice(start, earliestIndex), highlighted: false });
    }
    segments.push({ text: matchedPattern, highlighted: true });
    start = earliestIndex + matchedPattern.length;
  }

  return segments;
}
