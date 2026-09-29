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

const adapterEntries = [...manifest.matchAll(/^  ([a-z0-9-]+):\\n    path: (adapters\\/[^\\n]+)\\n    version_scope: ([^\\n]+)\\n    source: (https:\\/\\/\\S+)$/gm)].map((m) => ({
  name: m[1],
  path: m[2],
  versionScope: m[3],
  source: m[4],
}));
if (!adapterEntries.length) throw new Error("manifest contains no adapters");

for (const { name, path: adapterPath, versionScope, source } of adapterEntries) {
  if (!adapterPath.endsWith("/SKILL.md")) throw new Error("adapter path mismatch: " + name);
  if (!versionScope.trim()) throw new Error("adapter version_scope missing: " + name);
  if (!source.startsWith("https://")) throw new Error("adapter source missing: " + name);
  const lines = manifest.split("\\n");
  const index = lines.indexOf("  " + name + ":");
  if (index < 0 || lines[index + 1] !== "    path: " + adapterPath) {
    throw new Error("adapter registry mismatch: " + name);
  }
  const expectedPath = path.join(root, adapterPath);
  const readmePath = path.join(root, "adapters", name, "README.md");
  await access(expectedPath);
  await access(readmePath);
  const adapterText = await readFile(expectedPath, "utf8");
  const readmeText = await readFile(readmePath, "utf8");
  if (adapterText.split("\\n").length > 500) throw new Error(adapterPath + ": exceeds 500 lines");
  if (readmeText.split("\\n").length > 500) throw new Error(readmePath + ": exceeds 500 lines");
}
console.log("validated " + names.length + " skills and " + adapterEntries.length + " adapters");
