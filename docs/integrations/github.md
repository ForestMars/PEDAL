# GitHub Integration

PEDAL integrates deeply with GitHub for seamless workflow automation.

## Features
- Webhook triggers for push, PR, and issue events
- PR automation: create, update, and merge pull requests
- GitHub Actions integration for bidirectional sync

## Setup
1. Generate a `GITHUB_TOKEN` with repo and workflow permissions
2. Add the token to PEDAL's config or environment variables
3. Configure webhooks in your GitHub repo to point to PEDAL's API endpoint

## Example Workflow
```yaml
workflows:
  - name: build-on-push
    triggers:
      - github_push
    steps:
      - run: pytest
```

---

> Next: [Jenkins Integration](jenkins.md) 