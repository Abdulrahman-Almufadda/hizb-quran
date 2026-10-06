using HizbQuran.Api.Data;
using HizbQuran.Api.Models;
using HizbQuran.Api.Services;
using Microsoft.EntityFrameworkCore;

namespace HizbQuran.Api.Endpoints;

public static class QuranEndpoints
{
    public const int TotalPages = 604;
    public const int TotalSurahs = 114;
    private const int SearchLimit = 200;

    public static void MapQuranEndpoints(this IEndpointRouteBuilder app)
    {
        var api = app.MapGroup("/api");

        api.MapGet("/surahs", async (QuranDbContext db) =>
            await db.Surahs.AsNoTracking().OrderBy(s => s.Id)
                .Select(s => new SurahDto(s.Id, s.NameAr, s.NameEn, s.AyahCount))
                .ToListAsync());

        api.MapGet("/surahs/{id:int}/ayahs", async (int id, QuranDbContext db) =>
        {
            if (id is < 1 or > TotalSurahs) return Results.NotFound();
            var ayahs = await db.Ayahs.AsNoTracking()
                .Where(a => a.SurahId == id).OrderBy(a => a.AyahNumber)
                .Select(a => new AyahDto(a.Id, a.SurahId, a.AyahNumber, a.TextAr, a.Page))
                .ToListAsync();
            return Results.Ok(ayahs);
        });

        api.MapGet("/pages/{page:int}/ayahs", async (int page, QuranDbContext db) =>
        {
            if (page is < 1 or > TotalPages) return Results.NotFound();
            var ayahs = await db.Ayahs.AsNoTracking()
                .Where(a => a.Page == page).OrderBy(a => a.Id)
                .Select(a => new AyahDto(a.Id, a.SurahId, a.AyahNumber, a.TextAr, a.Page))
                .ToListAsync();
            return Results.Ok(ayahs);
        });

        api.MapGet("/search", async (string? q, QuranDbContext db) =>
        {
            var trimmed = q?.Trim();
            if (string.IsNullOrEmpty(trimmed))
                return Results.Ok(new SearchResultDto([], []));

            var normalized = ArabicNormalizer.Normalize(trimmed);

            // 114 rows: filter in memory so we can normalize both sides (e.g. "الانعام" finds "الأنعام").
            var surahs = (await db.Surahs.AsNoTracking().OrderBy(s => s.Id).ToListAsync())
                .Where(s => ArabicNormalizer.Normalize(s.NameAr).Contains(normalized)
                         || (s.NameEn ?? "").Contains(trimmed, StringComparison.OrdinalIgnoreCase))
                .Select(s => new SurahDto(s.Id, s.NameAr, s.NameEn, s.AyahCount))
                .ToList();

            // Postgres full-text search (GIN index ix_ayahs_fts). Every word must appear.
            var ayahs = await db.Ayahs.AsNoTracking()
                .Where(a => EF.Functions.ToTsVector("simple", a.TextArPlain)
                    .Matches(EF.Functions.PlainToTsQuery("simple", normalized)))
                .OrderBy(a => a.SurahId).ThenBy(a => a.AyahNumber)
                .Take(SearchLimit)
                .Select(a => new AyahDto(a.Id, a.SurahId, a.AyahNumber, a.TextAr, a.Page))
                .ToListAsync();

            return Results.Ok(new SearchResultDto(surahs, ayahs));
        });
    }
}
