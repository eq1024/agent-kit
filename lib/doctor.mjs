import fs from 'node:fs';
import path from 'node:path';
import { expand, loadManifest, loadEnvFile } from './paths.mjs';
import { hashPath } from './hash.mjs';
import { readState } from './state.mjs';

const ok = (s) => s;
const ICON = { ok: 'OK  ', miss: 'MISS', warn: 'WARN' };

function readJson(p) {
  try {
    return JSON.parse(fs.readFileSync(expand(p), 'utf8'));
  } catch {
    return null;
  }
}

function mcpServerNames() {
  const names = new Set();
  for (const f of ['~/.pi/agent/mcp.json']) {
    const j = readJson(f);
    for (const k of Object.keys(j?.mcpServers || {})) names.add(k);
  }
  const cj = readJson('~/.claude.json');
  for (const k of Object.keys(cj?.mcpServers || {})) names.add(k);
  return names;
}

export function doctor() {
  const manifest = loadManifest();
  const state = readState();
  loadEnvFile();
  const rows = [];
  let missing = 0;

  for (const entry of manifest.apply) {
    const dests =
      entry.kind === 'skill'
        ? entry.targets.map((t) => path.join(expand(manifest.targets[t].skills), path.basename(entry.from)))
        : [expand(entry.to)];
    for (const dest of dests) {
      const h = hashPath(dest);
      const recorded = state.files[entry.id]?.[dest];
      if (!h) {
        rows.push({ icon: ICON.miss, area: '自建', id: entry.id, detail: `缺失: ${dest}` });
        missing++;
      } else if (recorded && recorded !== h) {
        rows.push({ icon: ICON.warn, area: '自建', id: entry.id, detail: `与上次 apply 不一致（本地改过？）: ${dest}` });
      } else {
        rows.push({ icon: ICON.ok, area: '自建', id: entry.id, detail: dest });
      }
    }
  }

  const servers = mcpServerNames();
  const skillDirs = new Set();
  for (const t of Object.values(manifest.targets)) {
    const d = expand(t.skills);
    if (fs.existsSync(d)) for (const n of fs.readdirSync(d)) skillDirs.add(n);
  }
  const piSettings = readJson('~/.pi/agent/settings.json') || {};

  for (const t of manifest.agentTasks) {
    if (t.kind === 'skill') {
      const wanted = t.provides || [t.id];
      const found = wanted.filter((w) => skillDirs.has(w));
      const hit = found.length === wanted.length;
      if (!hit) missing++;
      rows.push({
        icon: hit ? ICON.ok : ICON.miss,
        area: '第三方',
        id: t.id,
        detail: hit ? `${found.length}/${wanted.length} 个 skill 已存在` : `缺 ${wanted.filter((w) => !skillDirs.has(w)).join(', ')}`,
      });
    } else if (t.kind === 'mcp') {
      const key = t.id.replace(/-mcp$/, '');
      const hit = [...servers].some((s) => s === key || s === t.id || s.includes(key));
      if (!hit) missing++;
      const envMissing = (t.needs || []).filter((k) => !process.env[k]);
      const detail = [
        hit ? '已配置' : '未配置',
        envMissing.length ? `缺密钥 ${envMissing.join(', ')}` : '',
      ]
        .filter(Boolean)
        .join(' / ');
      rows.push({ icon: hit && !envMissing.length ? ICON.ok : hit ? ICON.warn : ICON.miss, area: 'MCP', id: t.id, detail });
    } else if (t.kind === 'package') {
      const hit = (piSettings.packages || []).some((p) => p === t.source);
      if (!hit) missing++;
      rows.push({ icon: hit ? ICON.ok : ICON.miss, area: 'pi 包', id: t.id, detail: hit ? t.source : '未写入 pi settings.packages' });
    }
  }

  const warn = rows.filter((r) => r.icon === ICON.warn).length;
  return { rows, missing, warn, total: rows.length };
}

export { ok };
