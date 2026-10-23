import os from 'node:os';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';

export const REPO_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
export const IS_WIN = process.platform === 'win32';

/**
 * 跨端规则：仓库里所有路径都用 ~/ 或正斜杠写，运行时才展开。
 * expand() 是唯一入口，避免 mac/linux 与 windows 分叉。
 */
export function expand(p) {
  if (!p) return p;
  const norm = String(p).replace(/\\/g, '/');
  if (norm === '~') return os.homedir();
  if (norm.startsWith('~/')) return path.join(os.homedir(), ...norm.slice(2).split('/'));
  return path.resolve(p);
}

/** 反向：绝对路径 -> ~/xxx，用于输出和 state 文件（让 state 跨机器可读）。 */
export function tilde(p) {
  const home = os.homedir().replace(/\\/g, '/');
  const norm = path.resolve(p).replace(/\\/g, '/');
  if (norm === home) return '~';
  if (norm.startsWith(home + '/')) return '~/' + norm.slice(home.length + 1);
  return norm;
}

export function loadManifest() {
  return JSON.parse(fs.readFileSync(path.join(REPO_ROOT, 'manifest.json'), 'utf8'));
}

/** Load ~/.agent-kit.env into process.env without overwriting existing vars. */
export function loadEnvFile(file = expand('~/.agent-kit.env')) {
  if (!fs.existsSync(file)) return [];
  const loaded = [];
  for (const line of fs.readFileSync(file, 'utf8').split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Za-z0-9_]+)\s*=\s*(.*?)\s*$/);
    if (!m) continue;
    const [, k, v0] = m;
    const v = v0.replace(/^["']|["']$/g, '').trim();
    loaded.push({ key: k, hasValue: v.length > 0 && !v.startsWith('<') });
    if (!process.env[k] && v && !v.startsWith('<')) process.env[k] = v;
  }
  return loaded;
}
