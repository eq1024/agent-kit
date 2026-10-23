---
name: bug-debugging
description: Investigate and fix software bugs with evidence-backed diagnosis and approval-gated code changes. Use when asked to reproduce, diagnose, root-cause, or propose a fix for a bug, defect, regression, or failing behavior.
---

# Bug Debugging

## Outcome

Investigate reported behavior until the failure point and required correction are
supported by evidence, then present a concrete repair plan. Do not modify code
until the user explicitly approves that plan.

## Operating Boundary

Treat "处理这个 Bug", "修复这个问题", or an equivalent bug-fix request as
authorization to investigate and propose a change, not authorization to edit
source, tests, configuration, data, or deployment state.

The original bug-fix request is not code approval. A later, explicit instruction
such as "按这个方案修改" or "同意，开始改代码" is required. If implementation
later requires a materially different fix, stop and obtain fresh approval.

## Workflow

1. Establish the reported behavior: expected result, actual result, affected
   environment/client, timing, and reproduction conditions. Read the complete
   ticket or issue description, comments, and attachments. Inspect relevant
   images rather than inferring their content from alt text or the title.
2. Inspect the relevant code paths and supporting evidence yourself. Use
   repository search, tests, logs, request/response payloads, configuration,
   data, and reproduction as applicable. Do not ask the user for information
   that can be obtained from available tools.
3. Reproduce or otherwise verify the failure. If reproduction is impossible,
   state that clearly and identify which evidence was used instead.
4. Trace the failure from the observed symptom to the faulty behavior. Check the
   contract at caller/callee boundaries when frontend, App, API, persistence, or
   asynchronous state are involved. Read enough surrounding code to avoid
   proposing a local patch that violates the wider contract.
5. Form and test the root-cause hypothesis. Separate:
   - confirmed facts;
   - the confirmed root cause;
   - plausible but unverified causes.
6. Design the smallest fix that addresses the cause without unrelated changes.
   Identify affected files/functions or API contracts, backward-compatibility
   concerns, regression risk, and the tests or manual checks needed.
7. Stop before editing. Present the evidence-backed proposal and request approval
   to implement it.

## Uncertainty Is Mandatory to Disclose

When the root cause or correct fix cannot be established, lead with "未确定" or
"证据不足". Then state:

- what is already confirmed;
- what remains unknown;
- which specific check, log, reproduction, or code path is needed next;
- whether the proposed fix is only a candidate.

Never present a likely cause as confirmed, invent a file or line reference, claim
that a bug was reproduced when it was not, or imply that code was changed before
approval.

## Required Fix Proposal

Include the following in the final investigation response:

- symptom, impact, and reproduction summary;
- actual client/project when relevant and the evidence used to determine it;
- root cause labeled as `已确认`, `较可能`, or `未确认`;
- supporting evidence with clickable file/line references, request/response
  details, logs, screenshots, failing tests, or exact reproduction steps;
- a specific fix plan describing what behavior changes and where;
- regression risks and a validation/test plan;
- an explicit statement that no code has been modified;
- a request for approval of that concrete plan.

## After Approval

Once the user approves the concrete proposal:

1. Implement only the approved scope.
2. Add or update tests where appropriate.
3. Run the relevant verification and inspect the resulting diff.
4. Report changed files, test results, remaining risks, and any deviation from
   the approved plan.

Do not update the tracker, post comments, change status, or assign owners unless
the user separately authorizes those external actions.

## Ticket Integration

When the issue lives in TAPD, use the available `tapd-workbench` skill to retrieve
the authenticated ticket details, comments, and relevant images. TAPD retrieval
is evidence collection for this workflow; code-level diagnosis and the approval
gate remain governed by this skill.
