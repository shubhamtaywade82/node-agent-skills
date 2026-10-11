// src/validation/schemas.js
// Demonstrates: node-runtime-validation (zod at the boundary), node-api-engineering
// (canonical error envelope), node-typescript-contracts (z.infer for type derivation).
import { z } from "zod";

// Order creation request body. Untrusted input validated exactly once, at the boundary.
// Lengths bounded for DoS prevention; unknown keys rejected (z.strict).
export const CreateOrderRequest = z
  .object({
    customer_id: z.string().uuid(),
    total_cents: z.number().int().nonnegative().max(100_00_00), // <= $100,000
    currency: z.string().length(3).regex(/^[A-Z]{3}$/),
    idempotency_key: z.string().min(1).max(200),
  })
  .strict();

// Inferred type for downstream code — types derived from the schema, not written by hand.
/** @typedef {z.infer<typeof CreateOrderRequest>} CreateOrderInput */

export const OrderStatus = z.enum(["pending", "confirmed", "cancelled"]);
/** @typedef {z.infer<typeof OrderStatus>} OrderStatusValue */

// Canonical error envelope. One shape, every handler uses it.
export const ErrorEnvelope = z.object({
  error: z.object({
    code: z.string(),
    message: z.string(),
    correlation_id: z.string().uuid(),
    details: z.array(z.string()).optional(),
  }),
});
