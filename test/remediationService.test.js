import test from "node:test";
import assert from "node:assert/strict";
import { buildRemediation } from "../src/services/remediationService.js";

test("buildRemediation returns patch and snippet for hardcoded secrets", () => {
  const remediation = buildRemediation({
    remediationKey: "extract-secret",
    framework: "nextjs",
    confidence: "medium",
    cweIds: ["CWE-798"],
    owaspTags: ["A02:2021-Cryptographic Failures"],
    filePath: "src/config.ts",
  });

  assert.match(remediation.patchDiff, /process\.env\.API_KEY/);
  assert.match(remediation.codeSnippet, /process\.env\.API_KEY/);
  assert.equal(remediation.reviewRequired, true);
});
