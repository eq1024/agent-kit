# 复制这段话给 Codex

> 帮我配置这台机器的 Codex 全局环境。
>
> 1. 把 `<仓库地址>` clone 下来，或者直接读它的 raw 文件。
> 2. 严格按仓库里的 `INSTALL.md` 执行，不要跳步，不要自己发明命令。
> 3. `manifest.apply` 的部分跑代码；`manifest.agentTasks` 的部分去读官方文档现查现装，装完写进 `~/.agent-kit.state.json`。
> 4. 需要密钥就停下来问我，密钥只允许写进 `~/.agent-kit.env`。
> 5. 不要动 `~/.codex/config.toml` 里的 model / notify / projects / node_repl，也不要动 auth.json。
> 6. 最后跑 `node cli.mjs doctor`，把 MISS 和 WARN 逐条报给我。

## 为什么这样设计

- **自建的用代码装**：内容在你手里，行为确定，可重复。
- **第三方的只记意图**：context7 的 key 怎么拿、mattpocock 的 skill 怎么装，官方随时会改。写死命令等于给自己埋雷，留给 agent 现查，永远装当下正确的版本。
- **`state.json` 是对账依据**：没有它，“交给 agent”就变成每台机器一个独立分支，没人知道差异在哪。

## 待办

- [ ] 填 `CONTEXT7_API_KEY` 到 `~/.agent-kit.env`（现在 key 还硬编码在 config.toml 里）
- [ ] 发布到 npm，让 `npx -y <scope>/agent-kit apply` 可用（需要 npm 账号 + scope 名）
- [ ] GitHub Action：push tag 自动 publish
