namespace HizbQuran.Api.Models;

public record SurahDto(int Id, string NameAr, string? NameEn, int AyahCount);

public record AyahDto(int Id, int SurahId, int AyahNumber, string TextAr, int Page);

public record BookmarkDto(int Id, int SurahId, int AyahNumber, DateTimeOffset CreatedAt, string? Note);

public record CreateBookmarkRequest(int SurahId, int AyahNumber, string? Note);

public record SearchResultDto(IReadOnlyList<SurahDto> Surahs, IReadOnlyList<AyahDto> Ayahs);
