# 本机现有清单（同步基准）

快照日期 2026-10-23。**原则：机器上已经有的，就是我要的。** 新机器要还原的就是这一份，不是上游仓库的全部。

## Codex 实际能用的（`~/.codex/skills/`）

| skill | 来源 | 谁维护 |
|---|---|---|
| bug-debugging | 本仓库 | 我 |
| tapd-workbench | 本仓库 | 我 |
| context7-mcp | `npx ctx7 setup` 生成 | 官方安装器 |
| design-taste-frontend | `Leonxlnx/taste-skill` | 第三方 |
| frontend-design | `anthropics/skills` | 第三方 |
| analyze-frontend | `eq1024/skills` | 第三方（已打 Codex 补丁） |
| restriction-code | `eq1024/skills` | 第三方 |
| ux-review | `eq1024/skills` | 第三方 |
| grill-me | `mattpocock/skills` | 第三方 |
| grill-with-docs | `mattpocock/skills` | 第三方 |
| handoff | `mattpocock/skills` | 第三方 |
| setup-matt-pocock-skills | `mattpocock/skills` | 第三方 |
| tdd | `mattpocock/skills` | 第三方 |
| teach | `mattpocock/skills` | 第三方 |
| to-spec | `mattpocock/skills` | 第三方 |

共 15 个。mattpocock 只取 7 个，**不装他仓库里另外 20 多个**；eq1024 只取 3 个，**不装 i-have-adhd**（与已有插件重复）。

## 其他工具目录里还有的（Codex 读不到）

- `~/.agents/skills/` — 11 个，早期用 skills.sh 装的，是上表的超集（多出 context7-mcp 等）
- `~/.claude/skills/` — 8 个
- `~/.pi/agent/skills/` — 4 个

这些目录 Codex 都不读。上表已同步到 `~/.codex/skills/`，其余保持原样不动。

## 怎么加新的

1. 想加某个 mattpocock skill → 加进 `manifest.json` 里 `mattpocock-skills` 的 `only` 和 `provides`
2. 想加别的第三方 skill → 在 `agentTasks` 新增一条，只写来源、文档、要点
3. 改完跑 `node cli.mjs apply`，再 `node cli.mjs doctor` 确认

## 为什么这么记

上游仓库一直在长（mattpocock 从 7 个长到 30 个）。跟上游全量同步 = 每次换机器都拿到一堆没用过的 skill，还多一份维护成本。以**本机实际有的**为准，增量才考虑。
