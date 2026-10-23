# agent-kit

Codex 全局环境清单。一个仓库，一台新机器，mac / linux / windows 三端同一套。

自建的（自己的 skill、AGENTS.md）用代码装；第三方的（别人的 skill、需要 token 的 MCP）只记意图，由 agent 现查官方文档装。

## 用法

```bash
node cli.mjs apply      # 装自建部分
node cli.mjs tasks      # 看还需要 agent 做什么
node cli.mjs doctor     # 体检
```

或者直接把仓库地址丢给 agent：见 `PROMPT.md`。

## 命令

| 命令 | 作用 |
|---|---|
| `node cli.mjs apply` | 装自建部分，幂等，覆盖前备份 |
| `node cli.mjs apply --dry-run` | 只预演 |
| `node cli.mjs tasks` | 列出需要 agent 执行的第三方安装 |
| `node cli.mjs doctor` | 本机 vs 清单的差异 |
| `node cli.mjs list` | 打印清单 |

## 装到哪

全部落在 `~/.codex/`：

```
~/.codex/skills/      自建 2 个 + 第三方 skill
~/.codex/AGENTS.md    全局指令
~/.codex/config.toml  MCP 配置（agent 写入，代码不碰）
```

## 用的 5 个 MCP

| MCP | 形态 | 密钥 |
|---|---|---|
| context7 | 官方安装器 `npx ctx7 setup`，带配套 skill | OAuth 自生成 |
| memos | Memos v0.27+ 自带 `/mcp`，零安装 | 实例地址 + token |
| playwright | `npx @playwright/mcp` | 无 |
| codegraph | 全局 `@colbymchenry/codegraph` | 无 |
| cloudbase | `@cloudbase/cloudbase-mcp` 或插件市场 | 远端 OAuth / 本地密钥 |

详细端点、跨端差异、已知坑：`docs/mcp.md`。

插件：i-have-adhd（Codex 插件市场装，always-on 段落已内置在 `AGENTS.md` 里）——见 `docs/plugins.md`。

## 你怎么维护

1. 改自己的 skill → 改 `skills/` 目录
2. 加第三方 skill / MCP → 在 `manifest.json` 的 `agentTasks` 加一条，只写来源、文档、要点，**不写命令**
3. 新增或改 MCP / 插件 → 同步更新 `docs/mcp.md` 或 `docs/plugins.md`
4. `git push`

## 跨端

代码只用 Node 内置模块，路径全部经 `lib/paths.mjs` 的 `expand()`，仓库里的路径一律写成 `~/`。换行由 `.gitattributes` 固定 LF。`~/.agent-kit.env` 在 mac/linux 上自动 `chmod 600`。

## 密钥

只放 `~/.agent-kit.env`，不进仓库。第一次 `apply` 自动生成模板。

## 不进仓库的东西

`~/.codex/config.toml` 的 model / notify / projects / node_repl、`auth.json`、`rules/default.rules` —— 都带本机绝对路径或登录态。清单里的 `machineSpecific` 字段有记录。
