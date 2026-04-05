export const mockWorkspace = {
  id: "ws_demo",
  name: "Acme Security Lab",
  plan: "growth",
  owner: {
    name: "Ravi Patel",
    email: "ravi@acme.dev",
  },
  members: [
    { id: "user_ravi", name: "Ravi Patel", email: "ravi@acme.dev", role: "owner" },
    { id: "user_aisha", name: "Aisha Khan", email: "aisha@acme.dev", role: "security engineer" },
    { id: "user_mina", name: "Mina Jose", email: "mina@acme.dev", role: "frontend lead" },
  ],
};

export const mockProjects = [
  {
    id: "proj_1",
    workspaceId: "ws_demo",
    name: "Main Web App",
    description: "Customer-facing application with auth and billing flows.",
  },
  {
    id: "proj_2",
    workspaceId: "ws_demo",
    name: "Admin Console",
    description: "Internal operations dashboard and management tooling.",
  },
  {
    id: "proj_3",
    workspaceId: "ws_demo",
    name: "Public API",
    description: "Partner and client API surface.",
  },
];

export const mockSites = [
  {
    id: "site_demo",
    workspaceId: "ws_demo",
    baseUrl: "https://acme.dev",
    verificationState: "verified",
  },
];

export const mockScans = [
  {
    id: "scan_demo",
    workspaceId: "ws_demo",
    projectId: "proj_1",
    type: "full",
    status: "completed",
    startedAt: "2026-04-03T08:30:00.000Z",
    completedAt: "2026-04-03T08:37:00.000Z",
    findingIds: ["finding_1", "finding_2"],
    errors: [],
  },
  {
    id: "scan_demo_2",
    workspaceId: "ws_demo",
    projectId: "proj_2",
    type: "website",
    status: "completed",
    startedAt: "2026-04-02T12:10:00.000Z",
    completedAt: "2026-04-02T12:18:00.000Z",
    findingIds: ["finding_3"],
    errors: [],
  },
  {
    id: "scan_demo_3",
    workspaceId: "ws_demo",
    projectId: "proj_3",
    type: "repo",
    status: "completed",
    startedAt: "2026-04-01T16:40:00.000Z",
    completedAt: "2026-04-01T16:50:00.000Z",
    findingIds: ["finding_4"],
    errors: [],
  },
];

