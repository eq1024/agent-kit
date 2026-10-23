# agent-kit

> 换一台电脑，agent 不再是空的。

我用 Codex 干活。装它五分钟，配它一下午——skill 要一个个装，MCP 要一条条配，token 还要满服务器翻。第二次换电脑的时候，我决定把这堆东西变成一个有版本、能复现、不靠记忆的仓库。

`agent-kit` 就是这个仓库。它保存的不是我的项目代码，而是我的**工作环境**：跑哪些 skill、接哪些 MCP、说什么话（`AGENTS.md`）、带什么插件。

---

## 一个核心判断

配置分两种，混在一起才是麻烦的根源。

**一种几乎不会变。** 我自己写的 skill，内容就在仓库里；`AGENTS.md` 就是我说的那些话。装它的动作永远是「复制过去」，读一遍官方文档不会带来任何新信息。

**另一种天天在变。** context7 换安装方式了、memos 从社区包变成自带 MCP 了、mattpocock 的仓库从 7 个 skill 长到 30 个了。把装法写死在代码里，半年后必然失效，而且失败得很安静——你只会看到某个工具突然不工作了。

所以这里做了个分工：

| | 谁执行 | 落在哪 |
|---|---|---|
| 不变的：自建 skill、`AGENTS.md` | `cli.mjs`，复制 + 哈希对账 | `apply` 数组 |
| 会变的：第三方 skill、MCP、插件 | Codex 自己读文档现装 | `agentTasks` 数组 |

清单里**没有一条写死的安装命令**。第三方条目只有四样东西：来源、官方文档地址、要哪些密钥、已知的坑。

---

## 仓库里有什么

| | 数量 | 说明 |
|---|---|---|
| 自建 skill | 5 | 调试流程、TAPD 查询、前端九章体检、代码纪律注入、UX 七维审查 |
| 第三方 skill | 10 | mattpocock 7 个 + 设计类 2 个 + context7 配套 1 个 |
| MCP | 5 | context7、memos、playwright、codegraph、cloudbase |
| 插件 | 1 | i-have-adhd（回复格式约束） |

合计 15 个 skill。清单明细在 [`docs/inventory.md`](docs/inventory.md)，每个 MCP 的端点、跨端差异和坑在 [`docs/mcp.md`](docs/mcp.md)，插件在 [`docs/plugins.md`](docs/plugins.md)。

---

## 开始用

新机器上，装上 Node 18+ 和 Codex，然后：

```bash
git clone <this-repo> agent-kit
cd agent-kit
node cli.mjs apply     # 自建部分，一次装完
node cli.mjs tasks     # 剩下要 agent 做的，列成任务单
node cli.mjs doctor    # 体检，看还差什么
```

懒得敲命令，就把仓库地址丢给 Codex，让它读 [`INSTALL.md`](INSTALL.md)。那个文件是写给 agent 看的：先做什么、什么不能碰、装完往哪写记录，都写死了。[`PROMPT.md`](PROMPT.md) 里有一段可以直接复制的开场白。

---

## 目录

```
agent-kit/
├── manifest.json       ← 唯一要维护的清单
├── cli.mjs             ← apply / doctor / tasks / list
├── lib/                ← 安装、对账、哈希、路径，零依赖
├── skills/             ← 自建的 5 个，代码直接装
├── config/             ← AGENTS.md
├── docs/               ← 调研记录：inventory / mcp / plugins
├── INSTALL.md          ← 给 agent 的执行手册
└── PROMPT.md           ← 复制给 agent 的开场白
```

27 个文件，181 KB。没有构建步骤，没有 `node_modules`。

---

## 四个命令

```bash
node cli.mjs apply             # 装自建部分。幂等，覆盖前自动备份
node cli.mjs apply --dry-run   # 只预演，告诉你哪些会变
node cli.mjs tasks             # 需要 agent 做的第三方任务，带文档、密钥、验收标准
node cli.mjs doctor            # 本机 vs 清单：MISS 缺失 / WARN 不一致
node cli.mjs list              # 打印清单
```

`apply` 每次覆盖前生成 `<目标>.bak.<时间戳>`，每个目标只留最近 3 份。`doctor` 对着 `~/.agent-kit.state.json` 里的哈希比，所以能分辨「本来就是仓库版本」和「本地被改过」。

---

## 怎么维护

**改自己的东西**——直接改 `skills/<名字>/SKILL.md`，跑 `apply`，跑 `doctor`。

**加别人的东西**——在 `manifest.json` 的 `agentTasks` 加一条：

```json
{
  "id": "memos-mcp",
  "kind": "mcp",
  "transport": "http",
  "docs": "https://usememos.com/docs/integrations/mcp",
  "needs": ["MEMOS_URL", "MEMOS_TOKEN"],
  "hint": "Memos v0.27+ 自带 MCP，不需要装 npm 包。地址 https://<实例>/mcp，Bearer token。",
  "verify": "codex mcp list 里出现 memos"
}
```

不要写命令。写「为什么是这样」和「哪里容易踩坑」。命令让装的那一刻的 Codex 自己去读。

跑 `apply` 时新密钥会自动追加进 `~/.agent-kit.env` 模板，不会覆盖你已经填的值。

---

## 几个设计决定

**为什么不把第三方 skill 拷进仓库。** 拷进来就要跟着上游改，还得处理版本漂移。上游改了你不知道，仓库里那份就慢慢变成历史遗迹。只在 `agentTasks` 里记一行来源和坑，装的时候拿最新的。

**为什么要有 `state.json`。** 「交给 agent」最大的风险是每台机器结果都不一样，而且没人知道差在哪。装完把版本、commit、看到的文档日期写进去，下次才能对账。没有这一步，这个仓库就退化成一份 README。

**为什么三端能同一套。** 代码只用 Node 内置模块，路径一律写成 `~/`，运行时才展开；`.gitattributes` 固定 LF 换行；`~/.agent-kit.env` 在 mac/linux 上自动 `chmod 600`。MCP 的跨端差异（比如 Windows 上 stdio 要 `cmd /c` 包裹）不写进代码，写在清单的 hint 里，让执行的那一方判断。

**为什么代码不碰 `config.toml`。** 那个文件里有 model、provider、notify、项目信任列表、node_repl 路径，全是本机专属。`cli.mjs` 一个字都不写，MCP 由 agent 用 `codex mcp add` 或谨慎地追加上去。

---

## 它不管什么

- 不装 Node、不装 Codex、不帮你登录
- 不动 `~/.codex/auth.json`、`rules/default.rules`、`config.toml` 里的机器专属段落
- 不管 `~/.agents`、`~/.claude`、`~/.pi` 里的旧副本（Codex 读不到它们，留着不碍事）
- 不做版本回滚，只做「覆盖前留三份备份」

---

## 密钥

全部放 `~/.agent-kit.env`，永不进仓库。第一次 `apply` 自动生成模板，加新 MCP 时自动追加。目前三把：

```
CONTEXT7_API_KEY=
MEMOS_URL=
MEMOS_TOKEN=
```

cloudbase 走浏览器 OAuth，不需要往文件里写密钥。

---

MIT
