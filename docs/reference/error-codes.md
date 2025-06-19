# Error Codes

A reference for PEDAL error codes and messages.

## CLI Errors
- Exit code 0: Success
- Exit code 1: General error
- Exit code 2: Invalid command or arguments
- Exit code 3: Workflow not found
- Exit code 4: Integration failure

## API Errors
- 400: Bad request (invalid input)
- 401: Unauthorized (invalid or missing token)
- 403: Forbidden (insufficient permissions)
- 404: Not found
- 500: Internal server error

## Messages
- Error messages are printed to stderr and logged
- API errors return JSON with `error` and `message` fields

---

> For workflow syntax, see [Workflow Syntax](workflow-syntax.md) 