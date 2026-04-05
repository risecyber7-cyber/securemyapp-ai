# Deployment Notes

## Frontend

- Target: Vercel
- Runtime: Next.js 15
- Required env:
  - `NEXT_PUBLIC_API_BASE_URL`

## Backend API

- Target: Azure VM or VPS
- Runtime: Python 3.12 + FastAPI
- Process manager:
  - `uvicorn` for API
  - `celery` for workers
- Dependencies:
  - PostgreSQL
  - Redis
  - S3-compatible storage

## Reverse Proxy

- Nginx config scaffold is included in [infra/nginx/default.conf](/C:/Users/rise/Desktop/work/infra/nginx/default.conf)
- Traefik can be substituted later if automatic cert management is preferred

## Reports

- Use MinIO locally via Docker Compose
- Switch to Backblaze B2, Cloudflare R2, DigitalOcean Spaces, or AWS S3 in production
