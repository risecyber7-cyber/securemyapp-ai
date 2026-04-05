import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { extname, join } from "node:path";
import { repoRules } from "./rules.js";

const supportedExtensions = new Set([".js", ".jsx", ".ts", ".tsx", ".mjs", ".cjs"]);
const ignoredDirectories = new Set([
  "node_modules",
  ".git",
  ".next",
  "dist",
  "build",
  "coverage",
]);

function walkFiles(rootPath) {
  const queue = [rootPath];
  const files = [];

  while (queue.length > 0) {
    const current = queue.pop();
    const stats = statSync(current);

    if (stats.isDirectory()) {
      for (const entry of readdirSync(current)) {
        if (ignoredDirectories.has(entry)) {
          continue;
        }

        queue.push(join(current, entry));
      }
      continue;
    }

    if (supportedExtensions.has(extname(current))) {
      files.push(current);
    }
  }

  return files;
}

function detectFramework(content, hints = []) {
  const normalizedHints = hints.map((hint) => hint.toLowerCase());
  if (normalizedHints.length > 0) {
    return normalizedHints[0];
  }

  if (content.includes("next/server") || content.includes("next.config")) {
    return "nextjs";
  }

  if (content.includes("@nestjs/common")) {
    return "nestjs";
  }

  if (content.includes("express(") || content.includes("from \"express\"")) {
    return "express";
  }

  if (content.includes("react")) {
    return "react";
  }

  return "node";
}

function findLineNumber(content, regex) {
  const lines = content.split(/\r?\n/);
  for (let index = 0; index < lines.length; index += 1) {
    if (regex.test(lines[index])) {
      return index + 1;
    }
  }

  return 1;
}

export function analyzeRepository({ repoPath, frameworkHints = [] }) {
  if (!repoPath) {
    return [];
  }

  if (!existsSync(repoPath)) {
    const error = new Error(`Repository path does not exist: ${repoPath}`);
    error.statusCode = 400;
    throw error;
  }

  const files = walkFiles(repoPath);
  const findings = [];

  for (const filePath of files) {
    const content = readFileSync(filePath, "utf8");
    const framework = detectFramework(content, frameworkHints);

    for (const rule of repoRules) {
      if (!rule.match.test(content)) {
        continue;
      }

      if (rule.guard && !rule.guard(content)) {
        continue;
      }

      findings.push({
        source: "static",
        category: rule.category,
        severity: rule.severity,
        confidence: rule.confidence,
        title: rule.title,
        description: rule.explanation,
        filePath,
        lineStart: findLineNumber(content, rule.match),
        lineEnd: findLineNumber(content, rule.match),
        framework,
        evidence: {
          detector: rule.id,
          kind: "code",
        },
        cweIds: rule.cweIds,
        owaspTags: rule.owaspTags,
        remediationKey: rule.remediationKey,
      });
    }
  }

  return findings;
}
