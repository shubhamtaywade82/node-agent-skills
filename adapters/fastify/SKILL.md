---
name: fastify
description: Use when a Node.js backend uses Fastify 5.x and HTTP design must map correctly to its lifecycle hooks, schema validation, plugins, encapsulation, and error handling semantics.
---

# Fastify 5 Adapter

## Purpose
Translate framework-neutral HTTP contracts into Fastify 5.x while respecting hook order, encapsulation, schemas, and lifecycle ownership.

## Activate when
Detect fastify in package.json or imports and verify the installed major is 5.x.

## Repository inspection
Find plugin boundaries, route schemas, hooks, custom error handlers, decorators, lifecycle startup/close, and inject-based tests.

## Decision rules
- Fastify request processing is lifecycle-driven; select the hook closest to the boundary being changed.
- Request validation should use route schemas or the project's validated boundary approach; avoid asynchronous database access during initial validation.
- Custom error handlers must preserve safe public responses and avoid exposing raw library messages.
- Encapsulation is a correctness boundary: plugins and their hooks/decorators may be intentionally scoped.
- Async hooks/handlers should use promises consistently; do not mix callback and async styles in the same function.
- Use onClose for orderly cleanup of plugin-owned resources.

## Implementation procedure
1. Define route schemas and response contracts.
2. Place authentication/validation in the appropriate lifecycle stage.
3. Keep business logic outside the framework request/reply objects.
4. Install error handling at the intended encapsulation scope.
5. Use lifecycle close hooks for resource cleanup.

## Failure modes
- Business logic depends on a decorator that is not present in every encapsulated plugin.
- Validation performs database queries and becomes a DoS vector.
- A callback is used in an async hook, causing duplicate lifecycle continuation.
- Framework default errors expose internal messages.
- A resource is created in a plugin but never closed.

## Verification
Test lifecycle order, schema rejection, custom errors, encapsulation, plugin startup/close, and representative routes with Fastify injection.

## Sources
- https://fastify.dev/docs/latest/Reference/Lifecycle/
- https://fastify.dev/docs/latest/Reference/Hooks/
- https://fastify.dev/docs/latest/Reference/Validation-and-Serialization/
- https://fastify.dev/docs/latest/Reference/Errors/