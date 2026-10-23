import fs from 'node:fs';
import path from 'node:path';
import { expand, loadManifest, loadEnvFile } from './paths.mjs';
import { hashPath } from './hash.mjs';
import { readState } from './state.mjs';

const ICON = { ok: 'OK  ', miss: 'MISS', warn: 'WARN' };

function readText(p) {
  try {
    return fs.readFileSync(expand(p), 'utf8');
  } catch {
    return '';
  }
}

/** Codex 的 MCP 配置在 TOML 里。只读扫描，不改文件。 */
function codexMcpServers() {
  const toml = readText('~/.codex/config.toml');
  const names = new Set();
  for (const m of toml.matchAll(/^\s*\[mcp_servers\.([A-Za-z0-9_-]+)/gm)) names.add(m[1]);
  return names;
}

function installedSkills(manifest) {
  const dir = expand(manifest.targets.codex.skills);
  if (!fs.existsSync(dir)) return new Set();
  return new Set(
    fs
      .readdirSync(dir, { withFileTypes: true })
      .filter((e) => e.isDirectory() && !e.name.startsWith('.'))
      .map((e) => e.name),
  );
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
      const key = Object.keys(state.files[entry.id] || {}).find((k) => expand(k) === path.resolve(dest));
      const recorded = key ? state.files[entry.id][key] : null;
      if (!h) {
        rows.push({ icon: ICON.miss, area: '自建', id: entry.id, detail: `缺失` });
        missing++;
      } else if (recorded && recorded !== h) {
        rows.push({ icon: ICON.warn, area: '自建', id: entry.id, detail: '与上次 apply 不一致（本地改过？）' });
      } else if (!recorded) {
        rows.push({ icon: ICON.ok, area: '自建', id: entry.id, detail: '存在，未纳入记录' });
      } else {
        rows.push({ icon: ICON.ok, area: '自建', id: entry.id, detail: '与仓库一致' });
      }
    }
  }

  const servers = codexMcpServers();
  const skills = installedSkills(manifest);
  const codexHome = expand('~/.codex');
  const hasCodex = fs.existsSync(codexHome);

  for (const t of manifest.agentTasks) {
    if (t.kind === 'skill') {
      const wanted = t.provides || [t.id];
      const found = wanted.filter((w) => skills.has(w));
      const hit = found.length === wanted.length;
      if (!hit) missing++;
      rows.push({
        icon: hit ? ICON.ok : ICON.miss,
        area: '第三方',
        id: t.id,
        detail: hit ? `${found.length}/${wanted.length} 个 skill 已存在` : `缺 ${wanted.filter((w) => !skills.has(w)).join(', ')}`,
      });
    } else if (t.kind === 'mcp') {
      const key = t.id.replace(/-mcp$/, '');
      const hit = [...servers].some((s) => s === key || s === t.id);
      if (!hit) missing++;
      const envMissing = (t.needs || []).filter((k) => !process.env[k]);
      const skillMissing = (t.provides || []).filter((s) => !skills.has(s));
      const detail = [
        hit ? 'config.toml 已配置' : 'config.toml 未配置',
        skillMissing.length ? `缺配套 skill ${skillMissing.join(', ')}` : '',
        envMissing.length ? `缺密钥 ${envMissing.join(', ')}` : '',
      ]
        .filter(Boolean)
        .join(' / ');
      const good = hit && !envMissing.length && !skillMissing.length;
      rows.push({ icon: good ? ICON.ok : hit ? ICON.warn : ICON.miss, area: 'MCP', id: t.id, detail });
    }
  }

  const warn = rows.filter((r) => r.icon === ICON.warn).length;
  return { rows, missing, warn, total: rows.length, hasCodex };
}
