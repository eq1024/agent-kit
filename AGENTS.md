# AGENTS.md

给在这个仓库里干活的 agent 看的。`README.md` 是给人看的，这里才是操作规则。

这是**仓库级**说明，只在本仓库里生效。要装到 `~/.codex/AGENTS.md` 的全局版本是 `config/codex-AGENTS.md`，两者别搞混。

## 这个仓库是什么

一份 agent 环境清单。不是应用，没有运行时，没有依赖。

它把配置分成两类，**这个划分是整个仓库的地基，不要打破**：

| 类别 | 例子 | 谁执行 | 落在 |
|---|---|---|---|
| 几乎不变的 | 自己写的 skill、`AGENTS.md` | `cli.mjs apply`，复制 + 哈希对账 | `manifest.json` 的 `apply` |
| 天天在变的 | 别人的 skill、MCP、插件 | 读官方文档现装 | `manifest.json` 的 `agentTasks` |

第二类**只记来源、文档、密钥、坑，不记命令**。因为上游装法会变：context7 换过安装器，memos 从社区 npm 包变成了服务端自带，mattpocock 的仓库从 7 个 skill 长到 30 个。写死命令等于埋一个半年后引爆的雷，而且炸得很安静。

## 目录职责

```
manifest.json   清单。改环境就是改这里
cli.mjs         apply / doctor / tasks / list 四个命令
lib/            install（复制+备份）、doctor（对账）、hash、state、paths
skills/         自建的 5 个 skill，代码直接装
config/         全局 AGENTS.md 模板
docs/           调研记录：inventory / mcp / plugins
INSTALL.md      新机器的执行手册
PROMPT.md       给 agent 的开场白
```

## 六条不变量

1. **`agentTasks` 里不出现安装命令。** 只写 `docs`、`needs`、`hint`、`verify`。hint 写「为什么」和「哪里容易踩坑」，不写「执行这一行」。
2. **第三方 skill 不进 `skills/`。** 例外：`analyze-frontend`、`restriction-code`、`ux-review` 已经从 `eq1024/skills` 迁入，现在是自建，改它们就改本仓库，不要回头同步上游。
3. **不碰 `~/.codex/config.toml` 的机器专属段。** `model`、`model_provider`、`notify`、`projects`、`node_repl` 都带本机绝对路径。同理不碰 `auth.json`、`rules/default.rules`。
4. **密钥只进 `~/.agent-kit.env`。** 不写进仓库、不贴进聊天、不写进 `config.toml`。
5. **覆盖前必须备份。** `apply` 已经做了（`<目标>.bak.<时间戳>`，每个目标留 3 份），不要绕过它手写文件。
6. **装完必须写 `~/.agent-kit.state.json`。** 每个 agentTask 记 `{ installedAt, version, sourceCommit, docSeenAt }`。没有这条记录，`doctor` 就无法对账，「交给 agent」就退化成每台机器一个独立分支。

## 常见操作

**加一个自己的 skill**：放 `skills/<名字>/SKILL.md`，在 `manifest.json` 的 `apply` 加一条 `kind: "skill"`。

**加一个别人的 skill 或 MCP**：在 `agentTasks` 加一条。要全量还是只取几个写进 `only` / `provides`。同步更新 `docs/`。

**改清单后验证**：

```bash
node cli.mjs apply --dry-run   # 会改什么
node cli.mjs apply
node cli.mjs doctor            # MISS / WARN 应为 0
```

**验证全新机器**（不要动本机真实目录）：

```bash
USERPROFILE=/tmp/fresh node cli.mjs apply    # windows
HOME=/tmp/fresh node cli.mjs apply           # mac / linux
```

## 跨端约束

- 代码只用 `node:` 内置模块，不依赖 `cp`、`ln`、`mklink`
- 仓库内路径一律写 `~/` 和正斜杠，运行时经 `lib/paths.mjs` 的 `expand()` 展开
- 输出和 `state.json` 用 `tilde()` 反写回 `~/...`，让状态文件跨机器可读
- `.gitattributes` 固定 LF，否则 mac/linux 上 `cli.mjs` 带 CRLF 会跑不起来
- 平台差异（Windows 上 stdio MCP 要 `cmd /c` 包裹）写在清单的 hint 里，不写进代码

## 已知坑

- `analyze-frontend` 原版要求把 `prompts/analysis.md` 传给 `Agent` 工具（`subagent_type: general-purpose`）。不是每个宿主都有这个工具，已改成让执行者自己按方法论跑。**不要改回去。**
- `~/.agents/skills`、`~/.claude/skills`、`~/.pi/agent/skills` 里的副本当前目标 agent 读不到。不要在那些目录里改东西。
- mattpocock 用 `plugin add mattpocock-skills@mattpocock` 会一次装 30 个，和「只要 7 个」冲突。用 `npx skills add ... --skill <名字>`。
- context7 的 `npx ctx7 setup` 目前只支持 cursor / claude / opencode，其他 agent 要按 all-clients 文档手动配 MCP。
- 详见 `docs/mcp.md`、`docs/plugins.md`。

## 它不管什么

不装 Node、不装 agent 工具本身、不登录。不做版本回滚，只做覆盖前备份。不管另外三个工具目录里的旧副本。
