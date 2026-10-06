using HizbQuran.Api.Data;
using HizbQuran.Api.Endpoints;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

// Connection string comes from config; in Docker it is set via the
// ConnectionStrings__Default environment variable (see docker-compose.yml).
builder.Services.AddDbContext<QuranDbContext>(o =>
    o.UseNpgsql(builder.Configuration.GetConnectionString("Default")));

builder.Services.AddHealthChecks().AddDbContextCheck<QuranDbContext>("postgres");

// Only needed when running `ng serve` (different origin than the API). In Docker,
// nginx serves the SPA and proxies /api, so everything is same-origin.
builder.Services.AddCors(o => o.AddDefaultPolicy(p =>
    p.WithOrigins(builder.Configuration.GetSection("Cors:Origins").Get<string[]>() ?? [])
     .AllowAnyHeader().AllowAnyMethod()));

var app = builder.Build();

app.UseCors();
app.MapHealthChecks("/health");
app.MapQuranEndpoints();
app.MapBookmarkEndpoints();

app.Run();

public partial class Program;
