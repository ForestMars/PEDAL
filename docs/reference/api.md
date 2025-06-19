# API Reference

A complete reference for PEDAL's RESTful API.

## Endpoints
- `GET /workflows` — List all workflows
- `POST /workflows` — Create a new workflow
- `POST /workflows/{id}/run` — Trigger a workflow run
- `GET /status` — Get system status
- `GET /logs` — Retrieve logs

## Parameters
- Path, query, and body parameters for each endpoint
- See `/docs` (Swagger UI) for details

## Responses
- Standard HTTP status codes (200, 201, 400, 401, 403, 404, 500)
- JSON response bodies with data or error details

## Error Codes
- 400: Bad request (invalid input)
- 401: Unauthorized (invalid or missing token)
- 403: Forbidden (insufficient permissions)
- 404: Not found
- 500: Internal server error

---

> For configuration reference, see [Configuration Reference](config.md) 