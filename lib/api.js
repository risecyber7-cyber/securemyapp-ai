import { clearSession, getAccessToken, saveSession } from "@/lib/session";

const API_BASE_URL = (process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000/api/v1").replace(/\/$/, "");

function toCamelKey(key) {
  return key.replace(/_([a-z])/g, (_, char) => char.toUpperCase());
}

function normalize(value) {
  if (Array.isArray(value)) return value.map(normalize);
  if (!value || typeof value !== "object") return value;
  return Object.fromEntries(Object.entries(value).map(([key, entryValue]) => [toCamelKey(key), normalize(entryValue)]));
}

function buildHeaders(extraHeaders = {}) {
  const token = getAccessToken();
  return {
    "content-type": "application/json",
    ...(token ? { authorization: `Bearer ${token}` } : {}),
    ...extraHeaders,
  };
}

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: buildHeaders(options.headers),
    cache: "no-store",
  });

  if (response.status === 401 && typeof window !== "undefined") {
    clearSession();
  }

  let payload = null;
  const text = await response.text();
  if (text) {
    try {
      payload = JSON.parse(text);
    } catch {
      payload = { message: text };
    }
  }

  if (!response.ok) {
    const message = payload?.detail || payload?.error || payload?.message || `Request failed for ${path}`;
    throw new Error(message);
  }

  return normalize(payload);
}

function hydrateWorkspace(workspace) {
  if (!workspace) return null;
  return {
    ...workspace,
    owner: workspace.owner || { name: "Workspace Owner", email: "owner@securemyapp.ai" },
    members: workspace.members || [workspace.owner].filter(Boolean),
  };
}

function createRecentActivity({ scans, findings, reports, fixes }) {
  return [
    ...scans.slice(0, 3).map((scan) => ({ id: `scan-${scan.id}`, type: "scan", title: `Scan ${scan.scanType}`, status: scan.status, timestamp: scan.createdAt })),
    ...findings.slice(0, 3).map((finding) => ({ id: `finding-${finding.id}`, type: "finding", title: finding.title, status: finding.status, timestamp: finding.createdAt })),
    ...reports.slice(0, 2).map((report) => ({ id: `report-${report.id}`, type: "report", title: `${report.audience} report`, status: "ready", timestamp: report.createdAt })),
    ...fixes.slice(0, 2).map((fix) => ({ id: `fix-${fix.id}`, type: "fix", title: fix.title, status: fix.reviewRequired ? "review" : "ready", timestamp: fix.createdAt })),
  ]
    .filter(Boolean)
    .sort((left, right) => new Date(right.timestamp || 0) - new Date(left.timestamp || 0));
}

function createTrendData(findings) {
  const buckets = new Map();
  findings.forEach((finding) => {
    const date = new Date(finding.createdAt || Date.now()).toISOString().slice(0, 10);
    if (!buckets.has(date)) {
      buckets.set(date, { date, critical: 0, high: 0, medium: 0, low: 0, info: 0 });
    }
    const bucket = buckets.get(date);
    const severity = finding.severity || "info";
    bucket[severity] = (bucket[severity] || 0) + 1;
  });
  return [...buckets.values()].sort((left, right) => left.date.localeCompare(right.date)).slice(-7);
}

export async function register(payload) {
  const response = await request("/auth/register", {
    method: "POST",
    body: JSON.stringify({
      email: payload.email,
      full_name: payload.fullName,
      password: payload.password,
      workspace_name: payload.workspaceName,
    }),
  });
  const session = { accessToken: response.accessToken, actor: response.actor };
  saveSession(session);
  return response;
}

