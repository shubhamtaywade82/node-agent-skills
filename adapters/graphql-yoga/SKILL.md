---
name: adapter-graphql-yoga
description: Use when the repository uses GraphQL Yoga.
---

# GraphQL Yoga adapter

## Purpose

Translate framework-neutral GraphQL/backend guidance into GraphQL Yoga-specific mechanics.

## Activate when

- GraphQL Yoga is present in the target repository.
- The detected version matches the documented scope.

## Repository inspection

1. Inspect package.json, lockfile, Node.js version, GraphQL version, and server integration.
2. Confirm the exact installed GraphQL Yoga version.
3. Locate schema/resolver construction, request context, plugins/middleware, and server lifecycle.
4. Inspect GraphQL integration tests, HTTP tests, and production startup/shutdown code.

## Decision rules

- Core GraphQL, HTTP, auth, validation, and lifecycle skills remain authoritative.
- Detect exact versions and peer dependencies before applying APIs.
- Keep schema/business logic independent from framework-specific request objects.
- Treat GraphQL variables, headers, and resolver inputs as runtime data.

## Implementation procedure

1. Detect GraphQL Yoga and its exact dependency versions.
2. Select the owning framework-neutral skill.
3. Apply GraphQL Yoga-specific server/context/lifecycle mechanics.
4. Add focused HTTP/GraphQL integration tests.
5. Verify startup, shutdown, error handling, and production configuration.

## Failure modes

- Copying incompatible major-version APIs.
- Treating context as globally shared state.
- Exposing development tooling unintentionally.
- Skipping query/resource protections because the schema is typed.

## Verification

1. Run focused GraphQL/HTTP tests.
2. Run full repository tests and typecheck/build gates.
3. Exercise auth failures, malformed variables, expensive queries, and shutdown.
4. Review production configuration for unintended exposure.

## Source

https://the-guild.dev/graphql/yoga-server/docs

## Version scope

5.x.

## Adapter guidance

Use the latest `graphql-yoga` v5 line when the repository already uses Yoga. Keep schema/resolver ownership framework-neutral; create the Yoga server once; bind it to the repository's HTTP lifecycle; keep GraphQL context scoped to the request; disable development-only IDE exposure in production as appropriate.
