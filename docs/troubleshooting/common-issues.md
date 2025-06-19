# Common Issues

Find solutions to frequent problems encountered when using PEDAL.

## Installation
- **Missing dependencies:** Install required Python packages and system tools
- **Docker failures:** Check Docker daemon status and permissions

## CLI
- **Command errors:** Check command syntax and flags
- **Invalid configs:** Validate `pedal.yaml` and environment variables

## API
- **401/403 errors:** Check API key or token, permissions, and authentication method
- **500 server errors:** Review logs for stack traces and error details

## Integrations
- **GitHub webhook failures:** Verify webhook URL, secret, and permissions
- **Jenkins timeouts:** Check network connectivity and job status

## Solutions
- Restart PEDAL service after config changes
- Use `pedal --debug` for verbose output
- Consult logs for detailed error messages

---

> For advanced diagnostics, see [Debugging](debugging.md) 