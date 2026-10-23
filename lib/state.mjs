import fs from 'node:fs';
import { expand } from './paths.mjs';

export const STATE_FILE = expand('~/.agent-kit.state.json');

export function readState() {
  if (!fs.existsSync(STATE_FILE)) return { version: 1, appliedAt: null, files: {}, agentTasks: {} };
  try {
    return JSON.parse(fs.readFileSync(STATE_FILE, 'utf8'));
  } catch {
    return { version: 1, appliedAt: null, files: {}, agentTasks: {}, _corrupt: true };
  }
}

export function writeState(state) {
  fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2) + '\n');
}
