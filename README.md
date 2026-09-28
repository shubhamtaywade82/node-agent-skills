# node-agent-skills

Production-grade **Node.js + TypeScript backend engineering skills for AI coding agents**.

The core is framework-neutral. The pack teaches agents to inspect first, identify the owning boundary, reason about runtime and type contracts, handle untrusted input, bound concurrency, enforce persistence integrity, secure APIs, test behavior, observe production systems, and verify performance.

## Verify
~~~bash
npm test
npm run validate
~~~

## Initial inventory
- node-architecture
- node-design-patterns
- node-runtime-foundations
- node-async-concurrency
- node-typescript-contracts
- node-runtime-validation
- node-api-engineering
- node-auth-security
- node-postgresql-persistence
- node-background-jobs-reliability
- node-observability
- node-testing
- node-performance
- node-production-runtime
- node-external-integrations

## Architecture
skills/ contains routed knowledge units. skill-manifest.yml is the registry. router/ defines ownership. scripts/validate.mjs checks consistency. test/ protects repository contracts. evals/ contains behavioral cases.

Design patterns are taught as a **conditional refactoring toolkit**. The pack covers the classic TypeScript catalog, but defaults to functions, objects, maps, discriminated unions, composition, and existing runtime/framework primitives before introducing class-heavy pattern structures.

Framework and vendor adapters are intentionally deferred until the core contracts stabilize.

Node 24+ is used for repository tooling. Node.js currently lists v24 as LTS; production applications should use Active or Maintenance LTS releases.

## Sources
- https://nodejs.org/en/about/previous-releases
- https://www.typescriptlang.org/tsconfig/module
- https://opentelemetry.io/docs/languages/js/
- https://owasp.org/API-Security/
- https://refactoring.guru/design-patterns/typescript
