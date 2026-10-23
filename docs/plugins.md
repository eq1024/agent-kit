# 插件 / skill — 第三方记录

## mattpocock-skills

- 仓库：https://github.com/mattpocock/skills
- 安装说明：https://github.com/mattpocock/skills#installation-30-second-setup
- 一套工程师工作流 skill：先 `setup-matt-pocock-skills` 初始化仓库，然后 `grill-me` 盘需求 → `to-spec` 出规格 → `to-tickets` 拆票 → `implement` + `tdd` 实现 → `code-review` + `pr` 收尾。

### Codex 装法（插件，自动更新）

```bash
codex plugin marketplace add mattpocock/skills
codex plugin add mattpocock-skills@mattpocock
```

启动时自动更新。

### 两种装法只能选一种

| 方式 | 命令 | 特点 |
|---|---|---|
| 插件（推荐） | `codex plugin add mattpocock-skills@mattpocock` | 自动更新，文件在缓存里不可改 |
| skills.sh | `npx skills add mattpocock/skills` | 拷可编辑文件，要手动更新 |

**两个都装 = 每个 skill 出现两份**。Codex 上选插件。

### 坑

1. 仓库现在有 **30 来个** skill，不是早期那 7 个。`manifest.json` 的 `provides` 列的是常用的一批，装完以 `codex plugin list` 实际输出为准。
2. `setup-matt-pocock-skills` 是**每个仓库跑一次**，不是全局。它要问你 issue tracker 放哪、triage 五个角色的标签叫什么、`CONTEXT.md` / ADR 放哪。
3. 本机 `~/.agents/skills/` 里那 7 个是早期用 skills.sh 装的，**Codex 读不到**（Codex 只读 `~/.codex/skills` 和仓库里的 `.codex/skills`）。要迁的话装插件，别手动拷。

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
