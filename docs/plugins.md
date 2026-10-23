# 插件 / skill — 第三方记录

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
