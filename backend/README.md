# SecureMyApp AI Application Layer

This legacy `backend/` package remains available as a compatibility layer.
The requested monorepo-oriented backend layout is now scaffolded under `apps/api` and `apps/analyzer`.

This backend layer now targets the requested stack:

- FastAPI for API transport
- SQLAlchemy for persistence models
- PostgreSQL as the primary database target
- Redis for cache / broker roles
- Celery for async scan workers
- Pydantic for typed contracts

## Main responsibilities

- auth and token issuance
- RBAC-aware workspace access
- target validation
- scan orchestration
- result normalization
- AI fix package generation
- report building
- future billing hook events

## Run targets

API:

```bash
uvicorn apps.api.app.main:app --reload
```

Worker:

```bash
celery -A apps.api.app.tasks.scan_tasks worker --loglevel=info
```

## Notes

- current scan execution uses a template pipeline so the API can be exercised without the full detection engine wired in
- billing events are placeholder hooks for later Stripe or metering integration
- the Next.js presentation layer can point to `NEXT_PUBLIC_API_BASE_URL=http://localhost:8000/api/v1`
