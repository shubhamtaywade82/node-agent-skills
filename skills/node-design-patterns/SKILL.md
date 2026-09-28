---
name: node-design-patterns
description: Use when refactoring Node.js or TypeScript code around changing behavior, external boundaries, construction, pipelines, events, state machines, or cross-cutting concerns and a documented design pattern may reduce coupling without adding ceremony.
---

# Node Design Patterns

## Purpose

Use classic design patterns as problem-solving vocabulary, not as a checklist. Prefer the smallest TypeScript-native expression that isolates a real source of change.

The default is plain functions, objects, modules, and discriminated unions. Introduce a named pattern only when a concrete code smell, boundary, or change requirement justifies it.

## Activate when

Activate for:
- growing conditional branches representing interchangeable algorithms or policies
- provider/vendor API mismatches at infrastructure boundaries
- callers coordinating several steps of a complex subsystem
- executable operations that need logging, retries, queuing, authorization, replay, or delayed execution
- ordered request/processing pipelines with independent handlers
- real event/subscription fan-out
- state machines whose transition behavior is becoming complex
- cross-cutting behavior that should wrap an operation without changing its core logic
- genuinely complex object construction
- tree structures, proxies, or other specialized structures where the problem is explicit

Do not activate merely because a pattern exists in the catalog.

## Repository inspection

Inspect:
1. package.json, tsconfig, runtime version, and framework conventions
2. module boundaries and dependency direction
3. the concrete branching, construction, lifecycle, or integration problem
4. existing utility, middleware, event, DI, validation, and adapter conventions
5. neighboring tests and the repository's validation command
6. whether TypeScript features already solve the problem with less ceremony

Record the current change vector before selecting a pattern.

## Decision rules

### Core rule

Use a pattern only when all three are true:
1. there is a concrete design pressure,
2. the pressure is expected to recur or has already created coupling/duplication,
3. the proposed pattern reduces that pressure more than it increases conceptual complexity.

Prefer:
- composition over inheritance
- functions over one-method classes
- discriminated unions over state-class hierarchies when behavior is small
- explicit dependency injection over hidden globals
- framework/runtime primitives over reimplementing them
- local abstractions before shared abstractions

### Pattern selection matrix

| Problem | Default pattern | Lightweight TypeScript form |
|---|---|---|
| interchangeable algorithms/policies | Strategy | function type + Record/map |
| external API shape mismatch | Adapter | narrow port + adapter module/class |
| simplify a complex subsystem | Facade | small orchestration function/class |
| creation varies by type/config | Factory | factory function or lookup map |
| executable operation needs lifecycle | Command | typed command + handler |
| sequential handlers/guards | Chain of Responsibility | middleware/handler pipeline |
| publish/subscribe events | Observer | existing event emitter/event bus |
| substantial state transitions | State | discriminated union first; state objects only when warranted |
| add cross-cutting behavior | Decorator | higher-order function/wrapper |
| complex stepwise construction | Builder | builder only when construction itself is complex |
| tree structures | Composite | recursive types/functions first |
| controlled access/lazy/cache boundary | Proxy | explicit wrapper/proxy only when needed |
| object history/rollback | Memento | explicit immutable snapshot when domain requires it |

### Rare/avoid-by-default patterns

Abstract Factory, Bridge, Flyweight, Mediator, Prototype, Singleton, Template Method, Visitor, Iterator, and Memento should not be introduced by default.

Use them only after the problem is demonstrated:
- Abstract Factory: multiple related product families must vary together
- Bridge: two independently changing dimensions need separation
- Flyweight: measured memory pressure makes shared intrinsic state worthwhile
- Mediator: many-to-many component communication is creating coupling
- Prototype: cloning semantics are a domain requirement rather than a convenience
- Singleton: only when a true process-wide resource with explicit singleton semantics is required; prefer composition-root ownership
- Template Method: prefer composition/functions; use inheritance only where subclass hooks are a stable contract
- Visitor: stable object structure plus many independent operations, commonly AST/compiler-style domains
- Iterator: use native JavaScript iteration protocols unless custom traversal semantics are required
- Memento: durable domain snapshots/undo/rollback are real requirements

## Implementation procedure

