---
name: nestjs
description: Use when a Node.js backend uses NestJS 12.x and HTTP design must map correctly to controllers, guards, pipes, interceptors, exception filters, modules, and dependency injection.
---

# NestJS 12 Adapter

## Purpose
Translate framework-neutral backend boundaries into Nest's declarative module and request lifecycle without moving domain logic into decorators or framework classes.

## Activate when
Detect @nestjs/* packages and verify the installed major is 12.x; confirm companion packages share the intended major.

## Repository inspection
Inspect modules/providers, controllers, global guards/pipes/filters, interceptors, platform adapter, request context, and bootstrap lifecycle.

## Decision rules
- Guards are the authorization boundary; do not treat authentication as authorization.
- Pipes are the external-input transformation/validation boundary and run before the handler.
- Exception filters own transport error formatting; keep domain errors framework-neutral.
- Interceptors are for cross-cutting request/response behavior, not hidden business transactions.
- Providers should depend on abstractions where the dependency direction requires it; avoid circular module graphs.
- Global providers should be registered in a way that preserves dependency injection when they need injected services.
- Platform-specific response APIs belong in the outermost adapter.

## Implementation procedure
1. Map the feature to a module/controller/provider boundary.
2. Validate DTOs at the input edge.
3. Authenticate and authorize before protected application work.
4. Keep use cases independent of Nest decorators and request objects.
5. Map exceptions at the transport boundary.
6. Test module integration and request behavior, not Nest internals.

## Failure modes
- A DTO class is used as proof of runtime validity without a validation pipe.
- A guard checks only whether a token exists instead of whether access is allowed.
- Request/response framework types leak into domain services.
- Global filters are instantiated outside the DI context and silently lose dependencies.
- Circular module dependencies hide an unclear ownership boundary.

## Verification
Test pipes with malformed inputs, guards with authenticated-but-forbidden users, exception mapping, provider wiring, and graceful bootstrap/shutdown.

## Sources
- https://docs.nestjs.com/guards
- https://docs.nestjs.com/pipes
- https://docs.nestjs.com/exception-filters
- https://docs.nestjs.com/security/authentication
- https://docs.nestjs.com/migration-guide