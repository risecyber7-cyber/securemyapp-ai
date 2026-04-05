import { websiteRules } from "./rules.js";

function headerMap(headers) {
  const output = {};
  for (const [key, value] of headers.entries()) {
    output[key.toLowerCase()] = value;
  }
  return output;
}

function detectFramework(headers) {
  const poweredBy = headers["x-powered-by"] || "";
  if (/next\.js/i.test(poweredBy)) {
    return "nextjs";
  }

  if (/express/i.test(poweredBy)) {
    return "express";
  }

  return "web";
}

export async function analyzeWebsite({ baseUrl }) {
  if (!baseUrl) {
    return [];
  }

  const response = await fetch(baseUrl, {
    method: "GET",
    redirect: "follow",
  });

  const headers = headerMap(response.headers);
  const findings = [];
  const framework = detectFramework(headers);

  if (!headers["content-security-policy"]) {
    findings.push(buildWebsiteFinding(baseUrl, headers, framework, websiteRules[0]));
  }

  if (baseUrl.startsWith("https://") && !headers["strict-transport-security"]) {
    findings.push(buildWebsiteFinding(baseUrl, headers, framework, websiteRules[1]));
  }

  if (headers["set-cookie"] && !/secure/i.test(headers["set-cookie"])) {
    findings.push(buildWebsiteFinding(baseUrl, headers, framework, websiteRules[2]));
  }

  return findings;
}

function buildWebsiteFinding(baseUrl, headers, framework, rule) {
  return {
    source: "dynamic",
    category: rule.category,
    severity: rule.severity,
    confidence: "medium",
    title: rule.title,
    description: `Observed during passive analysis of ${baseUrl}.`,
    url: baseUrl,
    framework,
    evidence: {
      detector: rule.id,
      kind: "headers",
      observedHeaders: headers,
    },
    cweIds: rule.cweIds,
    owaspTags: rule.owaspTags,
    remediationKey: rule.remediationKey,
  };
}
