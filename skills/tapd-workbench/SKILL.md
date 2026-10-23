---
name: tapd-workbench
description: Query and inspect TAPD work items, comments, images, and client/project classification from the user's authenticated browser session. Use for TAPD bugs, defects, stories, requirements, assignments, iterations, statuses, priorities, comments, or opening a specific TAPD work item; use bug-debugging for code-level diagnosis and repair.
---

# TAPD Workbench

## Outcome

Answer TAPD questions directly from the user's already authenticated TAPD web
session. Support list questions ("what bugs are open?"), status questions,
specific item lookups, and opening or summarizing a Bug or requirement detail.
For a fix request, collect the complete ticket evidence and hand code-level
diagnosis and repair to the `bug-debugging` skill.

Use the in-app browser through `cua_repl`. Never ask for a password, API token,
session cookie, or SDK credential. Do not extract cookies or call undocumented
authenticated API endpoints.

## Resolve Scope

Resolve the requested scope before collecting data:

- "当前/这个/现在" means the selected TAPD tab and its active filters.
- A personal question with no project-wide wording defaults to the current TAPD
  view. If the page is `我的工作`, explicitly say the answer is from "我的待办"
  and its current filters.
- "项目/空间所有" means the current TAPD workspace list, not `我的工作`.
- A named item, title, short ID, or detail URL targets that one work item.
- If no TAPD tab exists, open `https://www.tapd.cn/tapd_fe/my/work?left_tree=1`
  in a hidden in-app-browser tab and use the logged-in session if present.
- If authentication is absent, stop and ask the user to sign in to TAPD. Do not
  automate authentication dialogs.

Keep browser work in the background unless the user asks to see the page.

## Collect Data

Read [scripts/tapd_snapshot.js](scripts/tapd_snapshot.js) and evaluate the exact
source as a string in the selected tab:

```js
const source = await import("node:fs/promises").then((fs) =>
  fs.readFile(
    "C:\\Users\\v\\.codex\\skills\\tapd-workbench\\scripts\\tapd_snapshot.js",
    "utf8",
  ),
);
const snapshot = await tab.playwright.evaluate(source);
```

The script auto-detects a workbench/list or a work-item detail page and returns
normalized JSON. Use that result as evidence; do not infer item state from the
URL or title alone.

For a Bug investigation, inspect the description and every relevant embedded
image or attachment. Consider recent comments and change history when they add
reproduction steps, expected behavior, request details, or known constraints.

For a detail lookup:

1. Prefer a detail URL already present in the list snapshot.
2. Otherwise locate the item through TAPD's own search or list UI.
3. Open its detail URL in a temporary hidden tab. Before extracting, wait for
   `.detail-container-wrapper` filtered by the expected title or ID; TAPD briefly
   exposes a skeleton whose title is only `TAPD`.
4. Close only the temporary tab created for the lookup.

For large or virtualized lists:

- Use TAPD's own visible filters and search controls for the requested scope.
- Scroll the list container and take new snapshots, accumulating unique IDs.
- If `totalShownByPage` is larger than the parsed item count, the table is
  virtualized and more collection is required.
- Stop when TAPD exposes no further rows, or when several consecutive scrolls
  produce no new IDs after reaching the bottom.
- Do not claim an exhaustive result from only the initially rendered rows.

For relative dates such as "today", "this week", "overdue", and "due soon", use
the app client date and compare against rendered dates. State the date range
used when it materially affects the result.

## Interpret the Request

- `Bug` and `缺陷` are the same item type; `Story` and `需求` are the same.
- "未完成" means not in a completed/closed/rejected terminal state. Report the
  exact rendered status for every item instead of collapsing statuses.
- "高优先级" includes rendered priority `高`, `High`, or higher if those labels
  actually appear. Do not infer severity from priority.
- "我的" means the authenticated TAPD user from the page; "处理人" means current
  owner and is not necessarily the reporter.
- Keep requirement and Bug results separate unless the user asks for a combined
  list.

## Classify Client and Project

Use these project mappings:

- desktop PC/Web -> `bms2026`
- App -> `app2026`

In this workspace, `bms2026` is the PC project. Its PC `app` directory contains
three SaaS-layer ends. The prefixes `【管理端】`, `【客户端】`, `【服务端】`, and
`【三端】` describe sub-apps, modules, implementation layers, or impact scope
inside that PC/SaaS structure; they do not create separate projects. Assign all
of them to `bms2026`.

Do not interpret the word `app`, a path containing `app`, or `bms2026/app` as
evidence for the mobile product. In this project structure, `app` is a PC/SaaS
architecture directory. `app2026` refers only to the standalone mobile App
product.

Only assign an item to `app2026` when the item is actually about the App. A title
prefix such as `【APP】` is useful evidence, but the tester may have selected the
wrong category. Before finalizing an App assignment, verify it from at least one
additional signal:

- App evidence: phone status bar, native or mobile layout, React Native or
  mobile-development tools, a device/App scanner interface, or an App device
  log/request source. A directory, route, or repository named `app` inside
  `bms2026` is not App evidence.
- PC/Web evidence: desktop browser chrome or address bar, desktop page layout,
  mouse/keyboard controls, or browser DevTools.
- Detail text or comments that explicitly identify the client producing the
  request or displaying the defect.
- The screenshots embedded in the description or comments. Visually inspect
  them when the written description only names an API or is otherwise sparse.

If an `【APP】` title and the additional evidence disagree, report the conflict
instead of silently reassigning the item. For example, an App title with only a
desktop screenshot needs confirmation before it is treated as `app2026`.

Do not infer from `【管理端】`, `【服务端】`, or `【三端】` that an item is outside
`bms2026`, and do not duplicate one item across projects. A backend or
cross-client root cause can remain a single `bms2026` item.

## Hand Off Bug Fixes

Treat a request to handle a TAPD Bug as authorization to inspect the ticket and
collect evidence. Determine the actual client/project using the rules above,
then use the `bug-debugging` skill for reproduction, code-level diagnosis, fix
design, and the approval gate.

Do not treat "处理这个 Bug" as approval to modify code. Keep TAPD access here
read-only, and stop any code change until the user explicitly approves the
concrete plan produced by the debugging workflow.

## Respond

Lead with the direct answer and the scope used. Include:

- the count and grouping by item type;
- exact item ID/short ID, title, status, priority/severity, owner, iteration, and
  due date when relevant;
- a detail URL for each item when useful;
- the active TAPD filters when the result is from `我的工作` or a filtered list.

When client or project classification is requested or materially affects the
answer, group results under `bms2026` and `app2026`, state the evidence used for
the classification, and call out title/evidence conflicts.

For a specific-item request, summarize the current status, key metadata,
description, recent comments, and relevant evidence. Quote or closely
paraphrase the newest relevant comment only when it explains current work.

This skill is read-only. Code-level debugging belongs to `bug-debugging`, and
code changes still require explicit approval of a concrete fix proposal. TAPD
mutations such as changing status, assigning owners, or posting comments require
separate explicit authorization and the relevant action-time confirmation.

If TAPD changes and extraction becomes incomplete, read
[references/tapd-dom.md](references/tapd-dom.md) and update the parser around
stable TAPD attributes such as `tr.row-item`, `workspace_id`, `type`,
`data-grid-field`, and `.entity-detail-right-col`.
