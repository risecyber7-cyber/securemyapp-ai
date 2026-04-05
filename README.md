# SecureMyApp AI

SecureMyApp AI is a developer-first security detection and remediation foundation. This initial implementation provides:

- a Next.js presentation layer
- a FastAPI application layer scaffold
- in-memory workspace, scan, finding, remediation, and report storage
- local repo scanning for common JS/TS security smells
- safe website header and cookie checks
- framework-aware remediation packages with diff-style patch suggestions

## Run

```bash
node src/server.js
```

Frontend:

```bash
npm.cmd run dev
```

FastAPI backend:

```bash
uvicorn apps.api.app.main:app --reload
```

API only:

```bash
npm.cmd run dev:api
```

Local full stack:

```bash
docker compose up --build
```

## Current API

- `GET /workspaces`
- `POST /workspaces`
- `GET /workspaces/:id/sites`
- `GET /workspaces/:id/scans`
- `POST /api/v1/auth/register`
- `POST /api/v1/auth/login`
- `GET /api/v1/workspaces`
- `POST /api/v1/targets/sites`
- `POST /api/v1/scans`
- `GET /api/v1/scans/:id`
- `GET /api/v1/scans/:id/findings`
- `GET /api/v1/findings/:id/remediation`
- `POST /api/v1/reports`
- `POST /targets/sites`
- `POST /scans`
- `GET /scans/:id`
- `GET /scans/:id/findings`
- `GET /findings/:id/remediation`
- `POST /reports`
- `GET /reports/:id`
- `GET /health`

## Repository Shape

The backend is now arranged to follow the requested product structure:

- `apps/api/app` for the FastAPI gateway, services, and Celery task entrypoints
- `apps/analyzer` for detectors, rules, prompts, normalizers, and engine helpers
- `apps/web` reserved for future migration of the active Next.js app
- `packages/*` reserved for shared UI, config, and types

The existing `backend/` package is still present as a compatibility layer while the new structure is introduced safely.

## Example Requests

Create a workspace:

```json
POST /workspaces
{
  "name": "Acme Security"
}
```

Register a website target:

```json
POST /targets/sites
{
  "workspaceId": "ws_123",
  "baseUrl": "https://example.com"
}
```

Start a repo and website scan:

```json
POST /scans
{
  "workspaceId": "ws_123",
  "type": "full",
  "repoPath": "C:\\\\path\\\\to\\\\repo",
  "targetSiteId": "site_123",
  "frameworkHints": ["nextjs"]
}
```

Create a stakeholder report:

```json
POST /reports
{
  "scanId": "scan_123",
  "audience": "stakeholder",
  "format": "json"
}
```

## Known Limits

- storage is in-memory only
- git provider integrations are not wired yet
- website checks are intentionally passive and non-invasive
- patch suggestions are template-driven and require human review
- frontend currently uses fallback mock data when the API is unavailable
- FastAPI application layer currently bootstraps demo data on startup
- Alembic scaffold exists, but migrations beyond the initial seed are not authored yet
- Dockerfiles and Compose are present, but not validated in this environment

## Suggested Next Steps

1. Replace in-memory store with PostgreSQL and object storage.
2. Add queue-backed workers for long-running scans.
3. Add GitHub/GitLab app integrations and PR draft creation.
4. Expand the rule corpus and add benchmarked accuracy checks.
