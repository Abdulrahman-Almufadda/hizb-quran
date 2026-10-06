namespace HizbQuran.Api.Models;

public class Surah
{
    public int Id { get; set; }
    public string NameAr { get; set; } = "";
    public string? NameEn { get; set; }
    public int AyahCount { get; set; }
}

public class Ayah
{
    public int Id { get; set; }
    public int SurahId { get; set; }
    public int AyahNumber { get; set; }
    public string TextAr { get; set; } = "";
    public string TextArPlain { get; set; } = "";
    public int Page { get; set; }
}

public class Bookmark
{
    public int Id { get; set; }
    public int SurahId { get; set; }
    public int AyahNumber { get; set; }
    public DateTimeOffset CreatedAt { get; set; }
    public string? Note { get; set; }
}