export const mockFindings = [
  {
    id: "finding_1",
    scanId: "scan_demo",
    source: "static",
    category: "secret-management",
    severity: "critical",
    confidence: "medium",
    title: "Potential hardcoded secret in source",
    description: "Hardcoded credentials raise immediate credential leakage risk.",
    filePath: "src/config/auth.ts",
    lineStart: 12,
    framework: "nextjs",
    cweIds: ["CWE-798"],
    owaspTags: ["A02:2021-Cryptographic Failures"],
    remediationId: "rem_1",
    fixAvailable: true,
    falsePositive: false,
    status: "open",
    assignedToUserId: "user_aisha",
    businessImpact: "Hardcoded secrets can expose production credentials and create immediate rotation and trust issues.",
    aiNotes: "Rotate the secret value as part of remediation, not after the next release window.",
  },
  {
    id: "finding_2",
    scanId: "scan_demo",
    source: "dynamic",
    category: "browser-hardening",
    severity: "medium",
    confidence: "medium",
    title: "Missing Content-Security-Policy header",
    description: "Observed during passive analysis of https://acme.dev.",
    url: "https://acme.dev",
    framework: "web",
    cweIds: ["CWE-693"],
    owaspTags: ["A05:2021-Security Misconfiguration"],
    remediationId: "rem_2",
    fixAvailable: true,
    falsePositive: false,
    status: "open",
    assignedToUserId: "user_ravi",
    businessImpact: "Missing CSP reduces browser-level containment when a script injection issue appears elsewhere in the stack.",
    aiNotes: "Start restrictive, then widen only for trusted script origins that are operationally required.",
  },
  {
    id: "finding_3",
    scanId: "scan_demo_2",
    source: "dynamic",
    category: "cors-review",
    severity: "high",
    confidence: "medium",
    title: "CORS policy needs review",
    description: "Passive review suggests permissive cross-origin access.",
    url: "https://admin.acme.dev",
    framework: "web",
    cweIds: ["CWE-942"],
    owaspTags: ["A05:2021-Security Misconfiguration"],
    remediationId: "rem_3",
    fixAvailable: true,
    falsePositive: false,
    status: "open",
    businessImpact: "Permissive CORS can widen exposure of authenticated APIs to unintended origins.",
    aiNotes: "Credentials and wildcard origins should never be allowed together.",
  },
  {
    id: "finding_4",
    scanId: "scan_demo_3",
    source: "static",
    category: "request-validation",
    severity: "low",
    confidence: "medium",
    title: "Missing validation pattern on API route",
    description: "Route body should be validated with a schema before business logic.",
    filePath: "src/api/auth/route.ts",
    lineStart: 21,
    framework: "fastapi",
    cweIds: ["CWE-20"],
    owaspTags: ["A04:2021-Insecure Design"],
    remediationId: "rem_4",
    fixAvailable: true,
    falsePositive: false,
    status: "fixed",
    businessImpact: "Missing request validation allows malformed inputs to reach business logic and persistence layers.",
    aiNotes: "Schema validation should be shared at the framework boundary so future handlers inherit it automatically.",
  },
  {
    id: "finding_5",
    scanId: "scan_demo_3",
    source: "static",
    category: "auth-flow-review",
    severity: "medium",
    confidence: "low",
    title: "Authentication flow review recommended",
    description: "Observed auth flow hints need a manual validation pass before escalation.",
    filePath: "src/api/auth/login.ts",
    lineStart: 18,
    framework: "fastapi",
    cweIds: ["CWE-306"],
    owaspTags: ["A07:2021-Identification and Authentication Failures"],
    remediationId: null,
    fixAvailable: false,
    falsePositive: true,
    status: "resolved",
    businessImpact: "Authentication workflow weaknesses can have broad trust and account safety implications even when not immediately exploitable.",
    aiNotes: "Manual analyst review is recommended before escalating this as a confirmed bug.",
  },
];

export const mockRemediations = {
  finding_1: {
    id: "rem_1",
    findingId: "finding_1",
    framework: "nextjs",
    confidence: "medium",
    patchDiff: `--- src/config/auth.ts
+++ src/config/auth.ts
@@
- const apiKey = "replace-me-secret";
+ const apiKey = process.env.API_KEY;
+
+ if (!apiKey) {
+   throw new Error("API_KEY is required");
+ }`,
    codeSnippet: `const apiKey = process.env.API_KEY;

if (!apiKey) {
  throw new Error("API_KEY is required");
}`,
    explanation: "Move secrets to environment-backed configuration before release.",
    confidence_score: 91,
    before_code: 'const apiKey = "replace-me-secret";',
    after_code: `const apiKey = process.env.API_KEY;

if (!apiKey) {
  throw new Error("API_KEY is required");
}`,
    middleware_example: "app.use(secretValidationMiddleware)",
    secure_config_example: "API_KEY=use-secret-manager-value",
    validationSteps: [
      "Rotate the exposed credential immediately.",
      "Store the replacement in deployment secret storage.",
      "Re-run the scan after the commit lands.",
    ],
  },
  finding_2: {
    id: "rem_2",
    findingId: "finding_2",
    framework: "web",
    confidence: "medium",
    patchDiff: `Content-Security-Policy: default-src 'self'; script-src 'self'; object-src 'none'; base-uri 'self'; frame-ancestors 'none'`,
    codeSnippet: `Content-Security-Policy: default-src 'self'; script-src 'self'; object-src 'none'; base-uri 'self'; frame-ancestors 'none'`,
    explanation: "Add a CSP header to reduce the blast radius of script injection issues.",
    confidence_score: 79,
    before_code: "",
    after_code: "Content-Security-Policy: default-src 'self'; script-src 'self'; object-src 'none';",
    middleware_example: "app.use(securityHeaders())",
    secure_config_example: "Content-Security-Policy: default-src 'self'; object-src 'none'; frame-ancestors 'none'",
    validationSteps: [
      "Roll out in report-only mode if the app uses many third-party scripts.",
      "Check browser console violations.",
      "Tighten allowed origins iteratively.",
    ],
  },
  finding_3: {
    id: "rem_3",
    findingId: "finding_3",
    framework: "web",
    confidence: "high",
    patchDiff: "Access-Control-Allow-Origin: https://app.acme.dev",
    codeSnippet: "app.use(cors({ origin: ['https://app.acme.dev'], credentials: true }))",
    explanation: "Restrict cross-origin access to trusted first-party origins.",
    confidence_score: 86,
    before_code: "app.use(cors())",
    after_code: "app.use(cors({ origin: ['https://app.acme.dev'], credentials: true }))",
    middleware_example: "app.use(cors({ origin: allowlist, credentials: true }))",
    secure_config_example: "CORS_ALLOWED_ORIGINS=https://app.acme.dev",
    validationSteps: [
      "Verify trusted clients still complete authenticated requests.",
      "Block wildcard origins when credentials are enabled.",
      "Retest preflight responses.",
    ],
  },
  finding_4: {
    id: "rem_4",
    findingId: "finding_4",
    framework: "fastapi",
    confidence: "medium",
    patchDiff: null,
    codeSnippet: "class LoginRequest(BaseModel):\n    email: EmailStr\n    password: str = Field(min_length=8)",
    explanation: "Use typed request schemas so invalid payloads are rejected before handler logic.",
    confidence_score: 74,
    before_code: "async def login(payload: dict): ...",
    after_code: "class LoginRequest(BaseModel):\n    email: EmailStr\n    password: str = Field(min_length=8)",
    middleware_example: "Depends(validate_request(LoginRequest))",
    secure_config_example: "ENABLE_STRICT_VALIDATION=true",
    validationSteps: [
      "Add validation error tests for malformed payloads.",
      "Ensure clients receive clear 422 responses.",
      "Re-run the scan after the route update.",
    ],
  },
};

