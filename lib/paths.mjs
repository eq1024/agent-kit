import os from 'node:os';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import fs from 'node:fs';

export const REPO_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

export function expand(p) {
  if (!p) return p;
  if (p === '~') return os.homedir();
  if (p.startsWith('~/') || p.startsWith('~\\')) return path.join(os.homedir(), p.slice(2));
  return path.resolve(p);
}

export function loadManifest() {
  return JSON.parse(fs.readFileSync(path.join(REPO_ROOT, 'manifest.json'), 'utf8'));
}

/** Load ~/.agent-kit.env into process.env without overwriting existing vars. */
export function loadEnvFile(file = expand('~/.agent-kit.env')) {
  if (!fs.existsSync(file)) return [];
  const loaded = [];
  for (const line of fs.readFileSync(file, 'utf8').split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/i);
    if (!m) continue;
    const [, k, v0] = m;
    const v = v0.replace(/^["']|["']$/g, '').trim();
    loaded.push({ key: k, hasValue: v.length > 0 && !v.startsWith('<') });
    if (!process.env[k] && v && !v.startsWith('<')) process.env[k] = v;
  }
  return loaded;
}
