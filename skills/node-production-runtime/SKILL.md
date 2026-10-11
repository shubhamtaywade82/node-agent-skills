---
name: node-production-runtime
description: Use when designing or changing Node.js production runtime: graceful shutdown, readiness/liveness, Docker, Kubernetes, signal handling, or process supervision.
---

# Node Production Runtime

## Purpose

A Node process in production is supervised, signal-driven, and observable. Startup, readiness, liveness, and shutdown are explicit lifecycle phases. Skipping any phase causes rolling-deploy failures, alert storms, and data loss.

## Activate when

- Adding or changing graceful shutdown logic.
- Adding or changing readiness/liveness probes.
- Containerizing a Node backend (Dockerfile, BuildKit, multi-stage).
- Deploying to Kubernetes, AWS ECS, GCP Cloud Run, or Fly Machines.
- Changing signal handling (SIGTERM, SIGINT, SIGHUP).
- Adding process supervision (PM2, systemd, Kubernetes, serverless wrappers).

## Repository inspection

1. Dockerfile — read the base image (`node:24-alpine`, `node:24-slim`, `gcr.io/distroless/nodejs22`), the user (`USER node`), the entrypoint, and the layers.
2. K8s manifest — find `livenessProbe`, `readinessProbe`, `lifecycle.preStop`, `terminationGracePeriodSeconds`, `resources.limits`.
3. Signal handling — grep for `SIGTERM`, `SIGINT`, `SIGHUP`, `process.on("beforeExit"`, `process.on("exit"`.
4. HTTP server — grep for `server.close(`, `server.listen(`, `server.setTimeout(`. Find the close sequence.
5. Pool/client close — grep for `pool.end(`, `client.quit(`, `pool.close(`. Find where DB/Redis clients close.
6. Health endpoints — grep for `/healthz`, `/readyz`, `/livez`. Read what they observe.
7. Process manager — read `pm2.config.js`, `systemd` unit, or the serverless wrapper (e.g., Lambda handler).

## Decision rules

| Concern | Rule |
|---|---|
| Graceful shutdown | SIGTERM → stop accepting new connections → drain in-flight → close pools → flush logs → exit ≤ grace period (default 30s on K8s). |
| Liveness | `/healthz` or `/livez` returns 200 if the process is running. Does not check dependencies. Failure → restart. |
| Readiness | `/readyz` returns 200 only when the process can serve (DB reachable, queue reachable, downstream reachable). Failure → no traffic. |
| PreStop hook | K8s: `sleep 5` before SIGTERM to let the load balancer deregister. |
| terminationGracePeriodSeconds | ≥ shutdown duration. K8s default 30s. If your shutdown takes 60s, set 60s. |
| Dockerfile | Multi-stage build. Non-root user. Minimal base. `.dockerignore` excludes `node_modules`, `.git`, `dist`. |
| Image size | < 200 MB for `node:24-slim` + production deps. Use `distroless` for smaller. |
| Resource limits | K8s: set CPU and memory `requests` and `limits`. Memory limit < the process `--max-old-space-size` to surface OOM as a crash, not silent slowdown. |
| Single process per container | Do not run supervisor + Node in one container. K8s is the supervisor. |
| Logs to stdout/stderr | Never to local files. The platform collects them. |
| Serverless cold start | Bound to the platform's timeout (Lambda 15min, Cloud Run 60min). Lazy-load dependencies. |
| Worker threads | Workers must terminate on parent shutdown. Otherwise the process hangs. |
| Uncaught exceptions | Log + exit. The supervisor restarts. Do not continue. |

## Implementation procedure

1. Identify the supervision platform (Docker + K8s, ECS, Cloud Run, Lambda, PM2, systemd). Read its constraints (grace period, probe path, resource model).
2. Implement the signal handler: SIGTERM triggers the shutdown sequence. SIGINT triggers the same. SIGHUP reloads config if applicable.
3. Implement the shutdown sequence: (a) mark not-ready, (b) stop accepting new HTTP connections, (c) drain in-flight requests with a deadline, (d) close DB pools/Redis clients/queue consumers, (e) flush logs, (f) exit with code 0 (or 130/143 if the supervisor expects signal codes).
4. Implement `/healthz` (process running) and `/readyz` (dependencies reachable). Wire them to K8s probes.
5. Write the Dockerfile: multi-stage, non-root, minimal base, `.dockerignore` configured.
6. Write the K8s manifest: `livenessProbe` to `/healthz`, `readinessProbe` to `/readyz`, `preStop: sleep 5`, `terminationGracePeriodSeconds` ≥ shutdown duration, resource requests and limits.
7. Add a lifecycle test: start the process, hit `/readyz`, send SIGTERM, confirm exit within grace period.

## Failure modes

- No SIGTERM handler → process exits with 143, K8s sees a crash, restarts, but in-flight requests are dropped.
- `/readyz` checks the DB with a slow query → readiness times out, pod marked unready, no traffic.
- `terminationGracePeriodSeconds` < shutdown duration → K8s sends SIGKILL mid-shutdown, data loss.
- PreStop hook missing → load balancer still sends traffic to the dying pod, 5xxs for clients.
- Dockerfile runs as root → container escape risk.
- Image 1GB → slow pull, slow cold start.
- Memory limit 512MB, `--max-old-space-size` 2048 → silent swap, then OOM killed with no warning.
- Multiple Node processes in one container → K8s cannot restart one without restarting the pod.
- Logs to `/var/log/app.log` → invisible to the platform's log aggregator.
- Uncaught exception handled by continuing → process is in a broken state, all subsequent requests are wrong.
- Worker threads not closed on shutdown → process hangs, K8s SIGKILLs, in-flight work lost.

## Verification

- Build the Docker image; confirm size (`docker images`) and that the user is non-root (`docker run --rm <image> id -u`).
- Run the container locally; hit `/healthz` and `/readyz`; confirm 200s.
- Send `docker stop` (sends SIGTERM, waits 10s, SIGKILL); confirm the process exits cleanly within the grace period.
- Run the K8s manifest in a local cluster (kind, k3d); simulate a rolling deploy; confirm zero 5xx responses to clients.
- Run a load test during a rolling deploy; confirm the error rate stays within SLO.
- Source references: https://nodejs.org/api/process.html, https://kubernetes.io/docs/concepts/configuration/liveness-readiness-startup-probes/, https://docs.docker.com/build/building/best-practices/, https://cloud.google.com/run/docs/container-contract, https://docs.aws.amazon.com/lambda/latest/dg/runtimes-custom.html, https://github.com/GoogleContainerTools/distroless.