export const mockReports = [
  {
    id: "report_1",
    scanId: "scan_demo",
    audience: "developer",
    type: "developer-report",
    format: "json",
    status: "ready",
    generatedAt: "2026-04-03T08:40:00.000Z",
    downloadUrl: "#",
    summary: {
      headline: "Developer remediation report",
    },
  },
  {
    id: "report_2",
    scanId: "scan_demo",
    audience: "stakeholder",
    type: "client-pdf",
    format: "pdf",
    status: "ready",
    generatedAt: "2026-04-03T08:41:00.000Z",
    downloadUrl: "#",
    summary: {
      headline: "Scan completed with 2 findings.",
    },
  },
  {
    id: "report_3",
    scanId: "scan_demo_2",
    audience: "stakeholder",
    type: "management-summary",
    format: "html",
    status: "generating",
    generatedAt: "2026-04-03T08:44:00.000Z",
    downloadUrl: "#",
    summary: {
      headline: "Executive summary is being prepared for the latest admin scan.",
    },
  },
  {
    id: "report_4",
    scanId: "scan_demo_3",
    audience: "developer",
    type: "remediation-checklist",
    format: "md",
    status: "ready",
    generatedAt: "2026-04-02T10:15:00.000Z",
    downloadUrl: "#",
    summary: {
      headline: "Checklist-style remediation package for validation and fix rollout.",
    },
  },
];

export const mockRecentActivity = [
  {
    id: "activity_1",
    project: "Main Web App",
    action: "High-severity secret finding detected",
    actor: "Ravi Patel",
    timestamp: "2 hours ago",
    status: "new",
  },
  {
    id: "activity_2",
    project: "Admin Console",
    action: "Website scan completed",
    actor: "Aisha Khan",
    timestamp: "5 hours ago",
    status: "completed",
  },
  {
    id: "activity_3",
    project: "Public API",
    action: "Validation remediation marked fixed",
    actor: "Mina Jose",
    timestamp: "1 day ago",
    status: "fixed",
  },
];

export const mockTrendData = [
  { label: "Mon", high: 2, medium: 4, fixed: 1 },
  { label: "Tue", high: 3, medium: 5, fixed: 2 },
  { label: "Wed", high: 2, medium: 4, fixed: 4 },
  { label: "Thu", high: 4, medium: 6, fixed: 3 },
  { label: "Fri", high: 3, medium: 4, fixed: 5 },
  { label: "Sat", high: 2, medium: 3, fixed: 4 },
  { label: "Sun", high: 1, medium: 2, fixed: 6 },
];
