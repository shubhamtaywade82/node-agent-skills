#!/usr/bin/env node

/**
 * skills CLI — thin command-line wrapper around lib/skill-loader.mjs.
 *
 * Commands:
 *   skills route "<prompt>" [--repo ./path/to/repo]
 *   skills list [--category persistence]
 *   skills adapters
 *   skills show <skill-name>
 *   skills version
 *
 * Zero dependencies. Uses only Node.js standard library.
 */

import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  listSkills,
  listAdapters,
  loadSkillText,
  routePrompt,
} from "../lib/skill-loader.mjs";

const ROOT = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);

function usage() {
  return `usage: skills <command> [args]

  route "<prompt>" [--repo path]   Route a prompt to a primary skill + secondaries + adapters
  list [--category <cat>]          List skills (optionally filtered by category)
  adapters                         List all registered framework adapters
  show <skill-name>                Print the SKILL.md content for a skill
  detect-repo <path>               Detect adapters present in a target repository
  version                          Print pack version
`;
}

function argument(name, fallback) {
  const index = process.argv.indexOf(name);
  return index === -1 ? fallback : process.argv[index + 1];
}

async function main() {
  const [, , command, ...rest] = process.argv;
  if (!command || command === "help" || command === "--help" || command === "-h") {
    process.stdout.write(usage());
    return;
  }

  if (command === "version" || command === "--version" || command === "-v") {
    const pkg = JSON.parse(
      await readFile(path.join(ROOT, "package.json"), "utf8"),
    );
    process.stdout.write(pkg.version + "\n");
    return;
  }

  if (command === "list") {
    const category = argument("--category", null);
    const skills = await listSkills(category);
    process.stdout.write(JSON.stringify(skills, null, 2) + "\n");
    return;
  }

  if (command === "adapters") {
    const adapters = await listAdapters();
    process.stdout.write(JSON.stringify(adapters, null, 2) + "\n");
    return;
  }

  if (command === "show") {
    const skillName = rest[0];
    if (!skillName) {
      process.stderr.write("error: skill name required\n");
      process.exitCode = 2;
      return;
    }
    const text = await loadSkillText(skillName);
    if (!text) {
      process.stderr.write(`error: skill not found: ${skillName}\n`);
      process.exitCode = 1;
      return;
    }
    process.stdout.write(text);
    return;
  }

  if (command === "detect-repo") {
    const repoPath = rest[0];
    if (!repoPath) {
      process.stderr.write("error: repository path required\n");
      process.exitCode = 2;
      return;
    }
    const adapters = await listAdapters();
    const { detectAdapters } = await import("../lib/skill-loader.mjs");
    const detected = await detectAdapters(path.resolve(repoPath), adapters);
    process.stdout.write(JSON.stringify(detected, null, 2) + "\n");
    return;
  }

  if (command === "route") {
    const prompt = rest[0];
    if (!prompt) {
      process.stderr.write("error: prompt required\n");
      process.exitCode = 2;
      return;
    }
    const repo = argument("--repo", null);
    const result = await routePrompt(prompt, repo ? path.resolve(repo) : null);
    process.stdout.write(JSON.stringify(result, null, 2) + "\n");
    return;
  }

  process.stderr.write(`unknown command: ${command}\n\n${usage()}`);
  process.exitCode = 2;
}

main().catch((error) => {
  process.stderr.write(`error: ${error?.message ?? String(error)}\n`);
  process.exitCode = 1;
});
