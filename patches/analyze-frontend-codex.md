# analyze-frontend 的 Codex 移植补丁

**为什么需要**：`eq1024/skills` 原版是给 Claude Code 写的，`SKILL.md` 里要求：

> 读取 `prompts/analysis.md`，将其完整内容作为 prompt 传入 Agent 工具（`subagent_type: general-purpose`）

`Agent` 工具 + `subagent_type` 是 Claude Code 的 Task 机制，Codex 没有。照原样装进 Codex，skill 会去找一个不存在的工具。

## 补丁做法

装完上游 skill 后，把 `~/.codex/skills/analyze-frontend/SKILL.md` 的正文（frontmatter 之后）替换成下面这段：

```markdown
# 前端项目深度分析

当用户调用此 Skill 时，读取同目录下的 `prompts/analysis.md`，把它当作你自己的工作指令，按其中的方法论和九章结构**自己执行**这次分析。

> Codex 移植说明：原版要求"把 prompt 传给 Agent 工具（`subagent_type: general-purpose`）"，那是 Claude Code 的子代理机制，Codex 没有对应工具。这里改成由你直接按 `prompts/analysis.md` 的方法论执行。如果宿主确实支持子代理，也可以派一个去跑，判断标准是工具是否真实存在——不存在就自己跑，不要假装派了代理。

报告**必须完整呈现**给用户，不得省略、压缩或改写任何章节。即使报告很长，用户也期望看到完整的九章分析内容。如果输出被截断，分段继续。
```

`frontmatter` 和 `prompts/analysis.md`（16KB，九章方法论）都保持原样不动。

## 判据

移植成功的标志：让 Codex 分析一个前端项目，它应该去读 `prompts/analysis.md`，然后**自己**逐章产出报告，而不是报"找不到 Agent 工具"或者捏造一个子代理。

## 上游更新时

这个补丁只动 SKILL.md 正文。上游如果改了 `prompts/analysis.md`（真正的方法论内容），不需要重新打补丁，直接覆盖即可；只有上游改了 SKILL.md 的调用方式，才需要重新对照。

## 另外两个不用打补丁

- `restriction-code`：它自己会检测宿主（`.cursorrules` / `.CLAUDE.md` / `AGENTS.md` / `.kilo/`），Codex 下写 `AGENTS.md`，原生兼容。
- `ux-review`：用 `git status` / `git diff` 取范围，纯通用手段，原生兼容。
