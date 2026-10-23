# 插件 / skill — 第三方记录

## eq-skills（我自己的旧 skill 库）

- 仓库：https://github.com/eq1024/skills
- 4 个 skill，**只装 3 个**：`analyze-frontend`、`restriction-code`、`ux-review`
- 跳过的：`i-have-adhd`（和已装的 ayghri 插件 + `AGENTS.md` 里的 always-on 段重复）

| skill | 作用 | Codex 兼容性 |
|---|---|---|
| analyze-frontend | 九章前端体检报告（项目概览 → 文件树 → Git 审计 → 架构分层 → 公共封装 → 配置 → 风险 → 重构路线 → 战略对标） | **要打补丁**，见下 |
| restriction-code | 把四条代码纪律（谋定而后动 / 大道至简 / 外科手术式修改 / 目标驱动）写进 AGENTS.md | 原生兼容，自己会识别宿主 |
| ux-review | 只审本次改动的文件，7 个维度：加载态 / 错误态 / 空态 / 边界守卫 / 响应式渲染 / 细节打磨 / 网络性能 | 原生兼容，用 git diff 取范围 |

### analyze-frontend 必须打补丁

原版要求「把 `prompts/analysis.md` 传给 Agent 工具，`subagent_type: general-purpose`」——那是 Claude Code 的子代理，Codex 没有。

补丁：`patches/analyze-frontend-codex.md`，只改 SKILL.md 正文，`prompts/analysis.md` 一字不动。不打补丁的话它会在运行时找不存在的工具。

### 装法

```bash
npx eq-skills
# 或 clone 后拷 skills/<名字> 到 ~/.codex/skills/
```

仓库里的 `commands/eq/*.md` 是斜杠命令，Codex 用不上，忽略。

---

## mattpocock-skills（只装 7 个，不是全量）

- 仓库：https://github.com/mattpocock/skills
- 安装说明：https://github.com/mattpocock/skills#installation-30-second-setup
- **本机只装这 7 个**：`grill-me`、`grill-with-docs`、`handoff`、`setup-matt-pocock-skills`、`tdd`、`teach`、`to-spec`
- 仓库里现在有 30 来个，**不装全部**。以本机实际有的为准，完整清单见 `docs/inventory.md`

### 装法

```bash
npx skills add mattpocock/skills --skill tdd --skill grill-me
```

或者从已装副本拷到 `~/.codex/skills/<名字>/`。

### 三个坑

1. **不要用 `codex plugin add mattpocock-skills@mattpocock`** —— 那是一次装 30 个，和「只要 7 个」直接冲突。
2. **不要用不带 `--skill` 的 `npx skills add mattpocock/skills`** —— 同样全量。
3. `setup-matt-pocock-skills` 是**每个仓库跑一次**，不是全局。它要问你 issue tracker 放哪、triage 五个角色的标签叫什么、`CONTEXT.md` / ADR 放哪。

### 本机状态

7 个都在 `~/.codex/skills/`。原本只在 `~/.agents/skills/` 里，而 Codex 只读 `~/.codex/skills`，2026-10-23 已同步。

---

## i-have-adhd

- 仓库：https://github.com/ayghri/i-have-adhd
- 安装说明：https://github.com/ayghri/i-have-adhd/blob/main/INSTALL.md（README 里那句「refer to the repo's AGENTS.md」就是指这个文件）
- 作用：让回复「答案先行、步骤编号、没有废话」。不是诊断工具，是输出格式约束。

### Codex 装法

Codex 走**插件市场**，不是拷 skill 目录：

```bash
codex plugin marketplace add ayghri/i-have-adhd --ref main
codex plugin add i-have-adhd@i-have-adhd
```

更新：

```bash
codex plugin marketplace upgrade i-have-adhd
codex plugin remove i-have-adhd
codex plugin add i-have-adhd@i-have-adhd
```

### 两个必须知道的点

1. **Codex 不会自动激活**。插件只是装上，要用 `$i-have-adhd` 显式调用。
2. 想让它**一直生效**，把 INSTALL.md 里的 `## Output style` 整段写进 `~/.codex/AGENTS.md`。

本仓库的 `config/codex-AGENTS.md` **已经包含 `## Output style` 段**，所以 `node cli.mjs apply` 跑完，新机器的 Codex 就默认是 ADHD 输出风格，不需要再手动加。

### 本机状态

已装（marketplace 在 `~/.codex/.tmp/marketplaces/i-have-adhd`，缓存 revision `1ecea19`），`AGENTS.md` 里也有 always-on 段。

### 兜底

插件装不上（离线、市场挂了）时，`config/codex-AGENTS.md` 里的 `## Output style` 段单独也能起到 80% 的作用。
