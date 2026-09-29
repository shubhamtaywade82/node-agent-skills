import { access, readFile, readdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const manifest = await readFile(path.join(root, "skill-manifest.yml"), "utf8");
const names = [...manifest.matchAll(/^  - name: ([a-z0-9-]+)$/gm)].map((m) => m[1]);
if (!names.length) throw new Error("manifest contains no skills");
if (new Set(names).size !== names.length) throw new Error("duplicate skill name");
for (const name of names) {
  const file = path.join(root, "skills", name, "SKILL.md");
  await access(file);
  const text = await readFile(file, "utf8");
  if (!new RegExp(`^name: ${name}$`, "m").test(text)) throw new Error(`${name}: frontmatter name mismatch`);
  if (!/^description: Use when .+$/m.test(text)) throw new Error(`${name}: description trigger missing`);
  for (const section of ["## Purpose","## Activate when","## Repository inspection","## Decision rules","## Implementation procedure","## Failure modes","## Verification"]) {
    if (!text.includes(section)) throw new Error(`${name}: missing ${section}`);
  }
  if (text.split("\n").length > 500) throw new Error(`${name}: exceeds 500 lines`);
}
const dirs = (await readdir(path.join(root, "skills"), {withFileTypes:true})).filter(x=>x.isDirectory()).map(x=>x.name).sort();
if (JSON.stringify(dirs) !== JSON.stringify([...names].sort())) throw new Error("manifest/skills mismatch");
console.log(`validated ${names.length} skills`);

const adapterScopes = { express: "5.x", fastify: "5.x", nestjs: "12.x", hono: "4.x", prisma: "7.x/8.x", drizzle: "current/v1", bullmq: "5.x/6.x", redis: "node-redis-5.x", npm: "current npm CLI", docker: "current Docker/BuildKit", kubernetes: "current Kubernetes API conventions", opentelemetry: "current OpenTelemetry JavaScript SDK", vitest: "current Vitest 5.x", jest: "30.x", testcontainers: "current Node.js Testcontainers", playwright: "current Playwright Test", pg: "current node-postgres", undici: "current undici", zod: "4.x", valibot: "current", typebox: "current", kafkajs: "2.x", "aws-sdk-v3": "v3", pino: "current", prometheus: "current @prometheus-io/client", pnpm: "current", turborepo: "current", nx: "current", "github-actions": "current GitHub Actions / Node.js workflow", terraform: "current Terraform", helm: "current Helm", argocd: "current Argo CD", "aws-cloudwatch": "AWS SDK JavaScript v3", sentry: "current Sentry Node.js SDK", datadog: "current dd-trace", newrelic: "current newrelic", "node-test-runner": "Node 24.x `node:test`", supertest: "current", oauth4webapi: "3.x", "openid-client": "current" };
for (const [name, scope] of Object.entries(adapterScopes)) {
  const lines = manifest.split("\n");
  const index = lines.indexOf("  " + name + ":");
  if (index < 0) throw new Error("adapter registry mismatch: " + name);
  if (lines[index + 1] !== "    path: adapters/" + name + "/SKILL.md") {
    throw new Error("adapter path mismatch: " + name);
  }
  if (lines[index + 2] !== "    version_scope: " + scope) {
    throw new Error("adapter version_scope mismatch: " + name);
  }
  if (!/^    source: https:\/\//.test(lines[index + 3] ?? "")) {
    throw new Error("adapter source missing: " + name);
  }
  for (const relative of ["adapters/" + name + "/SKILL.md", "adapters/" + name + "/README.md"]) {
    const file = path.join(root, relative);
    await access(file);
    const adapterText = await readFile(file, "utf8");
    if (adapterText.split("\n").length > 500) throw new Error(relative + ": exceeds 500 lines");
  }
}
console.log("validated " + names.length + " skills and " + Object.keys(adapterScopes).length + " adapters");
