using HizbQuran.Api.Services;

namespace HizbQuran.Api.Tests;

public class ArabicNormalizerTests
{
    [Fact]
    public void Strips_tashkeel()
        => Assert.Equal("بسم الله الرحمن الرحيم", ArabicNormalizer.Normalize("بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ"));

    [Theory]
    [InlineData("أَحَدٌ", "احد")]
    [InlineData("آل عمران", "ال عمران")]
    [InlineData("إِبْرَاهِيم", "ابراهيم")]
    public void Collapses_alef_variants(string input, string expected)
        => Assert.Equal(expected, ArabicNormalizer.Normalize(input));

    [Fact]
    public void Collapses_alef_maksura_to_yaa()
        => Assert.Equal("موسي", ArabicNormalizer.Normalize("مُوسَىٰ"));

    [Fact]
    public void Is_idempotent_on_plain_text()
    {
        const string plain = "الحمد لله رب العالمين";
        Assert.Equal(plain, ArabicNormalizer.Normalize(plain));
    }
}
