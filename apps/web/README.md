This workspace now mirrors the requested frontend structure:

- `app/(marketing)` for landing, pricing, and docs
- `app/(auth)` for login, signup, verify, and forgot-password
- `app/dashboard/*` for app routes
- `components/{layout,dashboard,issues,fixes,reports,forms,common}`
- `lib`, `hooks`, `store`, and `types`

The active implementation still also exists at the repository root, and these `apps/web` routes currently wrap the existing production scaffold so migration can happen safely.
