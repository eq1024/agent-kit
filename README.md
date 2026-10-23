# agent-kit

一个仓库，一台新机器的 agent 环境。

自己的东西（skill / 扩展 / 配置）用代码装，第三方（别人的 skill、需要 token 的 MCP）只记意图，由 agent 现查官方文档装。

## 三条入口

```bash
# 已经 clone 到本地
node cli.mjs apply && node cli.mjs tasks

# 没 clone：让 agent 读文件自己装
#   "读 https://github.com/<you>/agent-kit 的 INSTALL.md，按里面的步骤装"
```

发布 npm 之后（待办）：

```bash
npx -y @v/agent-kit apply
```

## 命令

| 命令 | 作用 |
|---|---|
| `node cli.mjs apply` | 装自建部分，幂等，覆盖前备份 |
| `node cli.mjs apply --dry-run` | 只预演 |
| `node cli.mjs tasks` | 列出需要 agent 执行的第三方安装 |
| `node cli.mjs doctor` | 本机 vs 清单的差异 |
| `node cli.mjs list` | 打印清单 |

## 你怎么维护

1. 加/改自己的 skill → 改 `skills/` 目录
2. 加第三方 skill 或 MCP → 在 `manifest.json` 的 `agentTasks` 加一条，只写来源、文档、要点，**不写命令**
3. `git push`

## 新机器

1. 装 Node 18+
2. clone 仓库
3. 让 agent 读 `INSTALL.md` 执行

## 密钥

只放在 `~/.agent-kit.env`，不进仓库。第一次 `apply` 会自动生成模板。
