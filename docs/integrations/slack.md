# Slack Integration

PEDAL can send workflow notifications and accept bot commands via Slack.

## Features
- Workflow status notifications to Slack channels
- Custom bot commands (e.g., `/pedal status`)
- Alerting for workflow failures or successes

## Setup
1. Create a Slack app and bot token
2. Add the token to PEDAL's config or environment variables
3. Configure notification steps in workflow YAML

## Example Notification Step
```yaml
steps:
  - notify:
      service: slack
      channel: "#devops"
      message: "Workflow {{ workflow.name }} completed."
```

---

> Next: [Custom Integrations](custom.md) 