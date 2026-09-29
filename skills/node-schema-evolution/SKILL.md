---
name: node-schema-evolution
description: Use when evolving API, event, webhook, or persistent data schemas across independently deployed Node.js services and mixed-version clients.
---

# Schema Evolution

## Purpose
Change schemas without breaking readers or writers deployed at different times.

## Activate when
- Adding, renaming, or removing fields.
- Evolving events, webhooks, APIs, or database columns.
- Rolling producers and consumers separately.

## Repository inspection
Inspect schema owners, readers/writers, versioning strategy, serialization, migrations, compatibility tests, and rollout order.

## Decision rules
| Concern | Rule |
|---|---|
| Ownership | One system owns the canonical schema contract. |
| Compatibility | Prefer additive changes old readers can tolerate. |
| Removal | Remove only after old readers/writers are retired. |
| Defaults | Define semantic defaults explicitly. |
| Events | Preserve replay compatibility and version deliberately. |
| Database | Use expand-contract where mixed versions exist. |

## Implementation procedure
1. Inventory all readers and writers.
2. Classify the change as additive, incompatible, or transitional.
3. Add compatibility support before new assumptions.
4. Migrate producers/consumers in a safe order.
5. Verify mixed-version behavior.
6. Remove compatibility only after retirement gates.

## Failure modes
- Fields are removed before all consumers stop reading them.
- Renamed enum values are treated as additive.
- New non-null DB columns arrive before old binaries can write them.
- Replays use a schema newer than deployed consumers.

## Verification
Test old/new reader combinations, validation, replay, rollback boundaries, and cleanup conditions.