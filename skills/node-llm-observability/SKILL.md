---
name: node-llm-observability
description: Use when observing LLM calls in production: tracing, token usage, cost, latency, hallucination, prompt regression.
---

# Node LLM Observability

## Purpose

LLM observability is distinct from general backend observability. Each LLM call has prompt + completion + tokens + cost + latency + a chain of tool calls + a probabilistic output. Without dedicated instrumentation, you are blind to hallucination, prompt regression, and cost overruns.

## Activate when

- Adding observability to an LLM-backed feature.
- Diagnosing prompt regression (output quality dropped after a prompt change).
- Diagnosing cost overruns (token usage higher than expected).
- Diagnosing hallucination (model fabricates facts).
- Choosing between Langfuse, Langsmith, Helicone, Braintrust, Phoenix (Arize), OpenLLMetry.

## Repository inspection

1. Observability SDK — grep for `langfuse`, `langsmith`, `@helicone/openai-node`, `@arize-io/openinference`, `openllmetry`. Read the version.
2. OpenTelemetry — grep for `@opentelemetry/api`, `@opentelemetry/sdk-node`. Find the tracer setup.
3. LLM SDK wrapping — grep for `wrapOpenAI`, `observe`, `withTracing`. Find where the LLM client is wrapped for observability.
4. Logs — grep for `console.log`, `logger.info`. Find where LLM prompts and completions are logged (or redacted).
5. Metrics — grep for `llm_tokens_total`, `llm_latency`, `llm_cost`. Find the metrics exported.
6. Alerts — grep for `alert`, `budget`, `burn_rate`. Find cost and quality alerts.

## Decision rules

| Concern | Rule |
|---|---|
| Tracing | Every LLM call is a span: prompt, completion, model, tokens, latency, tool calls. Propagate `traceparent` across the call chain. |
| Token usage | Log prompt + completion tokens per call. Tag with user/tenant. Alert on per-tenant burn. |
| Cost | Multiply tokens by the model's price. Log cost per call. Daily roll-up per tenant. Alert on budget burn. |
| Latency | p99 ≤ 30s for chat, ≤ 60s for tool-augmented. Set per-call timeout ≤ the SLA. |
| Hallucination | Log the post-generation verification result. Alert when hallucination rate exceeds threshold. |
| Prompt regression | Version prompts. Diff outputs on a golden test set when the prompt changes. |
| PII | Redact user-supplied prompts before logging. Use Langfuse's `redact` or pre-process prompts before sending. |
| Sampling | Sample traces (1-10% in prod, 100% in dev). Always sample errors at 100%. |
| Comparison | Use evals + golden outputs to compare two prompts or two models. Never deploy a prompt change without an eval. |
| Aggregation | Daily metrics: total tokens, total cost, p50/p95/p99 latency, error rate, hallucination rate per feature. |
| Alerting | Alert on: cost > budget, latency > SLO, error rate > threshold, hallucination rate > threshold. |
| Tool calls | Log each tool call in the chain: input, output, latency. Surface in the trace. |

## Implementation procedure

1. Pick the observability platform: Langfuse (open-source, self-hostable), Langsmith (LangChain), Helicone (proxy), Braintrust (evals-focused), Phoenix (Arize).
2. Wrap the LLM client with the observability SDK. Confirm prompt + completion + tokens + cost are captured.
3. Add OpenTelemetry for non-LLM spans (DB, HTTP, queue). Propagate `traceparent`.
4. Add metrics: `llm_tokens_total{model,feature,tenant}`, `llm_cost_total{...}`, `llm_latency{...}`.
5. Add alerts: cost > budget, latency > SLO, error rate > threshold, hallucination rate > threshold.
6. Add a prompt regression test: golden outputs on a fixed prompt; diff when prompt changes.
7. Add PII redaction before logging prompts.

## Failure modes

- No observability → cannot debug a "the LLM gave bad answers" report.
- LLM client not wrapped → calls invisible to observability.
- PII in prompts logged raw → compliance violation.
- No token usage logging → cost blind, burn undetected.
- No latency p99 → user-facing latency spikes invisible.
- No hallucination metric → user trust erodes silently.
- Prompt changed without eval → behavior drifts, regression ships to prod.
- Sampling at 100% in prod → cost + storage explosion.
- Sampling at 0% → blind.
- Tool calls not traced → cannot debug a multi-step agent failure.

## Verification

- Make an LLM call; confirm the trace appears in Langfuse/Langsmith with prompt + completion + tokens + cost.
- Trigger a hallucination; confirm the verification step records the failure.
- Change the prompt; confirm the golden-output eval runs and surfaces a diff.
- Trigger a cost budget breach; confirm the alert fires.
- Trigger a latency SLO breach; confirm the alert fires.
- Inspect the trace tree: confirm LLM call, tool call, DB call are nested correctly.
- Confirm PII is redacted in the stored prompt.
- Source references: https://langfuse.com/docs, https://docs.smith.langchain.com/, https://www.helicone.ai/, https://www.braintrust.dev/, https://github.com/Arize-ai/openinference, https://opentelemetry.io/docs/specs/semconv/gen-ai/.
