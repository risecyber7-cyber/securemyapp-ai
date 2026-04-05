const remediationTemplates = {
  "replace-eval": {
    title: "Replace eval with explicit parsing or dispatch",
    explanation:
      "Use structured parsing or a closed command map instead of executing raw strings.",
    patch: ({ filePath }) => `--- ${filePath}
+++ ${filePath}
@@
- const result = eval(userInput);
+ const handlers = { safeAction };
+ const selectedAction = handlers[userInput];
+ if (!selectedAction) throw new Error("Unsupported action");
+ const result = selectedAction();`,
    snippet: () => `const handlers = { safeAction };
const selectedAction = handlers[userInput];

if (!selectedAction) {
  throw new Error("Unsupported action");
}

const result = selectedAction();`,
    validationSteps: [
      "Confirm no user-controlled strings reach code execution APIs.",
      "Add tests for unsupported and allowed actions.",
      "Run SAST again to verify eval usage is removed.",
    ],
  },
  "harden-cookie": {
    title: "Add Secure and HttpOnly cookie flags",
    explanation:
      "Mark session cookies as Secure and HttpOnly to reduce theft and browser script access.",
    patch: ({ filePath }) => `--- ${filePath}
+++ ${filePath}
@@
- res.cookie("session", token);
+ res.cookie("session", token, {
+   httpOnly: true,
+   secure: process.env.NODE_ENV === "production",
+   sameSite: "lax",
+ });`,
    snippet: () => `res.cookie("session", token, {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax",
});`,
    validationSteps: [
      "Inspect the Set-Cookie header in the browser or test response.",
      "Verify Secure is always true in production deployments.",
      "Check authentication flows for regressions.",
    ],
  },
  "extract-secret": {
    title: "Move hardcoded credentials to environment-backed secret storage",
    explanation:
      "Application secrets should come from environment variables or a secrets manager, never source control.",
    patch: ({ filePath }) => `--- ${filePath}
+++ ${filePath}
@@
- const apiKey = "replace-me-secret";
+ const apiKey = process.env.API_KEY;
+
+ if (!apiKey) {
+   throw new Error("API_KEY is required");
+ }`,
    snippet: () => `const apiKey = process.env.API_KEY;

if (!apiKey) {
  throw new Error("API_KEY is required");
}`,
    validationSteps: [
      "Rotate the exposed secret value immediately.",
      "Move the new secret into your secret manager or deployment environment.",
      "Scan git history if the credential may have been committed previously.",
    ],
  },
  "sanitize-command-exec": {
    title: "Remove shell execution or strictly constrain command arguments",
    explanation:
      "Prefer allowlisted command maps or native APIs instead of passing attacker-controlled values into shell primitives.",
    patch: ({ filePath }) => `--- ${filePath}
+++ ${filePath}
@@
- exec(userCommand);
+ const allowlistedCommands = new Map([["status", ["git", "status", "--short"]]]);
+ const command = allowlistedCommands.get(userCommand);
+ if (!command) throw new Error("Unsupported command");
+ spawn(command[0], command.slice(1), { shell: false });`,
    snippet: () => `const allowlistedCommands = new Map([
  ["status", ["git", "status", "--short"]],
]);

const command = allowlistedCommands.get(userCommand);
if (!command) {
  throw new Error("Unsupported command");
}

spawn(command[0], command.slice(1), { shell: false });`,
    validationSteps: [
      "Ensure untrusted input cannot influence the executable path.",
      "Disable shell mode unless there is a reviewed exception.",
      "Add tests for rejected commands.",
    ],
  },
  "add-csp": {
    title: "Set a Content-Security-Policy header",
    explanation:
      "A restrictive CSP helps reduce XSS impact and limits script execution to approved sources.",
    patch: () => `headers().set(
  "Content-Security-Policy",
  "default-src 'self'; script-src 'self'; object-src 'none'; base-uri 'self'; frame-ancestors 'none'"
);`,
    snippet: () => `Content-Security-Policy: default-src 'self'; script-src 'self'; object-src 'none'; base-uri 'self'; frame-ancestors 'none'`,
    validationSteps: [
      "Deploy the header in report-only mode first if the app has many third-party scripts.",
      "Check browser console CSP violations.",
      "Tighten allowed origins iteratively.",
    ],
  },
  "add-hsts": {
    title: "Enable HSTS on HTTPS responses",
    explanation:
      "HSTS instructs browsers to use HTTPS for future requests and reduces protocol downgrade risk.",
    patch: () => `Strict-Transport-Security: max-age=31536000; includeSubDomains; preload`,
    snippet: () => `Strict-Transport-Security: max-age=31536000; includeSubDomains; preload`,
    validationSteps: [
      "Confirm all subdomains support HTTPS before enabling includeSubDomains.",
      "Verify the header appears only on HTTPS responses.",
      "Add preload only after validating long-term readiness.",
    ],
  },
  "secure-cookie-header": {
    title: "Mark Set-Cookie values Secure and HttpOnly",
    explanation:
      "Browser-set session cookies should include Secure and HttpOnly to lower theft risk.",
    patch: () => `Set-Cookie: session=value; Path=/; HttpOnly; Secure; SameSite=Lax`,
    snippet: () => `Set-Cookie: session=value; Path=/; HttpOnly; Secure; SameSite=Lax`,
    validationSteps: [
      "Inspect the response headers in the browser devtools network tab.",
      "Verify secure cookies are only issued on HTTPS.",
      "Confirm session flows continue to work across redirects.",
    ],
  },
};

export function buildRemediation(finding) {
  const template = remediationTemplates[finding.remediationKey];

  if (!template) {
    return {
      framework: finding.framework || "generic",
      title: "Manual review required",
      explanation:
        "A specific template is not yet available for this finding. Review the evidence and implement a framework-safe fix.",
      patchDiff: null,
      codeSnippet: "// Manual remediation guidance not available yet.",
      validationSteps: ["Review the finding evidence and patch manually."],
      references: finding.owaspTags || [],
      confidence: "low",
      reviewRequired: true,
    };
  }

  return {
    framework: finding.framework || "generic",
    title: template.title,
    explanation: template.explanation,
    patchDiff: template.patch(finding),
    codeSnippet: template.snippet(finding),
    validationSteps: template.validationSteps,
    references: [...(finding.cweIds || []), ...(finding.owaspTags || [])],
    confidence: finding.confidence,
    reviewRequired: true,
  };
}
