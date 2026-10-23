import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

function walk(dir, base = dir, out = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name))) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) walk(full, base, out);
    else if (e.isFile()) out.push(path.relative(base, full).replace(/\\/g, '/'));
  }
  return out;
}

export function hashPath(p) {
  if (!fs.existsSync(p)) return null;
  const st = fs.statSync(p);
  const h = crypto.createHash('sha256');
  if (st.isFile()) {
    h.update(fs.readFileSync(p));
    return h.digest('hex').slice(0, 16);
  }
  for (const rel of walk(p)) {
    h.update(rel);
    h.update(fs.readFileSync(path.join(p, rel)));
  }
  return h.digest('hex').slice(0, 16);
}

export function listFiles(dir) {
  return fs.existsSync(dir) ? walk(dir) : [];
}
