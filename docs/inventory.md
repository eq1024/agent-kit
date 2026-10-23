# 本机现有清单（同步基准）

快照日期 2026-10-23。**原则：机器上已经有的，就是我要的。** 新机器还原的就是这一份，不是上游仓库的全部。

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
| i-have-adhd | `ayghri/i-have-adhd` | 插件市场安装；always-on 段已在 `AGENTS.md` |

合计 15 个 skill + 1 个插件。

## 四、明确不要的

| 东西 | 为什么 |
|---|---|
| `eq1024/skills` 的 i-have-adhd | 与 ayghri 插件 + AGENTS.md 里的 always-on 段重复，三份会打架 |
| mattpocock 仓库其余 20+ 个 | 本机从没装过，按需再加 |
| `eq1024/skills` 的 `commands/eq/*.md` | 斜杠命令，当前宿主不读 `commands/` |

## 五、其他工具目录里还有的（当前宿主读不到）

- `~/.agents/skills/` — 早期用 skills.sh 装的副本
- `~/.claude/skills/` — 8 个
- `~/.pi/agent/skills/` — 4 个

当前目标 agent 只读 `~/.codex/skills` 和仓库里的 `.codex/skills`。上面第一、二节已经都在 `~/.codex/skills/` 了，其余目录保持原样不碰。

## 六、迁移说明：eq1024/skills

那份旧库不再作为依赖源，3 个 skill 已经变成这个仓库的一部分：

- `analyze-frontend`：原版要求把 `prompts/analysis.md` 传给 Claude Code 的 `Agent` 工具（`subagent_type: general-purpose`），当前目标 agent 没有这个工具。已改成让它自己读 `prompts/analysis.md` 并按方法论执行；`prompts/analysis.md`（16KB 九章方法论）内容一字未动。
- `restriction-code`、`ux-review`：原生兼容，直接搬过来。

以后改这 3 个，直接改本仓库 `skills/` 下的文件，不要再回头同步上游。

## 七、怎么加新的

1. 自己写的新 skill → 放 `skills/<名字>/SKILL.md`，在 `manifest.json` 的 `apply` 加一条
2. 别人的 skill → 在 `agentTasks` 加一条，只写来源、文档、要点；要全量还是只取几个用 `only` 写清
3. 改完 `node cli.mjs apply` + `node cli.mjs doctor` 确认
