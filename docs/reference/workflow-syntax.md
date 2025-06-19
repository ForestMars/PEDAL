# Workflow Syntax

Define PEDAL workflows using YAML or JSON.

## pedal.yaml Schema
- `name`: Workflow name
- `triggers`: Events that start the workflow (e.g., github_push, schedule)
- `steps`: List of actions to perform
- `dependencies`: Specify step dependencies (optional)

## Triggers
- `github_push`: GitHub push event
- `schedule`: Cron schedule (e.g., "0 2 * * *")
- `manual`: User-initiated
- `webhook`: External event

## Steps
- `run`: Execute a command or script
- `notify`: Send a notification (e.g., Slack)
- `deploy`: Deploy to a target environment

## Dependencies
- Use `depends_on` to specify step order

## JSON Alternative
- Workflows can also be defined in JSON format

---

> For glossary, see [Glossary](glossary.md) 