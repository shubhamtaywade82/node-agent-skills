# Wave 7 — data architecture and agent execution

Adds 19 core skills covering advanced data architecture, durable workflow patterns, and AI coding-agent execution discipline. Adds 10 concrete adapters for MongoDB/Mongoose, TypeORM, Sequelize, MySQL2, ioredis, Temporal, AWS EventBridge, Azure Blob Storage, and Google Cloud Storage.

## Guardrails

- RED contract precedes implementation.
- Core skills remain framework-neutral.
- Adapters require exact repository/version detection.
- Advanced data patterns are opt-in when complexity justifies them.
- Agent workflow skills optimize evidence, scope, validation, and merge safety.
- Existing validators are never weakened to obtain green CI.

## Verification

npm test
npm run validate
