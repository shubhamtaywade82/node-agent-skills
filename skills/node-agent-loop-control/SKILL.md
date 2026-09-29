---
name: node-agent-loop-control
description: Use when an AI coding agent needs bounded iteration, termination detection, or protection against repetitive tool loops.
---

# Agent Loop Control

## Purpose

Bound agent execution so repeated observations or actions cannot create infinite, wasteful, or unsafe loops.

## Activate when

- An AI coding agent can iterate through planning, tool use, verification, or repair cycles.
- The task may repeatedly produce the same failing observation or tool action.

## Repository inspection

1. Inspect the agent runtime, state model, tool invocation path, and existing execution budgets.
2. Identify where iteration count, elapsed time, tool calls, and repeated actions can be measured.
3. Locate stop, retry, escalation, and resume semantics.
4. Confirm which failures are safe to retry and which require a hard stop.

## Decision rules

- Every autonomous loop has explicit termination conditions.
- Repeating the same action without new evidence is a loop failure, not progress.
- Iteration, time, tool-call, and cost budgets fail closed.
- Escalation or safe termination is preferred to unbounded repair attempts.

## Implementation procedure

1. Define maximum iterations and total execution budget.
2. Define progress signals and repeated-action detection.
3. Track state transitions and tool calls.
4. Stop on budget exhaustion or repeated no-progress cycles.
5. Escalate when the task remains unresolved after bounded recovery.
6. Record termination reason for replay and audit.
7. Test successful completion, budget exhaustion, and repeated-action termination.

## Failure modes

Avoid:

- Unbounded while/retry loops.
- Resetting iteration counters when only the tool changes.
- Treating repeated identical output as progress.
- Silently continuing after a hard safety gate fails.

## Verification

1. Add a failing loop-control contract test first.
2. Exercise normal progress and repeated no-progress paths.
3. Verify iteration/time/tool budgets terminate deterministically.
4. Verify audit/replay state records the termination reason.
5. Run the full repository gates.
