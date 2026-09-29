---
name: node-load-shedding
description: Use when a Node.js service is overloaded and must reject or degrade work deliberately to protect latency, memory, and critical capabilities.
---

# Load Shedding

## Purpose
Under overload, bounded rejection is safer than unbounded queue growth. Load shedding is an admission-control policy tied to explicit priorities.

## Activate when
- Requests or jobs arrive faster than the service can process.
- Memory, CPU, event-loop delay, sockets, or downstream capacity is saturating.
- Critical traffic must remain available during bursts.

## Repository inspection
Identify saturation signal, queue depth, concurrency, request priority, capacity reserve, and current timeout/retry behavior.

## Decision rules
| Concern | Rule |
|---|---|
| Trigger | Shed based on measurable saturation, not arbitrary elapsed time. |
| Priority | Protect critical/cheap-to-serve work over low-value work. |
| Queue | Never convert overload into an unbounded queue. |
| Feedback | Return an explicit overload signal and allow clients to back off. |
| Retry | Coordinate server shedding with client retry policy to avoid retry storms. |
| Recovery | Hysteresis prevents rapid shed/accept oscillation. |

## Implementation procedure
1. Define the protected capacity.
2. Select a reliable saturation signal.
3. Define priority classes and admission budgets.
4. Reject or degrade before expensive downstream work starts.
5. Emit overload and recovered-capacity metrics.
6. Test burst, sustained overload, and recovery.

## Failure modes
- Requests are accepted into memory faster than they can complete.
- 429/503 responses trigger identical client retry schedules.
- Shedding low-priority traffic also blocks health or control traffic.
- Threshold oscillation creates unstable behavior.

## Verification
Load-test bursts and sustained overload; verify bounded memory, protected priority traffic, useful overload responses, and recovery hysteresis.
