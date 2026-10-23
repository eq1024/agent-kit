# 插件 / skill — 第三方记录

> `eq1024/skills` 里要留的 3 个已经迁进本仓库 `skills/`，当自建维护，不再从上游装。
>
> 下面的命令按当前目标宿主（Codex）写。换宿主时照 `INSTALL.md` 的「装到哪」表替换路径和 CLI 前缀，结论和坑不变。

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

1. **不要用 `plugin add mattpocock-skills@mattpocock`** —— 那是一次装 30 个，和「只要 7 个」直接冲突。
2. **不要用不带 `--skill` 的 `npx skills add mattpocock/skills`** —— 同样全量。
3. `setup-matt-pocock-skills` 是**每个仓库跑一次**，不是全局。它要问你 issue tracker 放哪、triage 五个角色的标签叫什么、`CONTEXT.md` / ADR 放哪。

### 本机状态

7 个都在 `~/.agents/skills/`，这也是 Codex 的用户级 skill 目录。

---

## i-have-adhd

- 仓库：https://github.com/ayghri/i-have-adhd
- 安装说明：https://github.com/ayghri/i-have-adhd/blob/main/INSTALL.md（README 里那句「refer to the repo's AGENTS.md」就是指这个文件）
- 作用：让回复「答案先行、步骤编号、没有废话」。不是诊断工具，是输出格式约束。

### 装法

走**插件市场**，不是拷 skill 目录：

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

1. **这个宿主不会自动激活**。插件只是装上，要用 `$i-have-adhd` 显式调用。
2. 想让它**一直生效**，把 INSTALL.md 里的 `## Output style` 整段写进 `~/.codex/AGENTS.md`。

本仓库的 `config/codex-AGENTS.md` **已经包含 `## Output style` 段**，所以 `node cli.mjs apply` 跑完，新机器就默认是 ADHD 输出风格，不需要再手动加。

### 本机状态

已装（marketplace 在 `~/.codex/.tmp/marketplaces/i-have-adhd`，缓存 revision `1ecea19`），`AGENTS.md` 里也有 always-on 段。

### 兜底

插件装不上（离线、市场挂了）时，`config/codex-AGENTS.md` 里的 `## Output style` 段单独也能起到 80% 的作用。

---

## archify

- 仓库：https://github.com/tt-a1i/archify
- 作用：把一句话或一个仓库变成**可交互的 HTML**。架构图、时序图、数据流、ERD、时间线，或者「一页回答」形式的解释页。单文件输出，四种风格、明暗主题，可导长图或打印 PDF。
- 版本：v3.2.0，MIT，skills.sh 上 130K+ 安装。

### 装法

```bash
npx skills add tt-a1i/archify -g
```

一条命令，装到 `~/.agents/skills/archify`（Codex 的 user scope 正是这里）。没有 npm 包要装，Node >= 18。

想先试不落地：

```bash
npx skills use tt-a1i/archify@archify
```

### 坑

1. 体积 **18MB**（`renderers/`、`examples/`、`locales/` 都带上了）。比其它 skill 大两个数量级，属正常。
2. `npx skills add` 会顺带尝试其它宿主（PromptScript 之类）并报一条 `Failed to install 1`，**不影响 archify 本身**，它已经装好了。
3. 它默认会发一个 GET 到官方 manifest 检查新版本（24 小时一次，不带任何项目数据）。不想让它联网就设 `ARCHIFY_UPDATE_CHECK_DISABLED=1`。
4. 用法不是 `/archify`，而是自然语言：「用它画出 X」「把这段回答做成一页」。
