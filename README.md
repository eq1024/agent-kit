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



# agent-kit

换电脑不用重装一遍 agent 环境。

这是一个环境清单，不是应用程序。它保存我每天在用的 agent 配置：16 个 skill、5 个 MCP、1 个插件，以及全局 `AGENTS.md`。

## 怎么用

把这句话发给你的 agent：

```
查看 https://github.com/eq1024/agent-kit 项目并帮我安装
```

它会先读 `AGENTS.md`（仓库规则），再按 `INSTALL.md` 装，装完跑 `doctor` 自检。

## Skill

自建（代码直接装）：

| 名字 | 一句话 |
|---|---|
| bug-debugging | 证据驱动的调试流程，先给修复方案再动代码 |
| tapd-workbench | 查 TAPD 工作项、评论、图片 |
| analyze-frontend | 九章前端体检报告：架构分层、Git 审计、风险清单、重构路线 |
| restriction-code | 给 AI 注入代码纪律，防止乱改和过度设计 |
| ux-review | 只审本次改动，7 个维度打磨体验，不碰业务逻辑 |

第三方（agent 现查文档装）：

| 名字 | 一句话 |
|---|---|
| design-taste-frontend | 前端视觉品味，带 247 个站点研究库 |
| frontend-design | Anthropic 官方前端设计 |
| archify | 一句话或一个仓库 → 可交互 HTML 架构图 / 解释页 |
| mattpocock 7 个 | grill-me、grill-with-docs、handoff、tdd、teach、to-spec、setup-matt-pocock-skills |
| i-have-adhd（插件） | 回复格式：先行动、编号、无废话 |

## MCP

| 名字 | 形态 | 密钥 |
|---|---|---|
| context7 | 官方安装器 `npx ctx7 setup`，带配套 skill | OAuth 自生成 |
| memos | Memos v0.27+ 自带 `/mcp`，零安装 | 实例地址 + token |
| playwright | `npx @playwright/mcp` | 无 |
| codegraph | 全局 `@colbymchenry/codegraph` | 无 |
| cloudbase | `@cloudbase/cloudbase-mcp` 或插件市场 | 远端 OAuth |

## 文档

| 文件 | 内容 |
|---|---|
| `INSTALL.md` | 在新机器上执行的步骤 |
| `AGENTS.md` | 这个仓库的运作规则，改之前先读 |
| `docs/inventory.md` | 本机现有 skill 清单，同步基准 |
| `docs/mcp.md` | 5 个 MCP 的端点、跨端差异、已知坑 |
| `docs/plugins.md` | 插件与第三方 skill 的装法 |

密钥全在 `~/.agent-kit.env`，不进仓库。

MIT
