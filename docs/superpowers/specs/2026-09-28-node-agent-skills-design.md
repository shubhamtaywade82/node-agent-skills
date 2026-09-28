# Node Agent Skills Design

## Goal
Create a standalone, framework-neutral skill pack that enables AI coding agents to design, implement, test, secure, observe, and operate production Node.js + TypeScript backend systems.

## First release
The first release establishes the reusable core across architecture, runtime, async concurrency, TypeScript contracts, runtime validation, APIs, security, PostgreSQL, jobs/reliability, observability, testing, performance, production runtime, and external integrations.

## Agent contract
Agents inspect the repository first, identify the dominant boundary, load the owning skill, and verify behavior at the boundary that owns the contract.

## Deferred
Framework, ORM, queue-provider, cloud, and infrastructure adapters are deferred until the core contracts stabilize.
