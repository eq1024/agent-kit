<div align="center">

# 🧰 agent-kit

#### 我自己每天在用的 Codex 工作环境

[![License](https://img.shields.io/badge/License-MIT-3B82F6?style=for-the-badge)](./LICENSE)
[![Skills](https://img.shields.io/badge/Skills-15-10B981?style=for-the-badge)](#-skills)
[![MCP](https://img.shields.io/badge/MCP-5-8B5CF6?style=for-the-badge)](#-mcp)

![Codex](https://img.shields.io/badge/Codex-Skill-000000?style=flat-square)
![macOS](https://img.shields.io/badge/macOS-✓-A2AAAD?style=flat-square&logo=apple&logoColor=white)
![Linux](https://img.shields.io/badge/Linux-✓-FCC624?style=flat-square&logo=linux&logoColor=black)
![Windows](https://img.shields.io/badge/Windows-✓-0078D4?style=flat-square&logo=windows&logoColor=white)

</div>

换电脑不用重装一遍 agent。一个仓库，一条命令，mac / linux / windows 同一套。

不变的（自己的 skill、`AGENTS.md`）用代码装；会变的（别人的 skill、需要 token 的 MCP）只记来源和坑，装的时候让 Codex 自己去读官方文档。

---

## 📋 目录

| 名字 | 一句话 |
|---|---|
| 🚀 [**快速开始**](#-快速开始) | 三条命令，或者把仓库地址丢给 Codex |
| 🧠 [**Skills**](#-skills) | 15 个，自建 5 个 + 第三方 10 个 |
| 🔌 [**MCP**](#-mcp) | context7、memos、playwright、codegraph、cloudbase |
| 🛠 [**怎么维护**](#-怎么维护) | 改自己的东西 / 加别人的东西 |

---

## 🚀 快速开始

```bash
node cli.mjs apply      # 装自建部分
node cli.mjs tasks      # 剩下要 agent 做的，列成任务单
node cli.mjs doctor     # 体检，看还差什么
```

懒的话直接把仓库丢给 Codex，让它读 [`INSTALL.md`](./INSTALL.md)。开场白在 [`PROMPT.md`](./PROMPT.md)。

| 命令 | 作用 |
|---|---|
| `apply` | 装自建部分，幂等，覆盖前自动备份 |
| `apply --dry-run` | 只预演 |
| `tasks` | 第三方任务清单，带文档、密钥、验收标准 |
| `doctor` | 本机 vs 清单：`MISS` 缺失 / `WARN` 不一致 |

---

## 🧠 Skills

### 自建（代码装）

| 名字 | 一句话 |
|---|---|
| 🐛 **bug-debugging** | 证据驱动的调试流程，先给修复方案再动代码 |
| 📋 **tapd-workbench** | 查 TAPD 工作项、评论、图片 |
| 🔍 **analyze-frontend** | 九章前端体检报告：架构分层、Git 审计、风险清单、重构路线 |
| 🛡️ **restriction-code** | 给 AI 注入代码纪律，防止乱改和过度设计 |
| 🎨 **ux-review** | 只审本次改动，7 个维度打磨体验，不碰业务逻辑 |

### 第三方（Codex 现装）

| 名字 | 一句话 |
|---|---|
| 🎨 **design-taste-frontend** | 前端视觉品味，带 247 个站点研究库 |
| 🎨 **frontend-design** | Anthropic 官方前端设计 |
| 💬 **mattpocock 7 个** | `grill-me`、`grill-with-docs`、`handoff`、`tdd`、`teach`、`to-spec`、`setup-matt-pocock-skills` |
| 🧠 **i-have-adhd**（插件） | 回复格式：先行动、编号、无废话 |

明细见 [`docs/inventory.md`](./docs/inventory.md)。

---

## 🔌 MCP

| 名字 | 形态 | 密钥 |
|---|---|---|
| context7 | 官方安装器 `npx ctx7 setup`，带配套 skill | OAuth 自生成 |
| memos | Memos v0.27+ 自带 `/mcp`，零安装 | 实例地址 + token |
| playwright | `npx @playwright/mcp` | 无 |
| codegraph | 全局 `@colbymchenry/codegraph` | 无 |
| cloudbase | `@cloudbase/cloudbase-mcp` 或插件市场 | 远端 OAuth |

端点、跨端差异、已知坑：[`docs/mcp.md`](./docs/mcp.md)

---

## 🛠 怎么维护

**改自己的** → 改 `skills/<名字>/SKILL.md`，跑 `apply` + `doctor`。

**加别人的** → 在 `manifest.json` 的 `agentTasks` 加一条，只写来源、文档、密钥、坑，**不写命令**：

```json
{
  "id": "memos-mcp",
  "kind": "mcp",
  "transport": "http",
  "docs": "https://usememos.com/docs/integrations/mcp",
  "needs": ["MEMOS_URL", "MEMOS_TOKEN"],
  "hint": "Memos v0.27+ 自带 MCP，不需要装 npm 包。地址 https://<实例>/mcp，Bearer token。"
}
```

命令让装的那一刻的 Codex 自己去读文档，因为装法会变。

---

## 🌟 关于

配置分两种：不怎么会变的，和天天在变的。混在一起写死，半年后必然失效，而且失败得很安静。

所以这里只把稳定的那半写进代码，另一半留成「意图 + 坑」，交给装的时候现场判断。

密钥全在 `~/.agent-kit.env`，不进仓库。`~/.codex/config.toml` 里的 model、provider、项目列表一个字节都不碰。

MIT
