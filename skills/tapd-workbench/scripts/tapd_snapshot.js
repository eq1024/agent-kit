(() => {
  const clean = (value) =>
    String(value ?? "")
      .replace(/\u00a0/g, " ")
      .replace(/[ \t]+\n/g, "\n")
      .replace(/\n{3,}/g, "\n\n")
      .trim();

  const oneLine = (value) => clean(value).replace(/\s+/g, " ");
  const textOf = (node, selector) =>
    node ? oneLine(node.querySelector(selector)?.innerText) : "";
  const absoluteUrl = (href) => {
    if (!href) return "";
    try {
      return new URL(href, location.href).href;
    } catch {
      return href;
    }
  };
  const unique = (values) => [...new Set(values.filter(Boolean))];

  const pathMatch = location.pathname.match(
    /\/tapd_fe\/(\d+)\/(bug|story|task)\/detail\/(\d+)/i,
  );
  const listPathMatch = location.pathname.match(
    /\/tapd_fe\/(\d+)\/(bug|story)\/list/i,
  );
  const context = {
    title: document.title,
    url: location.href,
    workspaceId: pathMatch?.[1] || listPathMatch?.[1] || "",
    itemType: pathMatch?.[2] || "",
    itemId: pathMatch?.[3] || "",
    pageKind: pathMatch
      ? "detail"
      : location.pathname.includes("/my/work")
        ? "my-work"
        : location.pathname.match(/\/tapd_fe\/\d+\/(bug|story)\/list/i)
          ? "list"
          : "unknown",
    capturedAt: new Date().toISOString(),
  };

  const typeName = (rawType) => {
    const value = oneLine(rawType).toLowerCase();
    if (value === "bug" || value.includes("缺陷")) return "Bug";
    if (value === "story" || value.includes("需求")) return "Story";
    if (value === "task" || value.includes("任务")) return "Task";
    return oneLine(rawType);
  };

  const typeLabel = (rawType) => {
    const type = typeName(rawType);
    return { Bug: "缺陷", Story: "需求", Task: "任务" }[type] || type;
  };

  const splitOwners = (value) =>
    unique(
      oneLine(value)
        .split(/[;,，；]/)
        .map((part) => part.trim())
        .filter(Boolean),
    );

  const parseFilters = () =>
    Array.from(
      document.querySelectorAll(
        ".tapd-filter-item--active, .light-view--active-title-wrap",
      ),
    )
      .map((node) => {
        const name = textOf(node, ".tapd-filter-item__name");
        const value = textOf(node, ".tapd-filter-item__value");
        if (name || value) return { name, value };
        return { name: "", value: oneLine(node.innerText) };
      })
      .filter((filter) => filter.name || filter.value);

  const listTables = Array.from(
    new Set(
      Array.from(document.querySelectorAll("tr.row-item"))
        .map((row) => row.closest(".tapd-light-table"))
        .filter(Boolean),
    ),
  );

  const parseList = () => {
    const items = [];
    const groups = [];
    const seen = new Set();

    for (const table of listTables) {
      const rows = Array.from(table.querySelectorAll("tr.row-item"));
      if (!rows.length) continue;

      const groupTitle = oneLine(
        table.closest(".item-container")?.previousElementSibling?.innerText,
      );
      const expectedCountMatch = groupTitle.match(/[\(（](\d+)[\)）]/);
      const expectedCount = expectedCountMatch
        ? Number(expectedCountMatch[1])
        : null;
      const headerCells = Array.from(
        table.querySelector(".tapd-table__head-wrap tr")?.children || [],
      );
      const headers = headerCells
        .map((header, index) => ({
          index,
          field: header.getAttribute("field") || "",
          label: oneLine(header.innerText),
        }))
        .filter((header) => header.field);
      const rowsByType = {};
      let groupWorkspaceId = "";
      const parsedRows = [];

      for (const row of rows) {
        const id = row.getAttribute("id") || "";
        if (!id || seen.has(id)) continue;

        const fields = {};
        headers.forEach((header) => {
          fields[header.field] = oneLine(
            row.children[header.index]?.innerText,
          );
        });

        const link = row.querySelector(".tapd-grid-edit-link[href]");
        if (!link) continue;

        const rawType = row.getAttribute("type") || "";
        const type = typeName(rawType);
        const workspaceId = row.getAttribute("workspace_id") || "";
        const title = oneLine(link.innerText);
        const url = absoluteUrl(link.getAttribute("href"));
        const ownerText =
          fields.current_owner ||
          fields.owner ||
          fields.assigned_to ||
          textOf(row, ".td--tapd-inline-user-select");

        const item = {
          id,
          shortId: id.slice(-7),
          type,
          typeLabel: typeLabel(rawType),
          workspaceId,
          title,
          url,
          status: fields.status || "",
          priority: fields.priority || "",
          severity: fields.severity || "",
          owners: splitOwners(ownerText),
          iteration:
            fields.iteration_id ||
            fields.iteration ||
            textOf(row, ".td--tapd-inline-tree-select"),
          createdAt: fields.created || fields.created_at || "",
          creator:
            fields.creator ||
            fields.reporter ||
            fields.created_by ||
            "",
          dueDate:
            fields.due ||
            fields.due_date ||
            fields.expected_end ||
            fields.end_date ||
            textOf(row, ".td--tapd-inline-date-picker"),
          rawFields: fields,
        };

        parsedRows.push({ item, row });
      }

      let resultRows = parsedRows;
      if (expectedCount != null && parsedRows.length > expectedCount) {
        const removable = parsedRows.filter(({ row }) =>
          row.querySelector(".title-input__prefix .row-expand i"),
        );
        const removeIds = new Set(
          removable
            .slice(0, parsedRows.length - expectedCount)
            .map(({ item }) => item.id),
        );
        resultRows = parsedRows.filter(({ item }) => !removeIds.has(item.id));
      }

      for (const { item } of resultRows) {
        if (seen.has(item.id)) continue;
        items.push(item);
        seen.add(item.id);
        groupWorkspaceId ||= item.workspaceId;
        rowsByType[item.type] = (rowsByType[item.type] || 0) + 1;
      }

      groups.push({
        title: groupTitle,
        expectedCount,
        workspaceId: groupWorkspaceId,
        counts: rowsByType,
      });
    }

    const bodyText = clean(document.body.innerText);
    const totalMatch =
      bodyText.match(/共\s*(\d+)\s*个/) ||
      bodyText.match(/合计\s*(\d+)/);

    return {
      pageKind: context.pageKind,
      totalShownByPage: totalMatch ? Number(totalMatch[1]) : null,
      filters: parseFilters(),
      groups,
      items,
    };
  };

  const parseDetail = () => {
    const root = document.querySelector(".detail-container-wrapper");
    if (!root) return null;

    const header = root.querySelector(".detail-container-header-top");
    const type = typeName(
      textOf(header, ".detail-container-header__workitem") ||
        context.itemType,
    );
    const title =
      textOf(header, ".title-wrap .label-selectable__tag") ||
      textOf(header, ".title-wrap") ||
      clean(document.title).split(/-(?=[^-]+-TAPD平台)/)[0];
    const displayId =
      textOf(header, ".title-area__id").replace(/^ID:\s*/i, "") ||
      context.itemId.slice(-7);
    const headerStatus =
      textOf(header, ".status-transfer-wrap .capsule__text") ||
      textOf(header, ".status-transfer-wrap");

    const fields = {};
    for (const column of root.querySelectorAll(".entity-detail-right-col")) {
      const key = textOf(column, ".entity-detail-right-col__key");
      const value = textOf(column, ".entity-detail-right-col__value");
      if (key) fields[key] = value;
    }

    const status = headerStatus || fields["状态"] || "";
    const content =
      root.querySelector(".detail-container-content .tab-detail-item .content-wrap") ||
      root.querySelector(".detail-container-content");
    const description = content ? clean(content.innerText) : "";
    const contentImages = content
      ? Array.from(content.querySelectorAll("img"))
          .map((image) => ({
            alt: oneLine(image.getAttribute("alt")),
            src: absoluteUrl(
              image.getAttribute("original_src") ||
                image.getAttribute("data-src") ||
                image.getAttribute("src") ||
                image.currentSrc,
            ),
          }))
          .filter((image) => image.src)
      : [];
    const contentLinks = content
      ? unique(
          Array.from(content.querySelectorAll("a[href]")).map((link) =>
            absoluteUrl(link.getAttribute("href")),
          ),
        )
      : [];

    const comments = Array.from(
      root.querySelectorAll(".entity-detail-comments .comment_content"),
    )
      .map((comment) => ({
        author:
          textOf(comment, ".comment-info .field-author") ||
          textOf(comment, ".field-author"),
        action: textOf(comment, ".comment-info .field-active"),
        text:
          textOf(comment, ".richText-comment-description") ||
          textOf(comment, ".editor-content"),
        time: textOf(comment, ".comment-actions .field-time"),
        images: Array.from(comment.querySelectorAll("img"))
          .map((image) => ({
            alt: oneLine(image.getAttribute("alt")),
            src: absoluteUrl(
              image.getAttribute("original_src") ||
                image.getAttribute("data-src") ||
                image.getAttribute("src") ||
                image.currentSrc,
            ),
          }))
          .filter(
            (image) =>
              image.src &&
              !image.src.startsWith("data:") &&
              !image.src.includes("/users/avatar/"),
          ),
      }))
      .filter((comment) => comment.text || comment.author || comment.time);

    const tabCounts = Array.from(
      root.querySelectorAll(
        ".detail-container-content [role='tab'], .detail-container-content .el-tabs__item, .detail-container-content a",
      ),
    )
      .map((node) => oneLine(node.innerText))
      .filter((text) => /\(\d+\)|详细信息|变更历史|子需求|缺陷|评论/.test(text));

    const attachmentRoot = root.querySelector(".detail-container-attachment");
    const attachments = attachmentRoot
      ? Array.from(attachmentRoot.querySelectorAll("a[href]"))
          .map((link) => ({
            name: oneLine(link.innerText),
            url: absoluteUrl(link.getAttribute("href")),
          }))
          .filter((attachment) => attachment.name || attachment.url)
      : [];

    return {
      pageKind: "detail",
      workspaceId: context.workspaceId || "",
      id: context.itemId || "",
      shortId: displayId,
      type,
      typeLabel: typeLabel(type),
      title,
      url: location.href,
      status,
      fields,
      description,
      descriptionImages: contentImages,
      descriptionLinks: contentLinks,
      comments,
      attachments,
      tabCounts: unique(tabCounts),
    };
  };

  if (context.pageKind === "detail") {
    return {
      context,
      detail: parseDetail(),
    };
  }

  return {
    context,
    ...parseList(),
  };
})()
