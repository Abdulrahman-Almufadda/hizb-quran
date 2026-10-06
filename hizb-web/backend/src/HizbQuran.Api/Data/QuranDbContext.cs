using HizbQuran.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace HizbQuran.Api.Data;

/// <summary>
/// Maps onto the schema in db/init/01-schema.sql. The database owns the schema
/// (no EF migrations) so the DB can be built, seeded and tested independently of the API.
/// </summary>
public class QuranDbContext(DbContextOptions<QuranDbContext> options) : DbContext(options)
{
    public DbSet<Surah> Surahs => Set<Surah>();
    public DbSet<Ayah> Ayahs => Set<Ayah>();
    public DbSet<Bookmark> Bookmarks => Set<Bookmark>();

    protected override void OnModelCreating(ModelBuilder b)
    {
        b.Entity<Surah>(e =>
        {
            e.ToTable("surahs");
            e.Property(x => x.Id).HasColumnName("id");
            e.Property(x => x.NameAr).HasColumnName("name_ar");
            e.Property(x => x.NameEn).HasColumnName("name_en");
            e.Property(x => x.AyahCount).HasColumnName("ayah_count");
        });

        b.Entity<Ayah>(e =>
        {
            e.ToTable("ayahs");
            e.Property(x => x.Id).HasColumnName("id");
            e.Property(x => x.SurahId).HasColumnName("surah_id");
            e.Property(x => x.AyahNumber).HasColumnName("ayah_number");
            e.Property(x => x.TextAr).HasColumnName("text_ar");
            e.Property(x => x.TextArPlain).HasColumnName("text_ar_plain");
            e.Property(x => x.Page).HasColumnName("page");
        });

        b.Entity<Bookmark>(e =>
        {
            e.ToTable("bookmarks");
            e.Property(x => x.Id).HasColumnName("id").ValueGeneratedOnAdd();
            e.Property(x => x.SurahId).HasColumnName("surah_id");
            e.Property(x => x.AyahNumber).HasColumnName("ayah_number");
            e.Property(x => x.CreatedAt).HasColumnName("created_at").HasDefaultValueSql("now()");
            e.Property(x => x.Note).HasColumnName("note");
        });
    }
}
