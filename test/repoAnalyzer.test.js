import test from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { analyzeRepository } from "../src/services/repoAnalyzer.js";

test("analyzeRepository finds eval usage in JS files", () => {
  const root = mkdtempSync(join(tmpdir(), "securemyapp-"));

  try {
    writeFileSync(
      join(root, "index.js"),
      `export function run(userInput) {
  return eval(userInput);
}
`,
    );

    const findings = analyzeRepository({ repoPath: root });
    assert.equal(findings.length, 1);
    assert.equal(findings[0].severity, "high");
    assert.equal(findings[0].framework, "node");
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});
