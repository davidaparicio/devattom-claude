#!/usr/bin/env node
/**
 * SessionStart Hook
 *
 * Injects git context ONCE at the start of a conversation:
 * - Current timestamp
 * - Git branch and status
 * - Recent changes summary
 *
 * Fires on: startup, resume, clear
 */

import { execSync } from "node:child_process";

interface SessionStartInput {
  session_id: string;
  cwd: string;
  source: 'startup' | 'resume' | 'clear';
}

function git(cwd: string, args: string): string {
  try {
    return execSync(`git -C ${cwd} ${args} 2>/dev/null`, { encoding: "utf-8" }).trim();
  } catch {
    return "";
  }
}

async function main() {
  const chunks: Buffer[] = [];
  for await (const chunk of process.stdin) {
    chunks.push(Buffer.from(chunk));
  }
  const stdin = Buffer.concat(chunks).toString();

  let input: SessionStartInput;
  try {
    input = JSON.parse(stdin);
  } catch {
    process.exit(0);
  }

  const { cwd, source } = input;

  // Only inject on startup (not resume or clear)
  if (source !== 'startup') {
    process.exit(0);
  }

  const context: string[] = [];

  // Add timestamp
  const now = new Date();
  context.push(`Session started: ${now.toISOString().replace('T', ' ').slice(0, 19)}`);

  // Git context
  const branch = git(cwd, "rev-parse --abbrev-ref HEAD");
  if (branch) {
    context.push(`Git branch: ${branch}`);
  }

  const status = git(cwd, "status --porcelain");
  if (status) {
    const lines = status.split('\n');
    const modified = lines.filter(l => l.startsWith(' M') || l.startsWith('M ')).length;
    const staged = lines.filter(l => l.startsWith('A ') || l.startsWith('M ')).length;
    const untracked = lines.filter(l => l.startsWith('??')).length;

    const statusParts: string[] = [];
    if (staged > 0) statusParts.push(`${staged} staged`);
    if (modified > 0) statusParts.push(`${modified} modified`);
    if (untracked > 0) statusParts.push(`${untracked} untracked`);

    if (statusParts.length > 0) {
      context.push(`Git status: ${statusParts.join(', ')}`);
    }

    if (lines.length > 0) {
      const changedFiles = lines
        .slice(0, 5)
        .map(l => l.slice(3).trim())
        .join(', ');
      context.push(`Changed files: ${changedFiles}${lines.length > 5 ? ` (+${lines.length - 5} more)` : ''}`);
    }
  }

  const lastCommit = git(cwd, "log -1 --oneline");
  if (lastCommit) {
    context.push(`Last commit: ${lastCommit.slice(0, 60)}`);
  }

  if (context.length > 0) {
    console.log(context.join('\n'));
  }

  process.exit(0);
}

main();
