import fs from 'node:fs';
import path from 'node:path';
import { REPO_ROOT, expand, loadManifest } from './paths.mjs';
import { hashPath } from './hash.mjs';
import { readState, writeState, STATE_FILE } from './state.mjs';

const stamp = () => new Date().toISOString().replace(/[-:]/g, '').replace(/\..+/, '');

function pruneBackups(dest, keep = 3) {
  const dir = path.dirname(dest);
  const base = path.basename(dest) + '.bak.';
  if (!fs.existsSync(dir)) return;
  const olds = fs
    .readdirSync(dir)
    .filter((n) => n.startsWith(base))
    .sort()
    .reverse();
  for (const n of olds.slice(keep)) fs.rmSync(path.join(dir, n), { recursive: true, force: true });
}

function backup(dest) {
  const bak = `${dest}.bak.${stamp()}`;
  fs.cpSync(dest, bak, { recursive: true });
  pruneBackups(dest);
  return bak;
}

function deepMerge(target, patch, mergeArrays = false) {
  if (Array.isArray(patch)) {
    if (!Array.isArray(target)) return [...patch];
    const out = [...target];
    for (const v of patch) if (!out.some((x) => JSON.stringify(x) === JSON.stringify(v))) out.push(v);
    return out;
  }
  if (patch && typeof patch === 'object') {
    const out = target && typeof target === 'object' && !Array.isArray(target) ? { ...target } : {};
    for (const [k, v] of Object.entries(patch)) out[k] = deepMerge(out[k], v, mergeArrays);
    return out;
  }
  return patch;
}

function resolveTargets(entry, manifest) {
  if (entry.kind !== 'skill') return [expand(entry.to)];
  return entry.targets.map((t) => {
    const tgt = manifest.targets[t];
    if (!tgt) throw new Error(`未知 target: ${t}`);
    return path.join(expand(tgt.skills), path.basename(entry.from));
  });
}

export function apply({ dryRun = false } = {}) {
  const manifest = loadManifest();
  const state = readState();
  const results = [];
  const record = (id, dest, hash) => {
    if (dryRun || !hash) return;
    state.files[id] = { ...(state.files[id] || {}), [dest]: hash };
  };

  for (const entry of manifest.apply) {
    for (const dest of resolveTargets(entry, manifest)) {
      const src = path.join(REPO_ROOT, entry.from);
      const before = hashPath(dest);

      if (entry.kind === 'merge-json') {
        if (!fs.existsSync(src)) {
          results.push({ id: entry.id, dest, status: 'error', msg: `源文件缺失 ${entry.from}` });
          continue;
        }
        const patch = JSON.parse(fs.readFileSync(src, 'utf8'));
        const current = fs.existsSync(dest) ? JSON.parse(fs.readFileSync(dest, 'utf8')) : {};
        const merged = deepMerge(current, patch, entry.mergeArrays);
        const changed = JSON.stringify(merged) !== JSON.stringify(current);
        if (!changed) {
          results.push({ id: entry.id, dest, status: 'unchanged' });
        } else if (dryRun) {
          results.push({ id: entry.id, dest, status: 'would-merge' });
        } else {
          fs.mkdirSync(path.dirname(dest), { recursive: true });
          if (fs.existsSync(dest)) backup(dest);
          fs.writeFileSync(dest, JSON.stringify(merged, null, 2) + '\n');
          results.push({ id: entry.id, dest, status: 'merged', msg: '已合并，其他字段保留' });
        }
        continue;
      }

      if (!fs.existsSync(src)) {
        results.push({ id: entry.id, dest, status: 'error', msg: `源缺失 ${entry.from}` });
        continue;
      }

      const srcHash = hashPath(src);
      if (before === srcHash) {
        results.push({ id: entry.id, dest, status: 'unchanged' });
        record(entry.id, dest, before);
        continue;
      }
      if (dryRun) {
        results.push({ id: entry.id, dest, status: before ? 'would-update' : 'would-create' });
        continue;
      }

      fs.mkdirSync(path.dirname(dest), { recursive: true });
      let bak = null;
      if (before) bak = backup(dest);
      fs.rmSync(dest, { recursive: true, force: true });
      fs.cpSync(src, dest, { recursive: true });
      results.push({ id: entry.id, dest, status: before ? 'updated' : 'created', msg: bak ? `旧版本备份于 ${path.basename(bak)}` : '' });
      record(entry.id, dest, hashPath(dest));
    }
  }

  if (!dryRun) {
    state.version = 1;
    state.appliedAt = new Date().toISOString();
    state.manifestVersion = manifest.version;
    writeState(state);
    ensureEnvTemplate(manifest, dryRun);
  }
  return results;
}

export function ensureEnvTemplate(manifest, dryRun = false) {
  const file = expand('~/.agent-kit.env');
  if (fs.existsSync(file)) return null;
  const lines = [
    '# agent-kit 密钥文件。不要提交到任何仓库。',
    '# 填好后 agent 会从这里读取；也可以直接用系统环境变量覆盖。',
    '',
    ...(manifest.tokens || []).flatMap((t) => [`# ${t.usedBy} 需要，去这里拿: ${t.howToGet}`, `${t.key}=`, '']),
    '',
  ];
  if (!dryRun) fs.writeFileSync(file, lines.join('\n'));
  return file;
}

export { STATE_FILE };
