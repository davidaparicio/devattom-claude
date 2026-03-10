#!/usr/bin/env node

interface HookInput {
  session_id: string;
  transcript_path: string;
  cwd: string;
  hook_event_name: string;
  tool_name: string;
  tool_use_id: string;
  tool_input: {
    file_path: string;
    content?: string;
  };
  tool_response: {
    filePath?: string;
    success: boolean;
  };
}

interface HookOutput {
  systemMessage?: string;
  hookSpecificOutput: {
    hookEventName: string;
    additionalContext: string;
  };
}

interface LogEntry {
  timestamp: string;
  session_id: string;
  tool_use_id: string;
  tool_name: string;
  file_path: string;
  status: "success" | "error";
  errors?: string[];
}

import { execFileSync } from "node:child_process";
import { appendFileSync, existsSync, readFileSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { dirname, join } from "node:path";

// Check for debug mode
const DEBUG = process.env.CLAUDE_HOOK_DEBUG === "1";
const LOG_FILE = join(homedir(), ".claude/tool-usage.log");

// Find project root by looking for package.json or pnpm-workspace.yaml
function findProjectRoot(filePath: string): string | null {
  let dir = dirname(filePath);
  const root = "/";

  while (dir !== root) {
    if (existsSync(join(dir, "pnpm-workspace.yaml"))) {
      return dir;
    }

    const pkgPath = join(dir, "package.json");
    if (existsSync(pkgPath)) {
      try {
        const content = JSON.parse(readFileSync(pkgPath, "utf-8"));
        if (content.workspaces) {
          return dir;
        }
      } catch {
        // Ignore parse errors
      }
    }

    dir = dirname(dir);
  }

  // Fallback: find any package.json
  dir = dirname(filePath);
  while (dir !== root) {
    if (existsSync(join(dir, "package.json"))) {
      return dir;
    }
    dir = dirname(dir);
  }

  return null;
}

function log(message: string, ...args: unknown[]) {
  if (DEBUG) {
    console.error(`[${new Date().toISOString()}] ${message}`, ...args);
  }
}

function logToolUsage(entry: LogEntry) {
  try {
    const logLine = JSON.stringify(entry) + "\n";
    if (existsSync(LOG_FILE)) {
      appendFileSync(LOG_FILE, logLine);
    } else {
      writeFileSync(LOG_FILE, logLine);
    }
  } catch (error) {
    log("Failed to write log:", error);
  }
}

const COMMAND_TIMEOUT_MS = 10000; // 10 seconds max per command
const TSC_TIMEOUT_MS = 30000; // 30 seconds for TypeScript (can be slow on large projects)

function runCommand(
  command: string[],
  cwd?: string,
  timeoutMs: number = COMMAND_TIMEOUT_MS,
): { stdout: string; stderr: string; success: boolean } {
  try {
    const stdout = execFileSync(command[0], command.slice(1), {
      cwd,
      timeout: timeoutMs,
      encoding: "utf-8",
      maxBuffer: 10 * 1024 * 1024,
    });
    return { stdout, stderr: "", success: true };
  } catch (error: unknown) {
    const err = error as { stdout?: string; stderr?: string; status?: number };
    return {
      stdout: err.stdout ?? "",
      stderr: err.stderr ?? String(error),
      success: false,
    };
  }
}

async function main() {
  log("Hook started for file processing");

  // Read input JSON from stdin
  const chunks: Buffer[] = [];
  for await (const chunk of process.stdin) {
    chunks.push(Buffer.from(chunk));
  }
  const input = Buffer.concat(chunks).toString();
  log("Input received, length:", input.length);

  let hookData: HookInput;
  try {
    hookData = JSON.parse(input);
  } catch (error) {
    log("Error parsing JSON input:", error);
    process.exit(0);
  }

  const { tool_use_id, tool_name, session_id } = hookData;
  const filePath = hookData.tool_input?.file_path;

  if (!filePath) {
    log("Unable to extract file path from input");
    process.exit(0);
  }

  // Check that it's a TypeScript file only
  if (!filePath.endsWith(".ts") && !filePath.endsWith(".tsx")) {
    log(`Skipping ${filePath}: not a TypeScript file`);
    process.exit(0);
  }

  // Find project root from file path
  const projectRoot = findProjectRoot(filePath);
  if (!projectRoot) {
    log("No project root found for:", filePath);
    process.exit(0);
  }

  log("Processing tool use:", { tool_use_id, tool_name, filePath, projectRoot });

  // Check that the file exists
  if (!existsSync(filePath)) {
    log("File not found:", filePath);
    process.exit(1);
  }

  const errors: string[] = [];

  // Get local binaries paths
  const prettierBin = join(projectRoot, "node_modules", ".bin", "prettier");
  const eslintBin = join(projectRoot, "node_modules", ".bin", "eslint");
  const tscBin = join(projectRoot, "node_modules", ".bin", "tsc");

  // Check if binaries exist
  const hasPrettier = existsSync(prettierBin);
  const hasEslintBin = existsSync(eslintBin);
  const hasTscBin = existsSync(tscBin);

  // Check if ESLint config exists (ESLint 9+ requires eslint.config.js/mjs/cjs)
  const hasEslintConfig =
    existsSync(join(projectRoot, "eslint.config.js")) ||
    existsSync(join(projectRoot, "eslint.config.mjs")) ||
    existsSync(join(projectRoot, "eslint.config.cjs"));

  // Find the closest tsconfig.json to the file (might be in apps/web/, packages/ui/, etc.)
  let tsconfigDir: string | null = null;
  let searchDir = dirname(filePath);
  while (searchDir !== projectRoot && searchDir !== "/") {
    if (existsSync(join(searchDir, "tsconfig.json"))) {
      tsconfigDir = searchDir;
      break;
    }
    searchDir = dirname(searchDir);
  }
  // Fallback to project root
  if (!tsconfigDir && existsSync(join(projectRoot, "tsconfig.json"))) {
    tsconfigDir = projectRoot;
  }

  const hasEslint = hasEslintBin && hasEslintConfig;
  const hasTypeScript = hasTscBin && tsconfigDir !== null;

  log("Binaries found:", { hasPrettier, hasEslintBin, hasEslintConfig, hasEslint, hasTscBin, tsconfigDir, hasTypeScript });

  // 1. Execute Prettier
  if (hasPrettier) {
    log("Running Prettier formatting");
    const prettierResult = runCommand(
      [prettierBin, "--write", filePath],
      projectRoot,
    );
    if (!prettierResult.success) {
      log("Prettier failed:", prettierResult.stderr);
      errors.push(`Prettier failed: ${prettierResult.stderr}`);
    }
  }

  // 2. ESLint --fix
  if (hasEslint) {
    log("Running ESLint --fix");
    runCommand([eslintBin, "--fix", filePath], projectRoot);
  }

  // 3. Run ESLint check
  let eslintCheckResult = { stdout: "", stderr: "", success: true };
  if (hasEslint) {
    log("Running ESLint check");
    eslintCheckResult = runCommand([eslintBin, filePath], projectRoot);
  }

  const eslintErrors = (
    eslintCheckResult.stdout + eslintCheckResult.stderr
  ).trim();

  if (eslintErrors && !eslintErrors.includes("0 problems")) {
    errors.push(`ESLint errors:\n${eslintErrors}`);
  }

  // 4. Run TypeScript check
  // Use Turbo if available (much faster with caching), otherwise fallback to tsc
  const tsErrors: string[] = [];
  const hasTurbo = existsSync(join(projectRoot, "turbo.json"));

  if (hasTypeScript && tsconfigDir) {
    log("Running TypeScript check from:", tsconfigDir, "turbo:", hasTurbo);

    let tscResult = { stdout: "", stderr: "", success: true };

    if (hasTurbo) {
      // Try to get package name from package.json in tsconfigDir
      let packageName = "";
      try {
        const pkgPath = join(tsconfigDir, "package.json");
        if (existsSync(pkgPath)) {
          const pkg = JSON.parse(readFileSync(pkgPath, "utf-8"));
          packageName = pkg.name || "";
        }
      } catch {
        // Ignore errors
      }

      if (packageName) {
        log("Running turbo typecheck for package:", packageName);
        // Use turbo with filter for much faster cached builds
        tscResult = runCommand(
          ["pnpm", "turbo", "run", "typecheck", `--filter=${packageName}`],
          projectRoot,
          TSC_TIMEOUT_MS,
        );
      } else {
        // Fallback to direct tsc if no package name found
        tscResult = runCommand(
          [tscBin, "--noEmit", "-p", "tsconfig.json", "--pretty", "false"],
          tsconfigDir,
          TSC_TIMEOUT_MS,
        );
      }
    } else {
      // No turbo, use tsc directly
      tscResult = runCommand(
        [tscBin, "--noEmit", "-p", "tsconfig.json", "--pretty", "false"],
        tsconfigDir,
        TSC_TIMEOUT_MS,
      );
    }

    if (!tscResult.success) {
      const allOutput = (tscResult.stdout + tscResult.stderr).trim();
      const lines = allOutput.split("\n");

      // Get the file path relative to tsconfigDir for matching
      const relativeToTsconfig = filePath.replace(tsconfigDir + "/", "");

      for (const line of lines) {
        // TypeScript error format: path/to/file.ts(line,col): error TS1234: message
        // Turbo format: @pkg:typecheck: path/to/file.ts(line,col): error TS1234: message
        let cleanLine = line.trim();

        // Remove turbo prefix if present (e.g., "@kit/web:typecheck: ")
        const turboMatch = cleanLine.match(/^@[^:]+:typecheck:\s*/);
        if (turboMatch) {
          cleanLine = cleanLine.slice(turboMatch[0].length);
        }

        // Match errors that contain the relative path and "error TS"
        if (cleanLine.startsWith(relativeToTsconfig) && cleanLine.includes("error TS")) {
          tsErrors.push(cleanLine);
        }
      }

      if (tsErrors.length > 0) {
        errors.push(`TypeScript errors:\n${tsErrors.join("\n")}`);
      }
    }
  }

  // Log tool usage with tool_use_id for traceability
  logToolUsage({
    timestamp: new Date().toISOString(),
    session_id,
    tool_use_id,
    tool_name,
    file_path: filePath,
    status: errors.length > 0 ? "error" : "success",
    errors: errors.length > 0 ? errors : undefined,
  });

  log("Error count:", errors.length);

  // Output the result
  if (errors.length > 0) {
    const fileName = filePath.split("/").pop();

    // Count ESLint errors/warnings (lines with "error" or "warning")
    const allErrorsText = errors.join("\n");
    const eslintMatches = allErrorsText.match(/\d+:\d+\s+(error|warning)/g);
    const eslintErrorCount = eslintMatches ? eslintMatches.length : 0;

    // Count TypeScript errors
    const tsErrorCount = tsErrors.length;

    const errorMessage = `Fix NOW the following errors AND warnings detected in ${fileName}:\n\n${errors.join("\n\n")}`;

    // Build a pretty error summary for the user
    const prettyErrors = errors
      .map((e) => {
        // Clean up ESLint output
        let cleaned = e
          .replace(/ESLint errors:\n?/g, '')
          .replace(/TypeScript errors:\n?/g, '')
          .replace(new RegExp(projectRoot + '/', 'g'), '') // Remove absolute path prefix
          .replace(/✖ \d+ problems? \(\d+ errors?, \d+ warnings?\)\n?/g, '') // Remove summary line
          .trim();
        return cleaned;
      })
      .filter((e) => e.length > 0)
      .join('\n');

    // Indent each error line with a bar
    const indentedErrors = prettyErrors
      .split('\n')
      .map((line) => `│ ${line}`)
      .join('\n');

    // Build header with both counts if applicable
    const headerParts: string[] = [];
    if (eslintErrorCount > 0) {
      headerParts.push(`🔴 ${eslintErrorCount} ESLint error${eslintErrorCount > 1 ? 's' : ''}`);
    }
    if (tsErrorCount > 0) {
      headerParts.push(`🔵 ${tsErrorCount} TypeScript error${tsErrorCount > 1 ? 's' : ''}`);
    }
    const header = `${headerParts.join(' • ')} in ${fileName}`;

    const output: HookOutput = {
      systemMessage: `\n${header}\n${indentedErrors}`,
      hookSpecificOutput: {
        hookEventName: "PostToolUse",
        additionalContext: errorMessage,
      },
    };

    log("Output", JSON.stringify(output, null, 2));
    console.log(JSON.stringify(output, null, 2));
  }
}

main().catch((error) => {
  log("Error in hook:", error);
  process.exit(1);
});
