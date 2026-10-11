// src/index.js
// Demonstrates: node-edge-runtime-foundations (Workers runtime, no Node fs/net,
// isolate lifecycle, cold start), node-http-engineering (transport boundary),
// node-runtime-validation (zod at boundary), node-async-concurrency (AbortSignal
// propagation), node-production-runtime (graceful shutdown via Web Standards),
// node-llm-streaming (SSE response with AbortSignal).
import { z } from "zod";

// ─── Env binding contract ─────────────────────────────────────────────────────
// Every env binding from wrangler.toml appears on the typed `env` object.
// Demonstrates: node-edge-runtime-foundations ("Map each binding env.X to its
// type. Write the typed Env interface and use it as the handler's env
// parameter type").
/**
 * @typedef {Object} Env
 * @property {DurableObjectNamespace} LEADER
 * @property {KVNamespace} KV
 * @property {EdgeConfigClient} FEATURE_FLAGS
 * @property {Ai} AI
 */

// ─── Validation schemas ──────────────────────────────────────────────────────
const SummarizeRequest = z.object({
  text: z.string().min(1).max(10_000), // bound input length (DoS guard)
  max_tokens: z.number().int().min(1).max(500).default(200),
}).strict();

// ─── Error envelope ───────────────────────────────────────────────────────────
function errorResponse(code, message, status = 400, correlationId = crypto.randomUUID()) {
  return new Response(
    JSON.stringify({ error: { code, message, correlation_id: correlationId } }),
    { status, headers: { "Content-Type": "application/json", "X-Correlation-Id": correlationId } },
  );
}

// ─── GET /healthz (process liveness) ─────────────────────────────────────────
export async function healthz() {
  return Response.json({ status: "ok" });
}

// ─── GET /readyz (dependency readiness) ──────────────────────────────────────
export async function readyz(env) {
  try {
    // Cheap liveness check on the KV binding.
    await env.KV.get("__readyz");
    return Response.json({ status: "ready" });
  } catch (err) {
    return new Response(
      JSON.stringify({ status: "not_ready", error: err.message }),
      { status: 503, headers: { "Content-Type": "application/json" } },
    );
  }
}

// ─── POST /summarize — streaming LLM tokens via SSE ──────────────────────────
// Demonstrates: node-llm-streaming (SSE transport, AbortSignal, mid-stream
// errors), node-async-concurrency (AbortSignal propagation), node-runtime-
// validation (zod at boundary).
export async function summarize(request, env, ctx) {
  const correlationId = request.headers.get("x-correlation-id") ?? crypto.randomUUID();
  const requestId = { correlationId, route: "POST /summarize" };

  // Parse + validate at the boundary.
  let body;
  try {
    body = await request.json();
  } catch {
    return errorResponse("BAD_REQUEST", "Invalid JSON.", 400, correlationId);
  }
  const parsed = SummarizeRequest.safeParse(body);
  if (!parsed.success) {
    return errorResponse(
      "BAD_REQUEST",
      "Invalid request.",
      400,
      correlationId,
    );
  }
  const { text, max_tokens } = parsed.data;

  // Build a ReadableStream that streams SSE tokens. AbortSignal from the
  // request propagates to the AI call — when the client disconnects, the
  // AI call stops and cost stops accruing.
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      try {
        // Use Workers AI on the edge. The AbortSignal cancels mid-stream.
        const aiResponse = await env.AI.run("@cf/meta/llama-3-8b-instruct", {
          prompt: `Summarize this in under 100 words:\n\n${text}`,
          max_tokens,
          stream: true,
          signal: request.signal,
        });

        // Workers AI returns an async iterator when stream:true.
        for await (const chunk of aiResponse) {
          if (request.signal.aborted) break;
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(chunk)}\n\n`));
        }
        controller.enqueue(encoder.encode("data: [DONE]\n\n"));
      } catch (err) {
        // Mid-stream errors must surface to the client.
        controller.enqueue(
          encoder.encode(
            `event: error\ndata: ${JSON.stringify({ message: err.message, correlation_id: correlationId })}\n\n`,
          ),
        );
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      "Connection": "keep-alive",
      "X-Correlation-Id": correlationId,
    },
  });
}

// ─── scheduled() — cron handler ───────────────────────────────────────────────
// Demonstrates: node-edge-runtime-foundations (scheduled handler, bounded work).
export async function scheduled(event, env, ctx) {
  // Cron runs every minute. Bound the work to the CPU limit (10ms free, 30s
  // paid). Offload heavy work to Queues.
  try {
    // Heartbeat: write to KV with a TTL of 60s.
    await env.KV.put("__cron_heartbeat", new Date().toISOString(), { expirationTtl: 60 });
  } catch (err) {
    console.error("scheduled tick failed", err.message);
  }
}

// ─── Durable Object for single-writer leader election ───────────────────────
// Demonstrates: node-distributed-locks (Durable Object as a single-writer
// coordination primitive), node-edge-runtime-foundations (DO migrations,
// client env.X.get(id).fetch(...)).
export class LeaderDO {
  constructor(state, env) {
    this.state = state;
    this.env = env;
    this.leader = null;
    this.leaseUntil = 0;
  }

  async fetch(request) {
    const url = new URL(request.url);
    if (url.pathname === "/acquire") {
      const now = Date.now();
      if (this.leader && now < this.leaseUntil) {
        return Response.json({ leader: this.leader, lease_until: this.leaseUntil, acquired: false });
      }
      const caller = request.headers.get("x-caller-id") ?? crypto.randomUUID();
      this.leader = caller;
      this.leaseUntil = now + 30_000; // 30s lease
      // Durable Objects persist state across requests via storage API.
      await this.state.storage.put({ leader: this.leader, leaseUntil: this.leaseUntil });
      return Response.json({ leader: this.leader, lease_until: this.leaseUntil, acquired: true });
    }
    if (url.pathname === "/release") {
      const caller = request.headers.get("x-caller-id");
      if (caller === this.leader) {
        this.leader = null;
        this.leaseUntil = 0;
        await this.state.storage.deleteAll();
        return Response.json({ released: true });
      }
      return Response.json({ released: false, error: "not the leader" }, { status: 409 });
    }
    return new Response("not found", { status: 404 });
  }
}

// ─── Default export — the Workers entry point ────────────────────────────────
export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    if (request.method === "GET" && url.pathname === "/healthz") return healthz();
    if (request.method === "GET" && url.pathname === "/readyz") return readyz(env);
    if (request.method === "POST" && url.pathname === "/summarize") return summarize(request, env, ctx);
    return errorResponse("NOT_FOUND", `No route for ${request.method} ${url.pathname}.`, 404);
  },
  scheduled,
};
