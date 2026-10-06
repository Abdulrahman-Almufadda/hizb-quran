# Hizb Quran Web

Web rebuild of the Hizb mobile Quran app, built as a **DevOps practice project**:
three independently deployable pieces.

| Part | Tech | Path | Port (compose) |
|------|------|------|----------------|
| Database | PostgreSQL 17 (schema + 6,236 ayahs seed) | `db/` | 5432 |
| Backend | ASP.NET Core minimal API (.NET 10), EF Core | `backend/` | 8080 |
| Frontend | Angular 20 (standalone, signals), served by nginx | `frontend/` | 8081 |

Features: surah list, reader (by surah or Mushaf page 1-604), Arabic search
(Postgres full-text, diacritics-insensitive), bookmarks (global, no login yet).
The Mushaf page images from the mobile app are not included; this is text mode only.

## Seed data

`db/init/02-seed-surahs.sql` and `db/init/03-seed-ayahs-*.sql` are loaded automatically the first time
the database container starts. They are generated from the mobile app's SQLite file with
`python3 db/scripts/generate_seed.py path/to/quran.db`.

## Run everything (Docker)

```bash
cp .env.example .env        # optional; compose has dev defaults
docker compose up --build
```

Open http://localhost:8081. API: http://localhost:8080/health and `/api/surahs`.
Re-seed the DB from scratch: `docker compose down -v && docker compose up --build`.

## Run pieces without Docker

```bash
docker compose up db                              # just Postgres
cd backend && dotnet run --project src/HizbQuran.Api   # http://localhost:8080 (see launch note below)
cd frontend && npm install && npm start           # http://localhost:4200, proxies /api
cd backend && dotnet test
```

`dotnet run` binds to the port in `launchSettings`/`ASPNETCORE_URLS`; set
`ASPNETCORE_URLS=http://localhost:8080` so the Angular dev proxy finds it.

## Layout

```
db/init/*.sql                        schema + seed, run by Postgres on first start
db/scripts/generate_seed.py          regenerates the seed from the mobile app's SQLite file
backend/                             API + xUnit tests + Dockerfile
frontend/                            Angular app + nginx.conf + Dockerfile
docker-compose.yml                   local stack
.github/workflows/ci.yml             GitHub CI    (pick one platform,
.gitlab-ci.yml                       GitLab CI     delete the other)
docs/DEVOPS-ROADMAP.md               the learning plan
```

## Status

Written without a .NET SDK, npm registry or Docker daemon available, so **nothing has been
built or run yet**. Expect to fix small things on first `docker compose up --build`
(package versions, Angular template typos). Commit `frontend/package-lock.json` after
the first `npm install`, then switch Dockerfile/CI to `npm ci`.
