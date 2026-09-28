# Express Adapter

Framework-specific guidance for Express 5.x. Detect the exact installed version from package.json before applying this guide.

Use this adapter after node-http-engineering, node-runtime-validation, and the relevant API owner skill.

Source:
- https://expressjs.com/en/guide/using-middleware/
- https://expressjs.com/en/guide/error-handling/
- https://expressjs.com/en/guide/migrating-5/

Key rules:
- Express middleware is ordered request-pipeline code; middleware that neither ends the cycle nor calls next() can hang the request.
- In Express 5, rejected promises from route handlers/middleware are forwarded to error handling automatically.
- Error handlers use four parameters: err, req, res, next, and should be registered after routes/middleware.
- Delegate to the default error handler when headers were already sent.
- Preserve raw request bytes for webhook signatures before JSON parsing.
- Keep req/res objects at the transport boundary; map into application commands.
- Use the documented Express 5 route syntax when migrating from v4; do not copy v4 path-pattern assumptions.
