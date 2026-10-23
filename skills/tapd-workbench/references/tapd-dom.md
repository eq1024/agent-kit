# TAPD DOM Contract

Use this reference only when the browser extractor needs repair or a TAPD view
shows data that `scripts/tapd_snapshot.js` misses.

## Stable Signals

TAPD's current web UI exposes useful semantic attributes:

- Workspace and list: `/tapd_fe/{workspaceId}/{bug|story}/list`
- My work: `/tapd_fe/my/work`
- Detail: `/tapd_fe/{workspaceId}/{bug|story}/detail/{itemId}`
- List row: `tr.row-item[id][type][workspace_id]`
- Detail link inside row: `.tapd-grid-edit-link[href]`
- List header mapping: `.tapd-table__head-wrap th[field]`
- Active filter: `.tapd-filter-item--active`
- Detail container: `.detail-container-wrapper`
- Detail status and title: `.detail-container-header-top`
- Base fields: `.entity-detail-right-col`
- Main content: `.detail-container-content`
- Comments: `.entity-detail-comments .comment_content`
- Attachments: `.detail-container-attachment`

Prefer these attributes over visible text positions. TAPD uses virtualized
tables, so a DOM snapshot normally contains only rendered rows; accumulate
unique IDs while scrolling when the user requests a complete list.

## Known Workspace

The workspace observed when this skill was created is:

- Name: `BeSender_IT部门开发管理`
- Workspace ID: `31164615`

Do not assume every future TAPD question belongs to this workspace. Prefer the
workspace in the active URL or explicit user request.

## Fields

List columns are mapped by the `field` attribute rather than fixed positions.
Common fields include:

- `title`
- `status`
- `priority`
- `severity`
- `current_owner`
- `created`
- `reporter`
- `iteration_id`
- `due`

Detail metadata is label/value based. Read the rendered label and value from the
same `.entity-detail-right-col`; labels vary by template and workspace.

## Failure Behavior

If rows exist but the parser returns none, inspect the closest table and update
the stable selectors in the script. If the detail page renders but metadata is
missing, preserve the raw rendered text in the response rather than guessing.
If the login page or an authentication dialog appears, stop and ask the user to
sign in.
