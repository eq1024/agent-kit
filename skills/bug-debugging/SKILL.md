---
name: bug-debugging
description: Investigate and fix software bugs with evidence-backed diagnosis and approval-gated code changes. Use when asked to reproduce, diagnose, root-cause, or propose a fix for a bug, defect, regression, or failing behavior.
---

# Bug Debugging

## Outcome

Investigate the reported behavior, establish a baseline for existing behavior,
identify the failure point, and present an evidence-backed repair contract. Do
not modify source or tests until the user explicitly approves that contract; then
implement it with TDD.

## Operating Boundary

Treat "处理这个 Bug", "修复这个问题", or an equivalent bug-fix request as
authorization to inspect, run existing tests, reproduce, and propose a change.
It is not authorization to edit source, tests, configuration, data, or
deployment state.

The original bug-fix request is not code approval. A later, explicit instruction
such as "按这个方案修改" or "同意，开始改代码" is required. If implementation
later requires a materially different fix, stop and obtain fresh approval.

## Workflow

1. Establish the reported behavior: expected result, actual result, affected
   environment/client, timing, reproduction conditions, and the initially
   suspected impact scope. Read the complete ticket or issue description,
   comments, and attachments. Inspect relevant images rather than inferring
   their content from alt text or the title.
2. Understand the existing feature before changing it. Read the relevant code,
   tests, docs, `CONTEXT.md`, and ADRs where present. Run the existing tests,
   smoke checks, or reproducible baseline flows that cover the affected area.
   Record the commands and environment, which behavior passed or failed before
   the fix, pre-existing failures, and coverage gaps.

   Passing tests prove only the covered behavior. Do not claim that all existing
   functionality is normal when important paths lack coverage.
3. Reproduce or otherwise verify the failure. If reproduction is impossible,
   state that clearly and identify which evidence was used instead.
4. Trace the failure from the observed symptom to the faulty behavior. Check the
   contract at caller/callee boundaries when frontend, App, API, persistence, or
   asynchronous state are involved. Read enough surrounding code to avoid
   proposing a local patch that violates the wider contract. Update the impact
   scope so it reflects evidence rather than the initial guess.
5. Form and test the root-cause hypothesis. Separate:
   - confirmed facts;
   - the confirmed root cause;
   - plausible but unverified causes.
6. Triage boundary cases:
   - required: caused by the same root cause or needed to prevent incorrect
     behavior;
   - optional: related hardening that the user may choose to include;
   - out of scope: unrelated improvements or speculative features.

   Keep optional items separate from the minimum fix. Do not expand scope without
   approval.
7. Design the smallest fix that addresses the cause and define the TDD contract:
   affected files/functions or API contracts, intended behavior, acceptance
   cases, public test seams, the first failing regression test, existing
   regression tests, backward-compatibility concerns, and residual risk.
8. Stop before editing. Present the evidence-backed proposal and request approval
   to implement it.

If the user reviews or supplements the proposal, incorporate the decision and
state the final approved scope before starting implementation.

## Shared and Reusable Code

Treat shared libraries, generic components, framework extensions, and other
widely reused modules as high-blast-radius code. A local symptom does not by
itself justify adding local business knowledge to a shared layer.

Before proposing or making a shared-code change, identify the actual consumers
and decide whether the behavior is a general contract or a caller-specific
exception. Modify the shared layer only when the change:

- can be expressed through a general input, configuration, capability, or
  extension point;
- is valid for the shared abstraction rather than for one page, workflow,
  route, tenant, project, or ticket; and
- preserves existing behavior for consumers that do not opt into or provide the
  new context.

Prefer, in order:

1. Correct missing or incorrect data at the owning contract boundary.
2. Supply the behavior through configuration or parameters from the caller.
3. Keep one-consumer behavior in the caller or a local composition layer.
4. Add a reusable seam such as a provider, hook, adapter, resolver, or declared
   policy when multiple consumers genuinely need the capability.

Do not put scenario-specific conditions, identifiers, names, labels, routes, or
one-off rules into shared code. A condition in shared code must be based on a
declared generic contract or capability, not on recognizing a particular
consumer.

If a shared-code change is unavoidable, include in the proposal:

- why the behavior belongs to the shared abstraction;
- the caller/configuration path that supplies any scenario-specific context;
- alternatives considered and why local or upstream fixes are insufficient;
- affected consumers, opt-in/opt-out behavior, compatibility, and blast radius;
- tests proving the generic behavior and proving unaffected consumers still
  behave the same.

If a generic contract cannot be established, treat the shared change as
unapproved and keep the fix local, fix the upstream contract, or stop and request
the missing decision.

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

- symptom, reported impact, evidence-backed impact scope, and reproduction
  summary;
- actual client/project when relevant and the evidence used to determine it;
- existing-function baseline, including test commands, results, pre-existing
  failures, and coverage gaps;
- root cause labeled as `已确认`, `较可能`, or `未确认`;
- supporting evidence with clickable file/line references, request/response
  details, logs, screenshots, failing tests, or exact reproduction steps;
- a specific fix plan describing what behavior changes and where, including the
  minimum required changes;
- whether any shared or reusable code must change, and if so, the general
  contract that justifies it, its consumers, and its regression surface;
- boundary cases classified as required, optional, or out of scope;
- proposed public test seams, acceptance cases, the first regression test, and
  the existing tests to rerun;
- regression risks and a validation/test plan;
- an explicit statement that no code has been modified;
- a request for approval of that concrete plan.

## After Approval

Once the user approves the concrete proposal, read and apply the `tdd` skill.
The approved proposal is the fix contract.

Before writing a test:

1. Confirm that the test seams, acceptance cases, included optional boundary
   items, and out-of-scope items were approved.
2. Read `CONTEXT.md` if present and respect relevant ADRs.
3. If a new test seam is needed or the approved seam must change, ask before
   writing the test.

Then implement in small vertical slices:

1. Write one behavior-focused regression test at an approved public seam.
2. Run it and confirm it fails for the expected reason; this is the Red step.
3. Write only enough production code to make that test pass.
4. Rerun it and confirm Green.
5. Repeat one test and one minimal implementation per cycle.
6. Run the pre-fix baseline tests plus new tests and relevant manual or E2E
   checks. Inspect the resulting diff for scenario-specific logic or
   project-specific knowledge leaked into shared code.
7. Refactor only after the behavior is Green, then rerun verification.
8. Report changed files, Red/Green evidence, baseline-versus-result, remaining
   risks, and any deviation from the approved plan.

If automated TDD is not feasible for the affected surface, say so explicitly
before implementation. Use the closest contract, integration, or E2E check plus
manual verification. Do not fabricate a Red/Green cycle or add an
implementation-coupled test merely to claim TDD was followed.

If implementation changes the root cause, public behavior, or core scope, pause
and request updated approval before proceeding.

Do not update the tracker, post comments, change status, or assign owners unless
the user separately authorizes those external actions.

## Ticket Integration

When the issue lives in TAPD, use the available `tapd-workbench` skill to retrieve
the authenticated ticket details, comments, and relevant images. TAPD retrieval
is evidence collection for this workflow; code-level diagnosis and the approval
gate remain governed by this skill.
