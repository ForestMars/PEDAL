# Configuration

PEDAL can be configured via environment variables and a YAML config file.

## Environment Variables
- `PEDAL_API_KEY`: API key for authentication
- `GITHUB_TOKEN`: For GitHub integration
- `DATABASE_URL`: Database connection string (e.g., SQLite, PostgreSQL)
- `LOG_LEVEL`: Set logging verbosity (e.g., INFO, DEBUG)

## Config File: `pedal.yaml`
- Define workflows, integrations, and authentication settings
- Example:
```yaml
workflows:
  - name: build-and-test
    triggers:
      - github_push
    steps:
      - run: pytest
integrations:
  github:
    token: ${GITHUB_TOKEN}
auth:
  method: api_key
```

## Database Setup
- **Default:** SQLite (no setup required)
- **Production:** PostgreSQL or MySQL (set `DATABASE_URL`)

## Authentication
- API keys (default)
- JWT or OAuth2 (for GitHub login and integrations)

---

> For advanced setup, see [Advanced Setup](advanced-setup.md). 