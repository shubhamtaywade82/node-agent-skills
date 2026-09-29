import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const skills = {
  "node-agent-preflight": ["working tree", "baseline"],
  "node-agent-evidence-gathering": ["source of truth", "contradiction"],
  "node-agent-change-safety": ["blast radius", "file allowlist"],
  "node-agent-verification-reporting": ["not run", "evidence"],
  "node-agent-risk-escalation": ["irreversible", "human decision"],
  "node-agent-rollback-planning": ["roll-forward", "state"],
  "node-agent-commit-hygiene": ["staged diff", "bisect"],
  "node-agent-pr-preparation": ["base/head", "CI"],
  "node-dns-engineering": ["NXDOMAIN", "TTL"],
  "node-tls-certificate-management": ["SNI", "certificate chain"],
  "node-http-proxy-forwarding": ["trusted proxy", "Forwarded"],
  "node-http-timeouts": ["deadline", "AbortSignal"],
  "node-http-keepalive": ["socket reuse", "free socket"],
  "node-webhook-ingress-security": ["raw body", "event ID"],
  "node-request-signature-validation": ["HMAC", "timing-safe"],
  "node-replay-protection": ["nonce", "atomic"],
  "node-csrf-defense": ["SameSite", "Origin"],
  "node-open-redirect-defense": ["allowlist", "javascript:"],
  "node-request-smuggling-defense": ["Content-Length", "Transfer-Encoding"],
  "node-header-normalization": ["hop-by-hop", "duplicate header"],
};

for (const [skill, markers] of Object.entries(skills)) {
  test(skill + " contains domain-specific decision guidance", async () => {
    const content = await readFile("skills/" + skill + "/SKILL.md", "utf8");
    for (const marker of markers) {
      assert.ok(
        content.toLowerCase().includes(marker.toLowerCase()),
        skill + " is missing domain marker: " + marker
      );
    }
  });
}

test("Wave 12 decision rules are not duplicated boilerplate", async () => {
  const sections = [];
  for (const skill of Object.keys(skills)) {
    const content = await readFile("skills/" + skill + "/SKILL.md", "utf8");
    const match = content.match(/## Decision rules\n\n([\s\S]*?)(?=\n## |\n?$)/);
    assert.ok(match, skill + " has a Decision rules section");
    sections.push(match[1].trim());
  }
  assert.ok(new Set(sections).size >= 18, "Wave 12 needs materially distinct decision rules");
});


test("node-agent-evaluation uses real procedure lines", async () => {
  const content = await readFile("skills/node-agent-evaluation/SKILL.md", "utf8");
  const procedure = content.match(/## Implementation procedure\n\n([\\s\\S]*?)(?=\n## |\n?$)/);
  assert.ok(procedure, "node-agent-evaluation has an implementation procedure");
  assert.ok(!procedure[1].includes("\\\\n"), "implementation procedure must not contain literal newline escapes");
  assert.match(procedure[1], /^1\. Define target behavior\.\\n2\./m, "procedure is numbered as separate lines");
});
