---
name: node-llm-cost-engineering
description: Use when bounding, allocating, and alerting on LLM cost in a Node.js backend (per-tenant budgets, model routing, caching, token caps).
---

# Node LLM Cost Engineering

## Purpose

LLM cost is a per-request variable cost. Without explicit budgets, routing, caching, and caps, a single misbehaving tenant can rack up a four-figure bill in a day.

## Activate when

- Setting per-tenant LLM cost budgets and alerts.
- Choosing model routing (GPT-4o-mini for easy, GPT-4o for hard, Claude for reasoning).
- Adding response caching to skip the LLM call on semantically equivalent prompts.
- Diagnosing cost overruns, billing surprises, or quota exhaustion.
- Allocating cost per feature, per tenant, per user.

## Repository inspection

1. LLM SDK — grep for `openai`, `@anthropic-ai/sdk`, `ai`, `@langchain/`. Read the version and the model names in use.
2. Model usage — find every `chat.completions.create`, `streamText`, `generateText`. List the models and parameters.
3. Token logging — grep for `usage`, `prompt_tokens`, `completion_tokens`. Confirm usage is logged per call.
4. Cost allocation — grep for `tenantId`, `userId`, `featureId`. Find whether cost is attributed per tenant/feature/user.
5. Caching — grep for `cache`, `cacheKey`, `LRUCache`, `redis.get`. Find whether LLM responses are cached.
6. Budgets — grep for `budget`, `quota`, `cap`, `limit`. Find per-tenant or per-feature caps.
7. Alerts — grep for `alert`, `burn_rate`, `threshold`. Find cost alerts.

## Decision rules

| Concern | Rule |
|---|---|
| Per-tenant budget | Set a daily/weekly/monthly cap per tenant. Hard cap (reject new calls) or soft cap (alert + degrade). |
| Per-feature budget | Set a per-feature cap. A feature that explodes should not consume the tenant's whole budget. |
| Model routing | Route by task difficulty: easy → GPT-4o-mini (cheap), medium → GPT-4o, hard → Claude Opus. Document the routing decision. |
| Caching | Cache semantically equivalent prompts (normalized prompt + model + temperature). TTL ≥ 24h. Invalidate on prompt change. |
| Token caps | Set per-request `max_tokens`. Cap the request at the task's max useful length. |
| Context trimming | Trim conversation history before sending. Old turns → summary or drop. Bound the input tokens. |
| Batch processing | For non-interactive workloads, use batch APIs (OpenAI Batch, 50% discount, 24h turnaround). |
| Streaming | Stream tokens; the user sees progress. Cost is the same but perceived latency is lower. |
| Fallback | On rate limit or 5xx, fall back to a cheaper model. Document the fallback. |
| Cost visibility | Per-tenant, per-feature, per-model cost dashboard. Daily roll-up. |
| Alerting | Alert when: tenant daily cost > budget, feature cost > expected, error rate > threshold (wasted spend). |
| Quota enforcement | Reject calls when budget exhausted. Return a clear `429 Too Many Requests` with `Retry-After`. |
| Free tier | For free-tier users, route to the cheapest model and cap tokens aggressively. |

## Implementation procedure

1. List the LLM-driven features and their typical token usage per call.
2. Pick the model routing per feature: easy → mini, medium → standard, hard → premium. Document.
3. Set per-tenant budgets (daily, weekly, or monthly). Hard or soft cap. Document.
4. Set per-feature budgets (so one feature cannot consume the tenant's whole budget).
5. Implement caching: cache key = normalized prompt + model + temperature. TTL ≥ 24h. Invalidate on prompt change.
6. Implement token caps: per-request `max_tokens`. Bound the input via context trimming.
7. Implement quota enforcement: check budget before the call. Reject with `429` + `Retry-After` when exhausted.
8. Add observability: per-tenant, per-feature, per-model cost dashboard. Alert on burn.
9. Add batch processing for non-interactive workloads.

## Failure modes

- No per-tenant budget → one tenant racks up a 5-figure bill.
- No caching → same prompt recomputed 1000×, cost explodes.
- No context trimming → conversation grows, input tokens grow, cost grows linearly.
- No model routing → hardest model for every call, 10× cost.
- No quota enforcement → budget breach, the LLM call still happens.
- No per-feature budget → one feature (e.g., chat) consumes the tenant's whole budget; other features starve.
- No alerting → breach detected days later when the bill arrives.
- Per-request `max_tokens` unbounded → completion runs to the model's max, 10× cost per call.
- Streaming disabled → user perceives long latency, even though cost is the same.
- Fallback to a more expensive model on rate limit → cost spiral.

## Verification

- Make a call; confirm the cost is logged and attributed to the right tenant/feature.
- Trigger the daily budget cap; confirm new calls return `429` with `Retry-After`.
- Trigger a feature budget cap; confirm the feature degrades but other features still serve.
- Send the same prompt twice; confirm the second call is cached (cost = 0).
- Send a long conversation; confirm context trimming reduces input tokens.
- Trigger a model routing change (task marked easy); confirm the cheaper model is used.
- Inspect the cost dashboard: per-tenant, per-feature, per-model numbers visible.
- Trigger a budget alert; confirm it fires.
- Source references: https://platform.openai.com/docs/guides/batch, https://www.anthropic.com/pricing, https://openai.com/api/pricing/, https://docs.cohere.com/docs/rate-limits, https://langfuse.com/docs/cost-management.
