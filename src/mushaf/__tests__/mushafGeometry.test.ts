import geometry from '../../assets/mushafGeometry.json';
import { highlightRects, locateAyah, TOTAL_AYAHS } from '../mushafGeometry';

const pages = geometry as unknown as Record<string, { lines: number[]; x: [number, number]; markers: [number, number][] }>;

describe('mushafGeometry', () => {
  it('has exactly one marker per ayah in the Quran', () => {
    let total = 0;
    for (let page = 1; page <= 604; page += 1) total += pages[page].markers.length;
    expect(total).toBe(TOTAL_AYAHS);
  });

  it('maps a tap on the first line of page 1 to the first ayah', () => {
    const p = pages[1];
    const hit = locateAyah(1, p.x[1] - 5, p.lines[0]);
    expect(hit?.globalIndex).toBe(0);
  });

  it('maps taps to consecutive ayahs along a line (right to left)', () => {
    const p = pages[3];
    const [line, markerX] = p.markers[0];
    const first = locateAyah(3, markerX + 20 > p.x[1] ? p.x[1] : markerX + 20, p.lines[line]);
    const next = locateAyah(3, markerX - 20, p.lines[line]);
    expect(next!.globalIndex).toBe(first!.globalIndex + 1);
  });

  it('ignores taps outside the text block', () => {
    expect(locateAyah(3, 5, 5)).toBeNull();
  });

  it('builds highlight rectangles for an ayah', () => {
    expect(highlightRects(3, 0).length).toBeGreaterThan(0);
  });
});
