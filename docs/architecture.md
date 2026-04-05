# SecureMyApp AI Architecture Notes

## Current shape

This implementation now has two active layers with clear seams for later extraction:

- `app`, `components`, `lib`
  - Next.js presentation layer
  - dashboard, issue list, fix viewer, scan submission, reporting, workspace UI
- `backend/app/api`
  - FastAPI route transport
  - auth, workspaces, targets, scans, findings, reports
- `backend/app/services`
  - auth
  - RBAC
  - target validation
  - scan orchestration
  - result normalization
  - AI fix generation
  - report building
  - billing hooks placeholder
- `backend/app/models`
  - SQLAlchemy entities for users, workspaces, scans, findings, remediations, reports
- `backend/app/workers`
  - Celery worker entrypoints for async scan execution
- `src`
  - earlier Node prototype retained temporarily as legacy scaffold/reference

## Planned extraction points

- replace startup auto-create tables with migrations
- wire Celery tasks to real static and dynamic analyzers
- move report artifacts into object storage
- add external identity provider and JWT bearer enforcement
- add git-provider integration module
- retire legacy Node prototype once frontend points fully at FastAPI

## Security posture defaults

- passive website inspection only
- no automatic patch application
- human review required for every remediation
- no sensitive code written to logs
