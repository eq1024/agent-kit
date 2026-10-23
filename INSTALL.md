# INSTALL.md — 给 agent 的执行手册

目标：让这台机器的 agent 环境达到 `manifest.json` 的状态。mac / linux / windows 都适用。

**两条铁律**

1. `manifest.apply` 的东西由代码装，直接跑命令，不要手写文件。
2. `manifest.agentTasks` 的东西**没有写死的安装命令**，官方文档会变，你必须现查再执行。

---

## 第 0 步：先读仓库规则

先读仓库根目录的 `AGENTS.md`，那里有这个仓库的不变量（不写死命令、不碰 config.toml 机器专属段、密钥只进 env、装完必写 state）。再继续。

## 第 1 步：确认前提

```bash
node --version    # 需要 >= 18
ls ~/.codex       # 需要存在：config.toml、skills/
```

目标目录不存在就先让用户装好对应工具并登录一次，然后停下来等。

### 装到哪（换宿主时看这张表）

| 宿主 | skill 目录 | 全局说明 | MCP 配置 | mcp 子命令 |
|---|---|---|---|---|
| Codex | `~/.codex/skills` | `~/.codex/AGENTS.md` | `~/.codex/config.toml` | `codex mcp add` |
| Claude Code | `~/.claude/skills` | `~/.claude/CLAUDE.md` | `~/.claude.json` | `claude mcp add` |
| pi | `~/.pi/agent/skills` | `~/.pi/agent/AGENTS.md` | `~/.pi/agent/mcp.json` | `pi mcp add` |

`manifest.json` 的 `targets` 里三条都写好了，清单条目默认只指向 `codex`。换宿主就把条目的 `targets` 数组改成对应名字，并把 `codex-AGENTS.md` 那条的 `to` 换掉。代码不用改。

## 第 2 步：看清单，报给用户

```bash
node cli.mjs list
```

一句话说明要做什么，用户确认后再动手。

## 第 3 步：跑自建部分（确定性，幂等）

```bash
node cli.mjs apply --dry-run
node cli.mjs apply
```

会做四件事：把 3 个自建 skill 放进 `~/.codex/skills/`、写 `~/.codex/AGENTS.md`。

覆盖前自动备份成 `<目标>.bak.<时间戳>`，每个目标只留最近 3 份。失败不要强来，原样报给用户。

> **不要往仓库里放工具自带的 skill。** 比如 `context7-mcp` 是 `npx ctx7 setup` 生成的，跟着工具版本变。这类只登记在 `agentTasks`，由安装器自己写，复制进仓库等于把别人的代码当自己的维护。

## 第 4 步：逐项处理第三方

```bash
docs/mcp.md      # 5 个 MCP 的调研记录（端点、密钥、坑）
docs/plugins.md  # 第三方 skill / 插件（mattpocock 只装 7 个、i-have-adhd）
docs/inventory.md # 本机现有的 skill 清单（同步基准：机器上有的就是要的）
node cli.mjs tasks
```

每一项：

1. 打开 `文档:` 链接，读**当前**安装方式。仓库里只有来源、要点和坑，没有可照抄的命令。`docs/mcp.md` / `docs/plugins.md` 里有每个条目的端点、传输类型、密钥来源和已知坑，先看它们再开文档。
2. 按文档装。skill 装到 `~/.codex/skills/<name>/`（必须包含 `SKILL.md`）。
   如果任务带 `installer` 字段（比如 context7 的 `npx ctx7 setup`），优先用官方安装器，它会把 MCP 和配套 skill 一起装好，不要自己拆开装。
3. MCP 优先用宿主自己的 mcp 子命令（当前目标是 Codex，所以是 `codex mcp add`）：

```bash
codex mcp add <name> --url <url>          # HTTP 型
codex mcp add <name> -- <command> <args>  # stdio 型
```

没有 `codex` CLI 时，才改 `~/.codex/config.toml`：先备份，再在末尾追加 `[mcp_servers.<name>]` 表。**不要重写整个文件**，里面有 `model_provider`、`notify`、`projects` 等本机专属配置。

4. 需要密钥的：先看 `~/.agent-kit.env` 有没有值；没有就停下来问用户要（去哪拿写在 `manifest.tokens[].howToGet`）。拿到后写进 `~/.agent-kit.env`，不要写进仓库，也不要贴进聊天记录。
5. 装完写进 `~/.agent-kit.state.json`：

```json
{
  "agentTasks": {
    "context7-mcp": {
      "installedAt": "2026-01-01T00:00:00.000Z",
      "version": "1.2.3",
      "sourceCommit": "abc1234",
      "docSeenAt": "2026-01-01",
      "where": ["~/.codex/config.toml"]
    }
  }
}
```

这一步不能省。没有它，下次没人知道这台机器上是什么版本。

## 第 5 步：体检

```bash
node cli.mjs doctor
```

`MISS` = 还没有，`WARN` = 装了但和记录不一致或密钥缺失。逐项修完再交差。

---

## 跨平台差异（必须看）

| 项目 | windows | mac / linux |
|---|---|---|
| npx 型 MCP 命令 | `cmd` + `/c npx -y ...` | 直接 `npx -y ...` |
| 路径写法 | 代码里统一 `~/` 和正斜杠，运行时展开 | 同 |
| 文件权限 | 无需处理 | `~/.agent-kit.env` 必须 `chmod 600` |
| 换行 | 仓库用 `.gitattributes` 固定 LF | 同 |
| 目录链接 | junction 需管理员，**别用**，直接复制 | symlink 可选 |

## 绝对不能碰的文件

- `~/.codex/auth.json` — 登录态
- `~/.codex/rules/default.rules` — 本机审批记录，含绝对路径
- `~/.codex/config.toml` 里的 `model*`、`model_provider*`、`notify`、`projects`、`node_repl` — 全部本机专属

用户只维护 `manifest.json`、`INSTALL.md`、`docs/`。代码只做 `apply` / `doctor` / `tasks`。
