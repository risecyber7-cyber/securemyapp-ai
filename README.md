<div align="center">
  <h1>🛡️ SecureMyApp AI</h1>
  <p><strong>Developer-first security detection and remediation foundation.</strong></p>
</div>

<br />

## 📖 Overview

SecureMyApp AI is a comprehensive security tooling layer designed for developers. It bridges the gap between raw security scanning and actionable, developer-friendly remediation by combining localized repository checks, website analysis, and framework-aware patch suggestions. 

## ✨ Key Features

- **Full-Stack Security Layer:** Next.js presentation layer combined with a robust FastAPI engine.
- **In-Memory Operations:** Fast workspace, scan, and remediation tracking.
- **Repository Scanning:** Local repo scanning targeting common JavaScript and TypeScript security smells.
- **Passive Site Checks:** Non-invasive header and cookie security validation.
- **Framework-Aware:** Tailored patch suggestions for frameworks like Next.js in a readable diff format.

## 🛠️ Technology Stack

- **Frontend:** Next.js, React
- **Backend:** FastAPI, Python, Celery
- **Containerization:** Docker & Docker Compose
- **Ecosystem:** JavaScript / TypeScript

## 🚀 Quick Start

You can run SecureMyApp AI entirely locally. Choose your preferred startup method:

### Method 1: Local Full Stack (Recommended)
Launch the entire ecosystem seamlessly using Docker.
```bash
docker compose up --build
```

### Method 2: Manual Start
If you prefer running services independently:

**1. Start the FastAPI Backend:**
```bash
uvicorn apps.api.app.main:app --reload
```
*(Alternatively, use `node src/server.js` or `npm run dev:api` depending on the legacy entry points you are testing).*

**2. Start the Frontend:**
```bash
npm run dev
```

## 🏗️ Architecture & Project Structure

The platform is designed with a scalable monorepo-style structure:

- `apps/api/app/` — FastAPI gateway, core services, and Celery task entrypoints.
- `apps/analyzer/` — Detectors, analysis rules, LLM prompts, normalizers, and the engine.
- `apps/web/` — Next.js frontend application.
- `packages/*/` — Shared UI components, configurations, and TypeScript types.
- `backend/` — Legacy compatibility layer during architectural transition.

## 📡 Core API Capabilities

Here are some of the primary endpoints available:

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/v1/workspaces` | `POST` / `GET` | Manage security workspaces |
| `/api/v1/targets/sites` | `POST` | Register a website for scanning |
| `/api/v1/scans` | `POST` | Trigger a repository or site scan |
| `/api/v1/scans/:id/findings` | `GET` | Retrieve scan results and vulnerabilities |
| `/api/v1/reports` | `POST` | Generate stakeholder reports (JSON) |

**Example: Trigger a Scan**
```json
POST /scans
{
  "workspaceId": "ws_123",
  "type": "full",
  "repoPath": "C:\\path\\to\\repo",
  "targetSiteId": "site_123",
  "frameworkHints": ["nextjs"]
}
```

## 🚧 Current Limitations & Roadmap

As this is a foundational release, several limits exist intentionally for rapid iteration:
- Storage currently utilizes in-memory structures (PostgreSQL implementation planned).
- Direct Git provider integrations (GitHub/GitLab PR drafting) are in development.
- Patch suggestions are template-driven and require manual human review before applying.
- Docker environment configurations are experimental and undergoing validation.

### Suggested Next Steps
- [ ] Migrate in-memory data store to PostgreSQL + Object Storage.
- [ ] Implement queue-backed workers for extensive, long-running codebase scans.
- [ ] Integrate GitHub/GitLab apps for automated PR creation.
- [ ] Expand the detection rule corpus with benchmarked accuracy tests.

<br />

---
<div align="center">
  <i>Built for developers who care about security.</i>
</div>
