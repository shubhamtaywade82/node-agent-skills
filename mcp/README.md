# MCP server definitions

This pack ships an MCP server implementation (`lib/mcp-server.mjs`) that
exposes read-only skill routing over the JSON-RPC 2.0 MCP protocol. This
directory holds the server's capability policy — what the server is allowed
to expose — separate from the code that enforces it.

## `permissions.yml`

The capability policy for this pack's MCP server, following the cross-pack
policy schema (schema_version 1, as used by ruby-agent-skills'
`mcp/permissions.yml`). Rules:

- Tool names are classified explicitly, from a trusted `tools/list` response.
- Server-provided descriptions and annotations are never security policy.
- Fail-closed: an unclassified tool is denied; the policy below lists every
  tool this pack's server actually exposes (verified against
  `lib/mcp-server.mjs`).

This pack's server exposes exactly five read-only routing tools:
`get_skill`, `route_prompt`, `route_cross_pack`, `list_skills`,
`list_adapters`. All map to read-only capabilities; the policy therefore
grants them under a single `pack-read` profile and denies everything else.
A future write-capable tool (campaign runner, recording writer) must be
classified here BEFORE it is exposed by the server.
