---
name: node-zero-downtime
description: Use when deploying or restarting Node.js services without interrupting active traffic, including readiness, draining, graceful shutdown, rolling updates, and mixed-version compatibility.
license: MIT
---

# Zero-Downtime Operations

## Purpose

A deploy is safe only when old and new processes can coexist and active work has a bounded drain path. Zero downtime is a sequence contract: ready → deregistered → drained → closed → exited, all inside the orchestrator's termination deadline. Any step that blocks or lies breaks the rollout.

## Activate when

- Deploying Node.js services behind a load balancer or Kubernetes.
- Changing startup/readiness/shutdown behavior.
- Rolling out a schema or API change.

## Boundary with related skills

- Use `node-zero-downtime` for the process lifecycle around deploys.
- Use `node-release-engineering` for the artifact/rollback pipeline around it.
- Use `node-migrations` for expand/contract schema sequencing during rolling deploys.
- Use `node-background-jobs-reliability` for job-drain semantics specifically.

## Repository inspection

Inspect health endpoints, readiness conditions, SIGTERM handling, server.close behavior, worker shutdown, load balancer deregistration, pod termination settings (terminationGracePeriodSeconds, preStop), and migration sequencing. Confirm how the platform sends shutdown: SIGTERM from Kubernetes, SIGQUIT from some supervisors — the handler must match the actual signal.

## Decision rules

| Concern | Rule |
|---|---|
| Readiness | Report ready only when the process can serve its intended capability. |
| Drain | Remove from traffic before terminating active work. |
| Shutdown | Stop new work, finish/recover bounded in-flight work, close dependencies, then exit before the termination deadline. |
| Compatibility | New binaries must tolerate old schema/contracts during rollout. |
| Health | Liveness should not fail merely because a recoverable dependency is temporarily degraded. |
| Workers | Queue consumers need explicit pause/drain/reclaim behavior. |

- Reserve headroom: drain budget must be strictly less than terminationGracePeriodSeconds (e.g. drain 20s, grace 30s) so close-out failures still log before SIGKILL.
- Readiness flips false on SIGTERM immediately; liveness stays true until the drain deadline (a draining process is healthy, merely not accepting).
- Exit code discipline: 0 after clean drain; non-zero when shutdown deadlines are missed (so the platform records it) — a process that always exits 0 hides drain failures.

## Implementation procedure

1. Define startup states and readiness dependencies.
2. Register signal handling once.
3. Stop accepting new work on shutdown.
4. Wait for bounded in-flight work.
5. Close HTTP servers, workers, pools, and telemetry exporters.
6. Force termination or surface failure after the deployment deadline.

**Reference example** — a complete lifecycle for an HTTP service with queue workers:

```ts
// lifecycle.ts — wire once at composition root
import { once } from "node:events";

export async function serve(app: FastifyInstance, queue: QueueWorker) {
  const state = { ready: false, draining: false };
  const inFlight = new Set<Promise<unknown>>();

  await app.ready();                                 // dependencies connected before listening
  await app.listen({ port, host });
  await queue.start();
  state.ready = true;                                 // readiness gate flips LAST

  const readiness = async () => !state.draining && dependencyProbeOk();
  registerProbe("/readyz", readiness);
  registerProbe("/healthz", async () => !shuttingDown());

  const shutdown = once(process, ["SIGTERM", "SIGINT"]);
  const stop = async () => {
    state.draining = true;                            // readiness false: LB deregisters now
    await queue.pause();                              // no new jobs
    const drainDeadline = Date.now() + 20_000;        // < terminationGracePeriod (30s)

    await Promise.race([
      app.close(),                                    // stops accepting, waits for requests
      sleepUntil(drainDeadline).then(() => {
        log.warn("drain deadline exceeded; forcing exit");
        process.exitCode = 1;
      }),
    ]);
    await queue.drain({ deadlineMs: Math.max(0, drainDeadline - Date.now()) });
    await closeDependencies([db.pool, telemetry.exporter]);   // pools/exporters flush last
    process.exit(process.exitCode ?? 0);
  };
  process.on("SIGTERM", () => void stop());
  process.on("SIGINT", () => void stop());
  await shutdown;
}

// In-flight tracking for handlers the server cannot wait for internally
app.addHook("onRequest", async (req, reply) => {
  const done = deferred();
  inFlight.add(done.promise);
  reply.raw.once("finish", () => { inFlight.delete(done.promise); done.resolve(); });
});
```

Kubernetes counterparts (the process contract must match):

```yaml
spec:
  terminationGracePeriodSeconds: 30     # > drain budget (20s) + close time
  containers:
    - name: api
      readinessProbe: { httpGet: { path: /readyz }, periodSeconds: 2 }
      livenessProbe:  { httpGet: { path: /healthz }, periodSeconds: 10 }
```

## Failure modes

- Process receives SIGTERM but immediately exits (bare `process.exit()` in a signal handler), dropping active work mid-response.
- Readiness stays true while shutdown is draining — the LB keeps routing to a closing server.
- Liveness depends on a flaky external dependency (auth provider blip → restart storm).
- New code requires a column not yet available to old replicas (contract: additive deploy first, contract-breaking later — expand/contract).
- SIGKILL at 30s because the drain awaited an unbounded job with no deadline.
- PreStop hook sleeps instead of deregistering readiness — sleep races the probe period.
- Workers ack jobs they never finished on shutdown (visibility timeout reclaims duplicates).
- Multiple signal handlers registered (library + app) closing the same pool twice.

## Verification

Test rolling deploys, long-running requests, active transactions, queue workers, dependency shutdown failures, and termination deadlines. Concretely: (a) SIGTERM with an in-flight 8s request → response completes, exit 0, readiness false within one probe period; (b) SIGTERM with a stuck job → process exits non-zero at the drain deadline, failure logged; (c) two versions running simultaneously (blue/green or rolling) → old and new schema/contract tolerated in both directions; (d) `kill -9` resilience: nothing the process lost (idempotent consumers, acked-only-on-complete) breaks permanently.
