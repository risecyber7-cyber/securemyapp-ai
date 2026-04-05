import test from "node:test";
import assert from "node:assert/strict";
import { createWorkspace, startScan } from "../src/services/scanService.js";

test("startScan marks repo scan failed when repoPath is missing", async () => {
  const workspace = createWorkspace({ name: "Scan Test" });
  const scan = await startScan({
    workspaceId: workspace.id,
    type: "repo",
  });

  assert.equal(scan.status, "failed");
  assert.equal(scan.errors.length, 1);
  assert.match(scan.errors[0], /repoPath is required/);
});
