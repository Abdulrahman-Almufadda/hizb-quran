using HizbQuran.Api.Data;
using HizbQuran.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace HizbQuran.Api.Endpoints;

public static class BookmarkEndpoints
{
    public static void MapBookmarkEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/bookmarks");

        group.MapGet("/", async (QuranDbContext db) =>
            await db.Bookmarks.AsNoTracking().OrderByDescending(b => b.CreatedAt)
                .Select(b => new BookmarkDto(b.Id, b.SurahId, b.AyahNumber, b.CreatedAt, b.Note))
                .ToListAsync());

        group.MapPost("/", async (CreateBookmarkRequest req, QuranDbContext db) =>
        {
            var ayahExists = await db.Ayahs.AnyAsync(a => a.SurahId == req.SurahId && a.AyahNumber == req.AyahNumber);
            if (!ayahExists) return Results.BadRequest(new { error = "Unknown ayah." });

            var existing = await db.Bookmarks.FirstOrDefaultAsync(b => b.SurahId == req.SurahId && b.AyahNumber == req.AyahNumber);
            if (existing is not null)
                return Results.Ok(new BookmarkDto(existing.Id, existing.SurahId, existing.AyahNumber, existing.CreatedAt, existing.Note));

            var bookmark = new Bookmark
            {
                SurahId = req.SurahId,
                AyahNumber = req.AyahNumber,
                Note = req.Note,
                CreatedAt = DateTimeOffset.UtcNow,
            };
            db.Bookmarks.Add(bookmark);
            await db.SaveChangesAsync();
            return Results.Created($"/api/bookmarks/{bookmark.Id}",
                new BookmarkDto(bookmark.Id, bookmark.SurahId, bookmark.AyahNumber, bookmark.CreatedAt, bookmark.Note));
        });

        group.MapDelete("/{id:int}", async (int id, QuranDbContext db) =>
        {
            var deleted = await db.Bookmarks.Where(b => b.Id == id).ExecuteDeleteAsync();
            return deleted == 0 ? Results.NotFound() : Results.NoContent();
        });
    }
}
