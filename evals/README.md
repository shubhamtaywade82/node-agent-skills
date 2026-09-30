# Routing evaluation protocol

The routing evaluator turns an agent's routing decisions into deterministic, machine-readable regression results.

## Run

    npm run eval:routing -- --decisions ./decisions.jsonl

A different corpus can be supplied explicitly:

    npm run eval:routing -- --cases ./evals/cases/agent-network-security/workflow.yml --decisions ./decisions.jsonl

## Decision JSONL

Each line contains one decision:

    {"case":"rest-endpoint","primary":"node-rest-api-design","secondary":["node-http-engineering","node-runtime-validation"]}

Adapter-aware cases include the required adapter path:

    {"case":"express-api","primary":"node-http-engineering","secondary":["node-runtime-validation"],"adapter":"adapters/express/SKILL.md"}

The evaluator fails closed for:

- missing decisions: DECISION_MISSING
- extra case IDs: UNKNOWN_CASE
- duplicate case IDs: DUPLICATE_DECISION
- malformed JSONL: DECISION_JSON_INVALID
- missing case IDs: DECISION_CASE_MISSING
- wrong primary skills: PRIMARY_MISMATCH
- forbidden or unknown skills: FORBIDDEN_* and UNKNOWN_SKILL
- missing or incorrect adapters: ADAPTER_MISSING, ADAPTER_MISMATCH, UNEXPECTED_ADAPTER

The corpus is validated in strict evaluation mode before scoring. Required prompt, routing-signal, negative-signal, evidence, disambiguation, forbidden-skill, and invariant metadata must be present. Invalid primary, secondary, forbidden-skill, duplicate-case, or adapter references stop evaluation.

## Report contract

    {
      "total": 20,
      "passed": 20,
      "failed": 0,
      "primary_accuracy": 1,
      "adapter_accuracy": 1,
      "secondary_violation_rate": 0,
      "failures": []
    }

primary_accuracy is calculated only over scored corpus cases; missing and extra submissions do not inflate it.

adapter_accuracy is calculated only across cases that explicitly require an adapter and is null when the corpus has no adapter-required cases.

secondary_violation_rate measures scored decisions that contain malformed, duplicate, self-referential, unknown, or forbidden secondary selections.

## Agent workflow

1. Inspect the repository and identify the owning routing boundary.
2. Produce one deterministic decision record per evaluation case.
3. Run npm run eval:routing.
4. Fix routing errors without weakening the corpus or validator.
5. Preserve the JSON report as regression evidence.
