# 我用的 5 个 MCP — 调研记录

调研日期 2026-10-23。**装之前仍要读文档**，这里记的是当时的结论和坑，不是免检凭据。

> 下面的命令按当前目标宿主（Codex）写。换宿主时照 `INSTALL.md` 的「装到哪」表替换路径和 `mcp` 子命令前缀，结论和坑不变。

| MCP | 官方包 / 端点 | 传输 | 要不要密钥 | 谁装 |
|---|---|---|---|---|
| context7 | `npx ctx7 setup` 或 `https://mcp.context7.com/mcp` | http | 要（OAuth 可自动生成） | 官方安装器 |
| memos | Memos 实例自带的 `/mcp` | http | 要（实例地址 + token） | 服务端自带，零安装 |
| playwright | `@playwright/mcp` | stdio | 不要 | npx 现拉 |
| codegraph | `@colbymchenry/codegraph` | stdio | 不要 | 需全局安装 |
| cloudbase | `@cloudbase/cloudbase-mcp` | stdio / 远端 | 远端走 OAuth，本地要密钥 | 全局安装或插件市场 |

---

## context7

- 文档：https://github.com/upstash/context7
- 官方安装器：`npx ctx7 setup`（OAuth → 自动生成 API key → 装配套 skill）；`npx ctx7 remove` 卸载
- 两种模式，二选一：
  - **MCP 型**：`https://mcp.context7.com/mcp` + `Authorization: Bearer <key>`（本机用这个）
  - **CLI + Skills 型**：`ctx7` 命令，不要 MCP
- 坑：`ctx7 setup` 只列了 `--cursor` / `--claude` / `--opencode`，**没有 codex**。当前宿主不在三者里，所以要么手动配 MCP，要么跑完 setup 把生成的 skill 挪过来（别手抄内容）。
- `~/.codex/skills/context7-mcp/` 这个 skill **不是我写的**，是安装器生成的，所以不进本仓库。

## memos

- 文档：https://usememos.com/docs/integrations/mcp
- **Memos v0.27+ 自带 MCP**，是主程序的一部分，不需要安装任何 npm 包。
- 端点：`https://<你的实例>/mcp`，Streamable HTTP，`Authorization: Bearer <personal access token>`
- token 获取：Memos 网页端 → 设置 → API 访问 → 创建 Access Token
- 坑 1：v0.30 起工具名统一加 `memo_` 前缀（`memo_list_memos`、`memo_create_memo`…），旧的无前缀名字已删除。
- 坑 2：v0.31 把 `shortcut_list_shortcuts` 换成 `user_list_memo_views`。
- 坑 3：npm 上那一堆社区包（`memos-mcp`、`@chriscurrycc/memos-mcp`、`openclaw-memos-mcp`，周下载量都只有两位数）**不要用**，内置的已经覆盖全部 CRUD。

## playwright

- 文档：https://github.com/microsoft/playwright-mcp
- 包：`@playwright/mcp`，npx 直接跑，无需预装。
- 跨端差异（唯一要注意的）：
  - Windows：`cmd /c npx -y @playwright/mcp@latest`
  - mac / linux：`npx -y @playwright/mcp@latest`
- 坑：首次运行会下载浏览器内核，可能等几分钟；`startup_timeout_sec` 建议 60。

## codegraph

- 文档：https://github.com/colbymchenry/codegraph
- 装：`npm i -g @colbymchenry/codegraph`，配 stdio `codegraph serve --mcp`
- 自带运行时，零依赖，不需要额外 Node 环境配置。
- 坑 1：npm 上有一堆同名的 `codegraph-mcp`（`@astudioplus/`、`@memoryx/`、`@agntk/`…），**认准 `@colbymchenry` 这个 scope**。
- 坑 2：项目里要先 `codegraph init` 建索引，否则工具返回空。

## cloudbase（腾讯云开发）

- 文档（当前宿主专页）：https://docs.cloudbase.net/ai/cloudbase-ai-toolkit/ide-setup/openai-codex-cli
- 官方仓库：https://github.com/TencentCloudBase/CloudBase-AI-Toolkit
- 两条路径：
  - **A. 插件市场**（推荐）：Codex App → `+` → 添加插件市场 → 来源 `TencentCloudBase/CloudBase-MCP`，Git 引用 `main`，稀疏路径留空 → 安装 `cloudbase` 插件。MCP + Skills + Hooks 一起装好。
  - **B. 只要 MCP**：
    ```bash
    npm i -g @cloudbase/cloudbase-mcp
    # mac / linux / WSL
    codex mcp add cloudbase --env INTEGRATION_IDE=CodeX -- cloudbase-mcp
    # windows
    codex mcp add cloudbase --env INTEGRATION_IDE=CodeX -- cmd /c cloudbase-mcp
    ```
- 远端模式只需填地址，登录走浏览器 OAuth，**密钥不落配置文件**；本地模式才要 `TENCENTCLOUD_SECRETID` / `TENCENTCLOUD_SECRETKEY`。
- 坑 1：工具数显示为 0 → 见官方 FAQ，通常是没登录或没选环境。
- 坑 2：首次使用要先 ` Login to CloudBase` 并选环境，否则所有工具都会失败。
- 坑 3：同一工具上不要既装插件市场又跑 `npx plugins add`，会重复。

---

## 统一验收方式

装完新开一个会话（不是当前会话，MCP 列表在启动时加载）：

```bash
codex mcp list      # 5 个都在
```

然后逐个调一次最轻的工具：context7 查一个库、memos 列一条 memo、playwright 打开 about:blank、codegraph 在一个已索引仓库里 explore、cloudbase 执行 queryEnv。

结果写进 `~/.agent-kit.state.json` 的 `agentTasks`。
