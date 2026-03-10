#!/usr/bin/env node
/**
 * Stop hook - Play different sounds based on session success/failure
 *
 * Success: plays finish.mp3
 * Failure: plays Basso.aiff (macOS system sound)
 *
 * Failure is determined by checking tool-usage.log for any errors in the current session
 *
 * YOLO Mode: If /tmp/.apex-yolo-continue exists, launches background
 * automation to continue APEX workflow after Claude exits.
 */

import { spawn, execFileSync } from "node:child_process";
import { existsSync, readFileSync, unlinkSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";

const HOME = homedir();
const CLAUDE_DIR = join(HOME, ".claude");
const PLAY_SOUND = join(CLAUDE_DIR, "bin/play-sound");
const YOLO_CONTINUE_FLAG = "/tmp/.apex-yolo-continue";
const YOLO_CONTINUE_SCRIPT = join(CLAUDE_DIR, "scripts/apex/yolo-continue.ts");

interface StopHookInput {
  session_id: string;
  transcript_path: string;
  cwd: string;
}

const LOG_FILE = join(CLAUDE_DIR, "tool-usage.log");
const SUCCESS_SOUND = join(CLAUDE_DIR, "song/finish.mp3");
const FAILURE_SOUND = join(CLAUDE_DIR, "song/failure.aiff");
const VOLUME = "0.15";

function checkSessionHadErrors(sessionId: string): boolean {
  try {
    if (!existsSync(LOG_FILE)) {
      return false;
    }

    const content = readFileSync(LOG_FILE, "utf-8");
    const lines = content.trim().split("\n");

    // Track the LAST status for each file in this session
    // If Claude fixed an error, the last status will be "success"
    const fileLastStatus = new Map<string, "success" | "error">();

    for (const line of lines) {
      try {
        const entry = JSON.parse(line);
        if (entry.session_id === sessionId && entry.file_path) {
          fileLastStatus.set(entry.file_path, entry.status);
        }
      } catch {
        // Skip invalid JSON lines
      }
    }

    // Check if ANY file still has an error as its last status
    for (const status of fileLastStatus.values()) {
      if (status === "error") {
        return true;
      }
    }

    return false;
  } catch {
    return false;
  }
}

function playSound(soundPath: string, volume: string): void {
  try {
    execFileSync(PLAY_SOUND, [soundPath, volume], { stdio: "ignore" });
  } catch {
    // Silently fail if sound can't be played
  }
}

async function main() {
  // Read input JSON from stdin
  const chunks: Buffer[] = [];
  for await (const chunk of process.stdin) {
    chunks.push(Buffer.from(chunk));
  }
  const input = Buffer.concat(chunks).toString();

  let hookData: StopHookInput;
  try {
    hookData = JSON.parse(input);
  } catch {
    // If we can't parse input, just play success sound and exit
    playSound(SUCCESS_SOUND, VOLUME);
    process.exit(0);
  }

  const { session_id } = hookData;

  // Check if session had errors
  const hadErrors = checkSessionHadErrors(session_id);

  if (hadErrors) {
    // Play failure sound (louder)
    playSound(FAILURE_SOUND, "0.3");
    // Don't continue YOLO if there were errors
    try { unlinkSync(YOLO_CONTINUE_FLAG); } catch { /* ignore */ }
  } else {
    // Play success sound
    playSound(SUCCESS_SOUND, VOLUME);

    // Check for YOLO mode continuation
    if (existsSync(YOLO_CONTINUE_FLAG)) {
      // Launch YOLO continue script in background
      spawn("npx", ["tsx", YOLO_CONTINUE_SCRIPT], {
        stdio: ["ignore", "inherit", "inherit"],
        detached: true,
      }).unref();
    }
  }
}

main().catch(() => process.exit(0));
