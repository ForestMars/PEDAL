# API Usage

PEDAL exposes a RESTful API for automation and integration.

## Overview
- Base URL: `http://localhost:8000`
- Interactive docs: `/docs` (FastAPI Swagger UI)

## Authentication
- API keys (default)
- JWT or OAuth2 (for GitHub integration)
- Pass token in `Authorization` header

## Endpoints
- `/workflows` — List, create, or manage workflows
- `/workflows/{id}/run` — Trigger a workflow run
- `/status` — Get system status
- `/logs` — Retrieve logs

## Rate Limits
- Configurable throttling for API requests

## Examples
```bash
# Trigger a workflow run
curl -H "Authorization: Bearer <token>" \
     -X POST http://localhost:8000/workflows/build-and-test/run

# Get workflow status
curl -H "Authorization: Bearer <token>" http://localhost:8000/status
```

---

> For workflow examples, see [Workflow Examples](workflow-examples.md). 