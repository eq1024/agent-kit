#!/usr/bin/env node
import path from 'node:path';
import { loadManifest, expand, loadEnvFile, REPO_ROOT } from './lib/paths.mjs';
import { apply } from './lib/install.mjs';
import { doctor } from './lib/doctor.mjs';
import { readState, STATE_FILE } from './lib/state.mjs';

const argv = process.argv.slice(2);
const cmd = argv.find((a) => !a.startsWith('-')) || 'help';
const flag = (n) => argv.includes(`--${n}`);

const B = (s) => `\x1b[1m${s}\x1b[0m`;
const DIM = (s) => `\x1b[2m${s}\x1b[0m`;

function printApply(results) {
  const icon = { created: '+', updated: '~', merged: '~', unchanged: '=', 'would-create': '+', 'would-update': '~', 'would-merge': '~', error: '!' };
  for (const r of results) {
    console.log(` ${icon[r.status] || '?'} ${r.id.padEnd(20)} ${r.status.padEnd(13)} ${DIM(r.msg || r.dest)}`);
  }
  const n = (s) => results.filter((r) => r.status.startsWith(s)).length;
  console.log(
    `\n${B('完成')} 新增 ${n('created') + n('would-create')} / 更新 ${n('updated') + n('would-update') + n('merged') + n('would-merge')} / 未变 ${n('unchanged')} / 失败 ${n('error')}`,
  );
  if (results.some((r) => r.status === 'error')) process.exitCode = 1;
}

function printTasks() {
  const m = loadManifest();
  const state = readState();
  console.log(B('给 agent 的任务（按官方文档现查现装，不要照抄任何命令）\n'));
  for (const t of m.agentTasks) {
    const done = state.agentTasks?.[t.id];
    console.log(`${done ? '✓' : '·'} ${B(t.id)}  ${DIM(t.kind)}`);
    if (t.docs) console.log(`   文档: ${t.docs}`);
    if (t.source && t.source !== t.docs) console.log(`   来源: ${t.source}`);
    if (t.needs?.length) console.log(`   需要密钥: ${t.needs.join(', ')}  (见 ~/.agent-kit.env)`);
    if (t.hint) console.log(`   要点: ${t.hint}`);
    if (done) console.log(`   上次: ${done.installedAt} ${done.version || ''} ${done.sourceCommit || ''}`);
    console.log('');
  }
  console.log(DIM(`装完后把结果写进 ${STATE_FILE} 的 agentTasks 字段：{ installedAt, version, sourceCommit, docSeenAt }`));
}

switch (cmd) {
  case 'apply': {
    const dry = flag('dry-run');
    const manifest = loadManifest();
    console.log(B(dry ? '预演（不写盘）' : '应用自建部分') + DIM(`  manifest v${manifest.version} · ${manifest.apply.length} 项`));
    printApply(apply({ dryRun: dry }));
    if (!dry) console.log(DIM('\n下一步: npm run tasks 看剩余需要 agent 执行的部分'));
    break;
  }
  case 'doctor': {
    const { rows, missing, warn, total } = doctor();
    for (const r of rows) console.log(` ${r.icon} ${r.area.padEnd(6)} ${r.id.padEnd(22)} ${DIM(r.detail)}`);
    const parts = [];
    if (missing) parts.push(`${missing} 项缺失`);
    if (warn) parts.push(`${warn} 项需注意`);
    console.log(`\n${B(total - missing - warn)}/${total} 正常` + (parts.length ? `，${parts.join('，')}` : '，环境完整'));
    break;
  }
  case 'tasks':
    printTasks();
    break;
  case 'list':
  case 'ls': {
    const m = loadManifest();
    console.log(B('自建（代码装）'));
    for (const e of m.apply) console.log(`  ${e.id.padEnd(20)} ${DIM(e.kind + ' · ' + (e.targets || [e.to]).join(','))}`);
    console.log(`\n${B('第三方（agent 装）')}`);
    for (const t of m.agentTasks) console.log(`  ${t.id.padEnd(20)} ${DIM(t.kind + (t.provides ? ' · ' + t.provides.length + ' skills' : ''))}`);
    break;
  }
  default:
    console.log(`${B('agent-kit')} — 我的 agent 环境清单

  node cli.mjs apply          应用自建部分（幂等，覆盖前自动备份）
  node cli.mjs apply --dry-run 只看会改什么
  node cli.mjs tasks          列出需要 agent 按官方文档执行的第三方安装
  node cli.mjs doctor         体检：本机 vs manifest 差异
  node cli.mjs list           列出清单

仓库: ${REPO_ROOT}`);
}
