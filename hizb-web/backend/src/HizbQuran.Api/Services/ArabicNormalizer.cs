using System.Text.RegularExpressions;

namespace HizbQuran.Api.Services;

/// <summary>
/// Same normalization used to build ayahs.text_ar_plain (ported from the mobile app's
/// arabicNormalize.ts): strip diacritics/tatweel, fold alef variants, alef maksura -> yaa.
/// Search queries must go through this so plain typing matches diacritized text.
/// </summary>
public static partial class ArabicNormalizer
{
    [GeneratedRegex("[ؐ-ًؚ-ٰٟۖ-ۜ۟-ۤۧ-۪ۨ-ۭـ]")]
    private static partial Regex Diacritics();

    public static string Normalize(string text)
        => Diacritics().Replace(text, "")
            .Replace('أ', 'ا').Replace('إ', 'ا').Replace('آ', 'ا').Replace('ٱ', 'ا')
            .Replace('ى', 'ي');
}
