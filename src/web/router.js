import { randomUUID } from "node:crypto";
import { createReport, getReport } from "../services/reportService.js";
import {
  createWorkspace,
  createTargetSite,
  getFindingRemediation,
  getScan,
  getScanFindings,
  getTargetSitesByWorkspace,
  getWorkspaces,
  getWorkspaceScans,
  startScan,
} from "../services/scanService.js";

function json(res, statusCode, payload) {
  res.writeHead(statusCode, { "content-type": "application/json" });
  res.end(JSON.stringify(payload, null, 2));
}

async function parseBody(req) {
  const chunks = [];
  for await (const chunk of req) {
    chunks.push(chunk);
  }

  if (chunks.length === 0) {
    return {};
  }

  const raw = Buffer.concat(chunks).toString("utf8");
  return JSON.parse(raw);
}

function notFound(res) {
  json(res, 404, { error: "Not Found" });
}

function matchRoute(method, pathname, pattern) {
  if (method === "GET" && pathname === "/health" && pattern === "/health") {
    return {};
  }

  const pathParts = pathname.split("/").filter(Boolean);
  const patternParts = pattern.split("/").filter(Boolean);

  if (pathParts.length !== patternParts.length) {
    return null;
  }

  const params = {};

  for (let index = 0; index < patternParts.length; index += 1) {
    const currentPattern = patternParts[index];
    const currentPath = pathParts[index];

    if (currentPattern.startsWith(":")) {
      params[currentPattern.slice(1)] = currentPath;
      continue;
    }

    if (currentPattern !== currentPath) {
      return null;
    }
  }

  return params;
}

export const router = {
  async handle(req, res) {
    const url = new URL(req.url, "http://localhost");
    const { method } = req;
    const { pathname } = url;

    if (method === "GET" && pathname === "/health") {
      return json(res, 200, {
        status: "ok",
        service: "securemyapp-ai",
        requestId: randomUUID(),
      });
    }

    if (method === "POST" && pathname === "/workspaces") {
      const body = await parseBody(req);
      return json(res, 201, createWorkspace(body));
    }

    if (method === "GET" && pathname === "/workspaces") {
      return json(res, 200, getWorkspaces());
    }

    if (method === "POST" && pathname === "/targets/sites") {
      const body = await parseBody(req);
      return json(res, 201, createTargetSite(body));
    }

    const workspaceSitesParams = matchRoute(method, pathname, "/workspaces/:id/sites");
    if (method === "GET" && workspaceSitesParams) {
      return json(res, 200, getTargetSitesByWorkspace(workspaceSitesParams.id));
    }

    const workspaceScansParams = matchRoute(method, pathname, "/workspaces/:id/scans");
    if (method === "GET" && workspaceScansParams) {
      return json(res, 200, getWorkspaceScans(workspaceScansParams.id));
    }

    if (method === "POST" && pathname === "/scans") {
      const body = await parseBody(req);
      const scan = await startScan(body);
      return json(res, 201, scan);
    }

    const scanParams = matchRoute(method, pathname, "/scans/:id");
    if (method === "GET" && scanParams) {
      return json(res, 200, getScan(scanParams.id));
    }

    const findingListParams = matchRoute(method, pathname, "/scans/:id/findings");
    if (method === "GET" && findingListParams) {
      return json(res, 200, getScanFindings(findingListParams.id));
    }

    const remediationParams = matchRoute(method, pathname, "/findings/:id/remediation");
    if (method === "GET" && remediationParams) {
      return json(res, 200, getFindingRemediation(remediationParams.id));
    }

    if (method === "POST" && pathname === "/reports") {
      const body = await parseBody(req);
      return json(res, 201, createReport(body));
    }

    const reportParams = matchRoute(method, pathname, "/reports/:id");
    if (method === "GET" && reportParams) {
      return json(res, 200, getReport(reportParams.id));
    }

    return notFound(res);
  },
};
