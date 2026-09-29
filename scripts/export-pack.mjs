import { createHash } from "node:crypto";
import { access, cp, mkdir, readdir, readFile, rm, writeFile } from "node:fs/promises";
import { execFileSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

function parseArgs(argv) {
  const index = argv.indexOf("--output");
  if (index < 0 || !argv[index + 1]) {
    throw new Error("Usage: node scripts/export-pack.mjs --output <directory>");
  }
  return path.resolve(argv[index + 1]);
}

async function exists(file) {
  try {
    await access(file);
    return true;
  } catch {
    return false;
  }
}

async function listFiles(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const result = [];
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) result.push(...await listFiles(full));
    else if (entry.isFile()) result.push(full);
  }
  return result;
}

function parseManifest(manifest) {
  const skills = [...manifest.matchAll(/^  - name: ([a-z0-9-]+)$/gm)].map((m) => m[1]);
  const adapters = [];
  const lines = manifest.split("\n");
  for (let i = 0; i < lines.length; i += 1) {
    const name = lines[i].match(/^  ([a-z0-9-]+):$/)?.[1];
    if (!name || !lines[i + 1]?.startsWith("    path: adapters/")) continue;
    adapters.push({
      name,
      path: lines[i + 1].slice("    path: ".length),
      version_scope: lines[i + 2]?.slice("    version_scope: ".length) ?? "",
      source: lines[i + 3]?.slice("    source: ".length) ?? "",
    });
  }
  return { skills, adapters };
}

function gitRevision() {
  try {
    return execFileSync("git", ["rev-parse", "HEAD"], { cwd: root, encoding: "utf8" }).trim();
  } catch {
    return "unknown";
  }
}

const output = parseArgs(process.argv.slice(2));
const packageJson = JSON.parse(await readFile(path.join(root, "package.json"), "utf8"));
const manifestText = await readFile(path.join(root, "skill-manifest.yml"), "utf8");
const manifest = parseManifest(manifestText);

const requiredFiles = [
  "README.md",
  "LICENSE",
  "skill-manifest.yml",
  "router/ROUTING.md",
  "router/ROUTING_CASES.yml",
  "docs/SKILL_CONTRACT.md",
];

for (const file of requiredFiles) {
  if (!await exists(path.join(root, file))) throw new Error(`required pack file missing: ${file}`);
}
for (const name of manifest.skills) {
  if (!await exists(path.join(root, "skills", name, "SKILL.md"))) {
    throw new Error(`registered skill missing: ${name}`);
  }
}
for (const adapter of manifest.adapters) {
  for (const file of [adapter.path, `adapters/${adapter.name}/README.md`]) {
    if (!await exists(path.join(root, file))) throw new Error(`registered adapter file missing: ${file}`);
  }
}

await rm(output, { recursive: true, force: true });
await mkdir(output, { recursive: true });

for (const file of requiredFiles) {
  await cp(path.join(root, file), path.join(output, file), { recursive: true });
}
await cp(path.join(root, "skills"), path.join(output, "skills"), { recursive: true });
await cp(path.join(root, "adapters"), path.join(output, "adapters"), { recursive: true });

const files = (await listFiles(output))
  .map((file) => path.relative(output, file).split(path.sep).join("/"))
  .filter((file) => file !== "checksums.sha256" && file !== "pack-manifest.json")
  .sort();

const checksums = [];
for (const relative of files) {
  const buffer = await readFile(path.join(output, relative));
  checksums.push(`${createHash("sha256").update(buffer).digest("hex")}  ${relative}`);
}
await writeFile(path.join(output, "checksums.sha256"), checksums.join("\n") + "\n");

const packManifest = {
  name: packageJson.name,
  version: packageJson.version,
  revision: gitRevision(),
  generated_at: new Date(0).toISOString(),
  skills: manifest.skills.length,
  adapters: manifest.adapters.length,
  files,
};
await writeFile(path.join(output, "pack-manifest.json"), JSON.stringify(packManifest, null, 2) + "\n");

console.log(JSON.stringify({
  output,
  name: packManifest.name,
  version: packManifest.version,
  revision: packManifest.revision,
  skills: packManifest.skills,
  adapters: packManifest.adapters,
  files: packManifest.files.length,
}, null, 2));
