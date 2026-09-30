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

const adapterEntries = [];
const manifestLines = manifest.split("\n");
for (let index = 0; index < manifestLines.length; index += 1) {
  const match = manifestLines[index].match(/^  ([a-z0-9-]+):$/);
  if (!match) continue;
  const name = match[1];
  const pathLine = manifestLines[index + 1] ?? "";
  const scopeLine = manifestLines[index + 2] ?? "";
  const sourceLine = manifestLines[index + 3] ?? "";
  const pathPrefix = "    path: ";
  const scopePrefix = "    version_scope: ";
  const sourcePrefix = "    source: ";
  if (!pathLine.startsWith(pathPrefix) || !pathLine.slice(pathPrefix.length).startsWith("adapters/")) continue;
  if (!scopeLine.startsWith(scopePrefix) || !scopeLine.slice(scopePrefix.length).trim()) continue;
  if (!sourceLine.startsWith(sourcePrefix) || !sourceLine.slice(sourcePrefix.length).startsWith("https://")) continue;
  adapterEntries.push({
    name,
    path: pathLine.slice(pathPrefix.length),
    versionScope: scopeLine.slice(scopePrefix.length),
    source: sourceLine.slice(sourcePrefix.length),
  });
}
if (!adapterEntries.length) throw new Error("manifest contains no adapters");
if (new Set(adapterEntries.map((adapter) => adapter.name)).size !== adapterEntries.length) {
  throw new Error("duplicate adapter name");
}

for (const { name, path: adapterPath, versionScope, source } of adapterEntries) {
  if (!adapterPath.endsWith("/SKILL.md")) throw new Error("adapter path mismatch: " + name);
  if (!versionScope.trim()) throw new Error("adapter version_scope missing: " + name);
  if (!source.startsWith("https://")) throw new Error("adapter source missing: " + name);
  const expectedPath = path.join(root, adapterPath);
  const readmePath = path.join(root, "adapters", name, "README.md");
  await access(expectedPath);
  await access(readmePath);
  const adapterText = await readFile(expectedPath, "utf8");
  const readmeText = await readFile(readmePath, "utf8");
  if (adapterText.split("\n").length > 500) throw new Error(adapterPath + ": exceeds 500 lines");
  if (readmeText.split("\n").length > 500) throw new Error(readmePath + ": exceeds 500 lines");
}

const adapterDirs = (await readdir(path.join(root, "adapters"), {withFileTypes:true}))
  .filter((entry) => entry.isDirectory())
  .map((entry) => entry.name)
  .sort();
const registeredAdapterDirs = adapterEntries.map((adapter) => adapter.name).sort();
if (JSON.stringify(adapterDirs) !== JSON.stringify(registeredAdapterDirs)) {
  throw new Error("manifest/adapters mismatch");
}

console.log("validated " + names.length + " skills and " + adapterEntries.length + " adapters");
