# 复制这段话给任意 agent

> 帮我配置这台机器的 agent 环境。
>
> 1. 把 https://github.com/<you>/agent-kit 这个仓库 clone 下来（或者直接读它的 raw 文件）。
> 2. 严格按仓库里的 `INSTALL.md` 执行，不要跳步，不要自己发明命令。
> 3. `manifest.apply` 的部分跑代码；`manifest.agentTasks` 的部分去读官方文档现查现装，每装完一项写进 `~/.agent-kit.state.json`。
> 4. 需要密钥就停下来问我，不要把密钥写进任何文件以外的地方。
> 5. 最后跑 `node cli.mjs doctor`，把 MISS 和 WARN 逐条报给我。

## 为什么这样设计

- **自建的用代码装**：内容在你手里，行为确定，可重复。
- **第三方的只记意图**：context7 的 token 怎么拿、mattpocock 的 skill 怎么装，官方随时会改。写死命令等于给自己埋雷。留给 agent 现查，永远装的是当下正确的版本。
- **`state.json` 是对账依据**：没有它，“交给 agent”就变成每台机器一个独立分支，没人知道差异在哪。

## 待办

- [ ] 发布到 npm，让 `npx -y @v/agent-kit apply` 可用（需要 npm 账号 + scope 名）
- [ ] 加 GitHub Action：push tag 自动 publish
- [ ] 可选：给 `~/.pi/agent/skills` 等目录改用 junction，省掉复制
