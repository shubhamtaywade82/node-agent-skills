---
"node-agent-skills": minor
---

Enriched the routing-demand tier to the full band baseline: `node-runtime-validation`, `node-auth-security`, `node-production-runtime`, `node-http-engineering`, and `node-async-concurrency` each gained purpose prose, a boundary-with-related-skills section, and a compact load-bearing reference example (strict bounded env/webhook schemas with schema-derived types; boundary authn middleware with one policy function per resource and RLS-backed tenant isolation; the deadline-bounded shutdown sequence with readiness-first flip; `AsyncLocalStorage` request context with a single error-to-envelope mapping; `p-limit` fan-out with `AbortSignal.any` deadline propagation and modeled partial success). Also refreshed the react companion snapshot to the companion's band-4 merge (`a7e8cc5`; inventory unchanged, collision set unchanged).
