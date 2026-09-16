import { readFile, writeFile, mkdir } from "node:fs/promises";
import path from "node:path";

const STATE_FILE = path.join(process.cwd(), "data", "seen.json");

export async function loadSeenIds() {
  try {
    const raw = await readFile(STATE_FILE, "utf-8");
    return new Set(JSON.parse(raw));
  } catch {
    return new Set();
  }
}

export async function saveSeenIds(seenIds) {
  await mkdir(path.dirname(STATE_FILE), { recursive: true });
  await writeFile(STATE_FILE, JSON.stringify([...seenIds]), "utf-8");
}