1. State the concrete smell or change vector in one sentence.
2. Try the simplest function/object/module solution first.
3. Check existing runtime/framework primitives before adding infrastructure.
4. Select the smallest matching pattern.
5. Keep the abstraction at the narrowest useful boundary.
6. Define explicit TypeScript contracts for inputs, outputs, and dependencies.
7. Prefer dependency injection through constructors/functions at the composition root.
8. Add behavior tests around the public outcome, not implementation calls.
9. Refactor only after the behavior is protected.
10. Remove the pattern if it creates more indirection than the problem warrants.

### Strategy

Good:

~~~ts
type PricingStrategy = (order: Order) => Money;

const strategies: Record<PricingTier, PricingStrategy> = {
  standard: priceStandard,
  premium: pricePremium,
};

export function price(order: Order): Money {
  return strategies[order.tier](order);
}
~~~

Do not create StrategyContext, abstract base classes, and concrete strategy classes when functions are sufficient.

### Adapter

Define an application-owned port:

~~~ts
interface PaymentGateway {
  charge(input: ChargeInput): Promise<ChargeResult>;
}
~~~

Translate provider DTOs and errors at the boundary. Never leak provider-specific types through domain/application contracts.

### Facade

Expose a task-oriented API over a subsystem when callers currently coordinate many internal steps:

~~~ts
await github.getDeveloperProfile(userId);
~~~

Do not create a facade around a subsystem that already has a simple, stable public API.

### Factory

Prefer a factory function or lookup map:

~~~ts
function createRepository(kind: RepositoryKind): Repository {
  return repositories[kind]();
}
~~~

A class-based factory is justified only when construction itself has state or lifecycle behavior.

### Command

Use Command when the operation needs an explicit lifecycle:

~~~
validate -> authorize -> execute -> observe -> persist/replay
~~~

Keep the command payload serializable when queueing or replay is required. Keep execution dependencies outside the payload.

### Chain of Responsibility

Model each step as a handler with an explicit continuation. Middleware is already a chain; do not build a second abstraction over an existing middleware system.

### Observer

Prefer the application's existing event bus or runtime event mechanism. Define typed event payloads and explicit ownership of subscriptions. Handle subscriber failures according to the application's delivery semantics rather than silently swallowing errors.

### State

Start with a discriminated union:

~~~ts
type Job =
  | { status: "pending" }
  | { status: "processing"; startedAt: Date }
  | { status: "completed"; completedAt: Date }
  | { status: "failed"; error: Error };
~~~

Promote to state objects only when transition behavior becomes substantial enough that the union/switch is itself a maintenance problem.

### Decorator

Prefer higher-order functions for cross-cutting concerns:

~~~ts
const execute = withRetry(withMetrics(withLogger(useCase)));
~~~

Keep wrapper order explicit because ordering can change behavior.

### Builder

Use only when construction has meaningful sequencing, validation, defaults, or many optional combinations. Plain object literals remain the default.

## Complexity budget

Every new abstraction should justify its cost.

Before merging, answer:
- What concrete problem does this abstraction remove?
- What code becomes simpler?
- What future change becomes localized?
- How many new files/types/classes did it add?
- Could a function, map, union, or existing framework primitive do the same job?
- Did dependency direction become clearer or merely more indirect?

Prefer one well-named module over a mini-framework.

## Failure modes

- pattern-driven design with no concrete problem
- Java/C++ style class hierarchies transplanted into TypeScript unnecessarily
- factory/strategy classes for one-line functions
- Singleton used to hide dependency wiring
- repositories/services/facades that only forward a method call
- abstractions created before a second real variation exists
- provider DTOs leaking into domain contracts
- decorators whose order is implicit or undocumented
- state classes when a discriminated union is clearer
- patterns stacked together until navigation becomes harder than the original code
- testing method calls instead of observable behavior
- mixing domain logic with transport/framework concerns while “applying a pattern”

## Verification

For documentation/configuration-only changes, run the repository validator and relevant repository tests.

For production-code refactors:
1. add/update behavior tests before or with the refactor
2. run focused tests
3. run type checking/linting used by the repository
4. run the full test suite
5. inspect dependency direction and changed public contracts
6. confirm no new global state, unnecessary inheritance, or vendor leakage was introduced
7. verify that the resulting code has fewer or more localized change points rather than merely more abstractions

## Source foundation

- https://refactoring.guru/design-patterns/typescript
- https://www.typescriptlang.org/docs/handbook/2/narrowing.html
- https://www.typescriptlang.org/docs/handbook/2/functions.html
