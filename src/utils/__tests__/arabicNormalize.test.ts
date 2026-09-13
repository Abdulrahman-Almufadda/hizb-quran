import { normalizeArabic } from '../arabicNormalize';

describe('normalizeArabic', () => {
  it('strips tashkeel diacritics', () => {
    expect(normalizeArabic('بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ')).toBe('بسم الله الرحمن الرحيم');
  });

  it('collapses hamza/madda alef variants to plain alef', () => {
    expect(normalizeArabic('أَحَدٌ')).toBe('احد');
    expect(normalizeArabic('آل عمران')).toBe('ال عمران');
    expect(normalizeArabic('إِبْرَاهِيم')).toBe('ابراهيم');
  });

  it('collapses alef maksura to yaa', () => {
    expect(normalizeArabic('مُوسَىٰ')).toBe('موسي');
  });

  it('is idempotent on already-plain text', () => {
    const plain = 'الحمد لله رب العالمين';
    expect(normalizeArabic(plain)).toBe(plain);
  });
});