export async function login(payload) {
  const response = await request("/auth/login", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  const session = { accessToken: response.accessToken, actor: response.actor };
  saveSession(session);
  return response;
}

export function logout() {
  clearSession();
}

export function getSession() {
  return typeof window === "undefined" ? null : JSON.parse(window.localStorage.getItem("securemyapp.session") || "null");
}

export async function forgotPassword(email) {
  return request("/auth/forgot-password", {
    method: "POST",
    body: JSON.stringify({ email }),
  });
}

export async function resetPassword(payload) {
  return request("/auth/reset-password", {
    method: "POST",
    body: JSON.stringify({ token: payload.token, new_password: payload.password }),
  });
}

export async function verifyEmail(token) {
  return request("/auth/verify-email", {
    method: "POST",
    body: JSON.stringify({ token }),
  });
}

export async function resendVerification(email) {
  return request(`/auth/resend-verification?email=${encodeURIComponent(email)}`, { method: "POST" });
}

export async function getWorkspaceBundle() {
  const workspaces = await request("/workspaces");
  const workspace = hydrateWorkspace(workspaces[0]);

  if (!workspace) {
    return {
      workspace: null,
      projects: [],
      sites: [],
      scans: [],
      findings: [],
      fixes: [],
      reports: [],
      settings: null,
      recentActivity: [],
      trendData: [],
    };
  }

  const [projects, sites, scans, findings, fixes, reports, settings] = await Promise.all([
    request(`/projects?workspace_id=${workspace.id}`),
    request(`/workspaces/${workspace.id}/sites`),
    request(`/workspaces/${workspace.id}/scans`),
    request("/issues"),
    request("/fixes"),
    request("/reports").catch(() => []),
    request("/settings").catch(() => null),
  ]);

  return {
    workspace,
    projects,
    sites,
    scans,
    findings,
    fixes,
    reports,
    settings,
    recentActivity: createRecentActivity({ scans, findings, reports, fixes }),
    trendData: createTrendData(findings),
  };
}

export async function getProject(projectId) {
  return request(`/projects/${projectId}`);
}

export async function createProject(payload) {
  return request("/projects", {
    method: "POST",
    body: JSON.stringify({
      workspace_id: payload.workspaceId,
      name: payload.name,
      description: payload.description,
    }),
  });
}

export async function getFinding(findingId) {
  return request(`/findings/${findingId}`);
}

export async function getRemediation(findingId) {
  return request(`/findings/${findingId}/remediation`);
}

export async function listFixes() {
  return request("/fixes");
}

export async function regenerateFix(issueId) {
  return request(`/fixes/${issueId}/regenerate`, { method: "POST" });
}

export async function updateFindingStatus(findingId, payload) {
  return request(`/findings/${findingId}/status`, {
    method: "PATCH",
    body: JSON.stringify({
      status: payload.status,
      false_positive: payload.false_positive,
      assigned_to_user_id: payload.assigned_to_user_id,
    }),
  });
}

export async function createTarget(payload) {
  return request("/targets/sites", {
    method: "POST",
    body: JSON.stringify({
      workspace_id: payload.workspaceId,
      project_id: payload.projectId,
      base_url: payload.baseUrl,
    }),
  });
}

export async function submitScan(payload) {
  let targetSiteId = payload.targetSiteId || null;
  if (!targetSiteId && payload.baseUrl) {
    const target = await createTarget({ workspaceId: payload.workspaceId, projectId: payload.projectId, baseUrl: payload.baseUrl });
    targetSiteId = target.id;
  }

  return request("/scans", {
    method: "POST",
    body: JSON.stringify({
      workspace_id: payload.workspaceId,
      project_id: payload.projectId || null,
      scan_type: payload.scanType || payload.type || "full",
      target_site_id: targetSiteId,
      public_website_url: payload.baseUrl || null,
      framework_hints: payload.frameworkHints || [],
      repo_path: payload.repoPath || null,
    }),
  });
}

export async function generateReport(payload) {
  return request("/reports", {
    method: "POST",
    body: JSON.stringify({
      scan_id: payload.scanId,
      audience: payload.audience,
      format: payload.format,
    }),
  });
}

export async function listReports() {
  return request("/reports");
}

export async function previewReport(reportId) {
  return request(`/reports/${reportId}/preview`);
}

export async function getSettings() {
  return request("/settings");
}

export async function askAssistant(payload) {
  return request("/ai/assistant", {
    method: "POST",
    body: JSON.stringify({
      workspace_id: payload.workspaceId,
      project_id: payload.projectId || null,
      prompt: payload.prompt,
    }),
  });
}
