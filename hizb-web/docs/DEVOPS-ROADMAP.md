# DevOps learning roadmap

The app is deliberately small so the effort goes into the pipeline, not the features.

| Phase | Goal | You will learn |
|-------|------|----------------|
| 0. Local | `docker compose up --build` works | Dockerfiles, multi-stage builds, compose, volumes, healthchecks |
| 1. CI | Every push builds + tests | GitHub Actions / GitLab CI YAML, caching, artifacts |
| 2. Registry | CI pushes versioned images | Image tagging (git SHA), GHCR / GitLab Registry, secrets in CI |
| 3. Server | Buy a VPS, harden it | SSH keys, ufw, fail2ban, non-root user, Docker install |
| 4. CD | Merge to `main` deploys automatically | SSH deploy / `docker compose pull && up -d`, rollbacks |
| 5. Edge | Domain + HTTPS | DNS, reverse proxy (Caddy/Traefik/nginx), Let's Encrypt |
| 6. Ops | Know when it breaks | Logs, health checks, uptime monitor, Postgres backups (`pg_dump` cron) |
| 7. Stretch | Level up | Separate staging env, Terraform/Ansible, Prometheus + Grafana, Kubernetes (k3s) |

Decisions still open: GitHub vs GitLab, which VPS provider, which domain.

Good first exercises: break a test and watch CI fail; change a Dockerfile layer order and
compare build times; `docker compose down -v` and watch the DB re-seed.
