# 本机现有清单（同步基准）

快照日期 2026-10-23。**原则：机器上已经有的，就是我要的。** 新机器还原的就是这一份，不是上游仓库的全部。

## 落位规则（先看这个）

Codex 的用户级 skill 目录是 **`$HOME/.agents/skills`**，不是 `~/.codex/skills`（后者是早期版本的路径，官方文档里没有）。

| 作用域 | 路径 |
|---|---|
| 用户级（对所有仓库生效） | `$HOME/.agents/skills` |
| 仓库级 | `$CWD/.agents/skills`、`$REPO_ROOT/.agents/skills` |
| 全局指令 | `$HOME/.codex/AGENTS.md`（或 `AGENTS.override.md`） |
| 机器级 | `/etc/codex/skills` |

本仓库的 `manifest.targets.codex.skills` 指向 `~/.agents/skills`。

## 一、自建（在 `skills/` 里，`apply` 直接装）

| skill | 作用 | 来源 |
|---|---|---|
| bug-debugging | 证据驱动的调试流程 | 自己写的 |
| tapd-workbench | TAPD 工作项查询 | 自己写的 |
| analyze-frontend | 九章前端体检报告 | 原 `eq1024/skills`，已迁入 |
| restriction-code | 四条代码纪律注入 AGENTS.md | 原 `eq1024/skills`，已迁入 |
| ux-review | 7 维度 UX 审查，只审本次改动 | 原 `eq1024/skills`，已迁入 |

## 二、第三方（`agentTasks`，agent 按官方文档装）

| skill | 来源 | 备注 |
|---|---|---|
| context7-mcp | `npx ctx7 setup` 生成 | 跟 MCP 一起装 |
| archify | `tt-a1i/archify` | `npx skills add tt-a1i/archify -g`，18MB |
| design-taste-frontend | `Leonxlnx/taste-skill` | |
| frontend-design | `anthropics/skills` | 与 design-taste 职责有重叠 |
| grill-me | `mattpocock/skills` | 只取 7 个之一 |
| grill-with-docs | 同上 | |
| handoff | 同上 | |
| setup-matt-pocock-skills | 同上 | 每仓库跑一次 |
| tdd | 同上 | |
| teach | 同上 | |
| to-spec | 同上 | |

## 三、插件

| 插件 | 来源 | 备注 |
|---|---|---|
| i-have-adhd | `ayghri/i-have-adhd` | 插件市场装；always-on 段已在 `AGENTS.md` |

合计 **16 个 skill + 1 个插件**，全部在 `~/.agents/skills` 或插件目录下。

## 四、明确不要的

| 东西 | 为什么 |
|---|---|
| `eq1024/skills` 的 i-have-adhd | 与 ayghri 插件 + AGENTS.md 里的 always-on 段重复，三份会打架 |
| mattpocock 仓库其余 20+ 个 | 本机从没装过，按需再加 |
| archify 的其它语言 README、gallery 资源 | 用不上 |

## 五、历史遗留（可以不管）

`~/.codex/skills/` 里还有 4 个早期副本：`bug-debugging`、`tapd-workbench`、`context7-mcp`、`design-taste-frontend`。Codex 的官方扫描路径里没有这个目录，留着不碍事，也没清。真要清理，先确认没有任何旧版本还在读它。

`~/.claude/skills/`、`~/.pi/agent/skills/` 是另外两个工具的目录，各自维护，本仓库不碰。

## 六、迁移说明：eq1024/skills

那份旧库不再作为依赖源，3 个 skill 已经变成这个仓库的一部分：

- `analyze-frontend`：原版要求把 `prompts/analysis.md` 传给 `Agent` 工具（`subagent_type: general-purpose`），不是每个宿主都有。已改成让它自己读 `prompts/analysis.md` 并按方法论执行；该文件（16KB 九章方法论）内容一字未动。
- `restriction-code`、`ux-review`：原生兼容，直接搬过来。

以后改这 3 个，直接改本仓库 `skills/` 下的文件，不要再回头同步上游。

## 七、怎么加新的

1. 自己写的新 skill → 放 `skills/<名字>/SKILL.md`，在 `manifest.json` 的 `apply` 加一条
2. 别人的 skill → 在 `agentTasks` 加一条，只写来源、文档、要点；要全量还是只取几个用 `only` 写清
3. 改完 `node cli.mjs apply` + `node cli.mjs doctor` 确认
