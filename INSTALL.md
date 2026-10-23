# INSTALL.md — 给 agent 的执行手册

这个仓库是某人的 agent 环境清单。你的任务是让当前机器达到清单状态。

**两条铁律**

1. `manifest.apply` 里的东西由代码装，直接跑命令。不要手写文件。
2. `manifest.agentTasks` 里的东西**没有写死的安装命令**，因为官方文档会变。你必须现查文档再执行。

---

## 第 0 步：先看清单，再动手

```bash
node cli.mjs list
```

把结果报给用户，一句话说明要做什么。用户确认后再往下。

## 第 1 步：跑自建部分（确定性，幂等）

```bash
node cli.mjs apply --dry-run   # 先看会改什么
node cli.mjs apply             # 真跑
```

覆盖前会自动备份成 `<目标>.bak.<时间戳>`，同一目标只保留最近 3 份。`merge-json` 类型只合并不覆盖，其他字段保留。

失败不要强来。把失败项原样告诉用户。

## 第 2 步：逐项处理第三方（这部分只有你能做）

```bash
node cli.mjs tasks
```

对每一个任务：

1. 打开 `文档:` 那个链接，读**当前**的安装方式。仓库里记的只是来源和要点，不是命令。
2. 按文档执行。装到清单要求的每个 target（pi / claude / agents，见 `manifest.targets`）。
3. 需要密钥的（`需要密钥:` 那行）：
   - 先看 `~/.agent-kit.env` 里有没有填好的值；
   - 没有就**停下来问用户**，告诉用户去哪拿（`manifest.tokens[].howToGet`）；
   - 拿到后写进 `~/.agent-kit.env`，**不要**写进任何仓库文件、不要贴进聊天记录。
4. 装完把结果写进 `~/.agent-kit.state.json` 的 `agentTasks`：

```json
{
  "agentTasks": {
    "context7-mcp": {
      "installedAt": "2026-01-01T00:00:00.000Z",
      "version": "1.2.3",
      "sourceCommit": "abc1234",
      "docSeenAt": "2026-01-01",
      "where": ["~/.pi/agent/mcp.json"]
    }
  }
}
```

这一步不能省。没有它，下次没人知道这台机器上到底装了什么版本。

## 第 3 步：体检

```bash
node cli.mjs doctor
```

`MISS` 表示还没有，`WARN` 表示装了但和记录不一致（本地被改过，或密钥缺失）。逐项修完再交差。

---

## 几个必须知道的事实

- **不要整文件覆盖 `~/.claude.json`**。它带着用户的项目列表和对话历史。Claude 的 MCP 要么用 `claude mcp add --scope user`，要么读改写并先备份。
- **MCP 配置分散**：pi 读 `~/.pi/agent/mcp.json`，Claude 读 `~/.claude.json`（`mcpServers`）。两边都要配。
- **第三方 skill 用 `follow: latest`**，装最新版即可，不必对齐别的机器。版本差异靠 `state.json` 里的 commit 追溯。
- **同一份 skill 不要下载多次**。装到 pi / claude / agents 三个位置时，用复制或链接同一份目录。
- **绝不 `git push` 任何 token**。`.agent-kit.env` 是唯一的密钥落点。

## 用户只维护两个文件

`manifest.json` 和 `INSTALL.md`。代码只做 `apply` / `doctor` / `tasks` 三件事。改完 push，其他机器重跑本文件即可。
