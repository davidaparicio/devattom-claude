#!/usr/bin/env node
// Status line Claude Code
// Affiche : branche git + état remote + consommation tokens

import { execSync } from "node:child_process";

interface ContextWindow {
  used_percentage?: number;
  total_input_tokens?: number;
  total_output_tokens?: number;
}

interface StatusInput {
  workspace?: { current_dir?: string };
  cwd?: string;
  context_window?: ContextWindow;
}

function git(cwd: string, args: string): string | null {
  try {
    return execSync(`git -C "${cwd}" ${args}`, {
      encoding: "utf-8",
      stdio: ["pipe", "pipe", "pipe"],
    }).trim();
  } catch {
    return null;
  }
}

function getGitPart(cwd: string | undefined): string {
  if (!cwd) return "";
  if (git(cwd, "rev-parse --is-inside-work-tree") !== "true") return "";

  const branch =
    git(cwd, "symbolic-ref --short HEAD") ??
    git(cwd, "rev-parse --short HEAD") ??
    "";

  const dirty = git(cwd, "diff --quiet") === null ? " *" : "";
  const staged = git(cwd, "diff --cached --quiet") === null ? " +" : "";
  const untrackedFiles = git(
    cwd,
    "ls-files --others --exclude-standard"
  );
  const untracked = untrackedFiles ? " ?" : "";

  const upstream = git(cwd, "rev-parse --abbrev-ref @{upstream}");
  let aheadBehind = "";
  if (upstream) {
    const ahead = Number(git(cwd, `rev-list --count ${upstream}..HEAD`) ?? "0");
    const behind = Number(git(cwd, `rev-list --count HEAD..${upstream}`) ?? "0");
    if (ahead > 0 && behind > 0) {
      aheadBehind = ` ↑${ahead}↓${behind}`;
    } else if (ahead > 0) {
      aheadBehind = ` ↑${ahead}`;
    } else if (behind > 0) {
      aheadBehind = ` ↓${behind}`;
    } else {
      aheadBehind = " ✓";
    }
  } else {
    aheadBehind = " (no remote)";
  }

  return `${branch}${dirty}${staged}${untracked}${aheadBehind}`;
}

function getTokensPart(ctx: ContextWindow | undefined): string {
  if (!ctx?.used_percentage) return "session: en attente";

  const usedInt = Math.round(ctx.used_percentage);
  return `session:${usedInt}%`;
}

// --- Main ---
let raw = "";
process.stdin.setEncoding("utf-8");
process.stdin.on("data", (chunk: string) => {
  raw += chunk;
});
process.stdin.on("end", () => {
  const input: StatusInput = JSON.parse(raw);
  const cwd = input.workspace?.current_dir ?? input.cwd;
  const gitPart = getGitPart(cwd);
  const tokensPart = getTokensPart(input.context_window);

  if (gitPart) {
    process.stdout.write(
      `\x1b[33m git:${gitPart}\x1b[0m  \x1b[36m${tokensPart}\x1b[0m`
    );
  } else {
    process.stdout.write(`\x1b[36m${tokensPart}\x1b[0m`);
  }
});
