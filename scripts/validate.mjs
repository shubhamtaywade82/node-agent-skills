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

const adapterScopes = { express: "5.x", fastify: "5.x", nestjs: "12.x", hono: "4.x" };
for (const [name, scope] of Object.entries(adapterScopes)) {
  const block = new RegExp(`^  ${name}:\\n    path: adapters/${name}/SKILL\\.md\\n    version_scope: ${scope.replace(".", "\\\\.")}$`, "m");
  if (!block.test(manifest)) throw new Error(`adapter registry mismatch: ${name}`);
  for (const relative of [`adapters/${name}/SKILL.md`, `adapters/${name}/README.md`]) {
    const file = path.join(root, relative);
    await access(file);
    const adapterText = await readFile(file, "utf8");
    if (adapterText.split("\n").length > 500) throw new Error(`${relative}: exceeds 500 lines`);
  }
}
console.log(`validated ${names.length} skills and ${Object.keys(adapterScopes).length} adapters`);
