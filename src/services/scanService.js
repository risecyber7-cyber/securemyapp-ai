import { createId, getOne, insert, listWhere } from "../store/db.js";
import { buildRemediation } from "./remediationService.js";
import { analyzeRepository } from "./repoAnalyzer.js";
import { analyzeWebsite } from "./websiteAnalyzer.js";

export function createWorkspace(input) {
  if (!input.name) {
    const error = new Error("name is required");
    error.statusCode = 400;
    throw error;
  }

  return insert("workspaces", {
    id: createId("ws"),
    name: input.name,
    plan: input.plan || "starter",
    owner: input.owner || {
      name: "Workspace Owner",
      email: "owner@securemyapp.ai",
    },
    members: input.members || [
      { name: "Workspace Owner", email: "owner@securemyapp.ai", role: "owner" },
    ],
    createdAt: new Date().toISOString(),
  });
}

export function createTargetSite(input) {
  if (!input.workspaceId || !input.baseUrl) {
    const error = new Error("workspaceId and baseUrl are required");
    error.statusCode = 400;
    throw error;
  }

  getOne("workspaces", input.workspaceId, "Workspace");

  return insert("targetSites", {
    id: createId("site"),
    workspaceId: input.workspaceId,
    baseUrl: input.baseUrl,
    verificationState: "unverified",
    createdAt: new Date().toISOString(),
  });
}

export async function startScan(input) {
  if (!input.workspaceId || !input.type) {
    const error = new Error("workspaceId and type are required");
    error.statusCode = 400;
    throw error;
  }

  getOne("workspaces", input.workspaceId, "Workspace");

  const scan = insert("scans", {
    id: createId("scan"),
    workspaceId: input.workspaceId,
    type: input.type,
    status: "running",
    repoPath: input.repoPath || null,
    targetSiteId: input.targetSiteId || null,
    frameworkHints: input.frameworkHints || [],
    startedAt: new Date().toISOString(),
    completedAt: null,
    findingIds: [],
    errors: [],
  });

  const findings = [];

  if (input.type === "repo" || input.type === "full") {
    if (!input.repoPath) {
      scan.errors.push("repoPath is required for repo or full scans.");
    } else {
      findings.push(
        ...analyzeRepository({
          repoPath: input.repoPath,
          frameworkHints: input.frameworkHints,
        }),
      );
    }
  }

  if (input.type === "website" || input.type === "full") {
    let baseUrl = input.baseUrl;

    if (!baseUrl && input.targetSiteId) {
      const targetSite = getOne("targetSites", input.targetSiteId, "Target site");
      baseUrl = targetSite.baseUrl;
    }

    if (baseUrl) {
      try {
        findings.push(...(await analyzeWebsite({ baseUrl })));
      } catch (error) {
        scan.errors.push(`Website analysis failed: ${error.message}`);
      }
    } else if (input.type === "website" || input.type === "full") {
      scan.errors.push("baseUrl or targetSiteId is required for website or full scans.");
    }
  }

  for (const finding of findings) {
    const storedFinding = insert("findings", {
      id: createId("finding"),
      scanId: scan.id,
      remediationStatus: "generated",
      businessImpact: severityToImpact(finding.severity),
      exploitScenario: buildExploitScenario(finding),
      ...finding,
    });

    const remediation = insert("remediations", {
      id: createId("rem"),
      findingId: storedFinding.id,
      ...buildRemediation(storedFinding),
      createdAt: new Date().toISOString(),
    });

    scan.findingIds.push(storedFinding.id);
    storedFinding.remediationId = remediation.id;
  }

  scan.status = scan.errors.length > 0 && findings.length === 0 ? "failed" : "completed";
  scan.completedAt = new Date().toISOString();

  return scan;
}

export function getScan(id) {
  return getOne("scans", id, "Scan");
}

export function getWorkspaces() {
  return listWhere("workspaces", () => true);
}

export function getTargetSitesByWorkspace(workspaceId) {
  getOne("workspaces", workspaceId, "Workspace");
  return listWhere("targetSites", (site) => site.workspaceId === workspaceId);
}

export function getWorkspaceScans(workspaceId) {
  getOne("workspaces", workspaceId, "Workspace");
  return listWhere("scans", (scan) => scan.workspaceId === workspaceId).sort((a, b) =>
    b.startedAt.localeCompare(a.startedAt),
  );
}

export function getScanFindings(scanId) {
  getOne("scans", scanId, "Scan");
  return listWhere("findings", (finding) => finding.scanId === scanId);
}

export function getFindingRemediation(findingId) {
  getOne("findings", findingId, "Finding");
  return listWhere("remediations", (remediation) => remediation.findingId === findingId)[0];
}

function severityToImpact(severity) {
  switch (severity) {
    case "critical":
      return "Potential account or environment compromise.";
    case "high":
      return "High-risk issue with realistic exploitation path.";
    case "medium":
      return "Security weakness that should be remediated in normal sprint work.";
    default:
      return "Low immediate risk but worth tracking.";
  }
}

function buildExploitScenario(finding) {
  if (finding.source === "dynamic") {
    return `An attacker probing ${finding.url} could take advantage of weak browser or transport protections if a separate injection or interception bug exists.`;
  }

  return `A malicious input path reaching ${finding.filePath || "application code"} could trigger ${finding.category} behavior if left unguarded.`;
}
