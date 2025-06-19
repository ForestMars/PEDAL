# Configuration Reference

A detailed reference for PEDAL configuration options.

## Environment Variables
- `PEDAL_API_KEY`: API key for authentication
- `GITHUB_TOKEN`: For GitHub integration
- `DATABASE_URL`: Database connection string
- `LOG_LEVEL`: Logging verbosity

## pedal.yaml
- `workflows`: List of workflow definitions
- `integrations`: External service configs (GitHub, Slack, etc.)
- `auth`: Authentication settings
- `database`: Database configuration

## Example pedal.yaml
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
database:
  url: ${DATABASE_URL}
```

---

> For error codes, see [Error Codes](error-codes.md) 