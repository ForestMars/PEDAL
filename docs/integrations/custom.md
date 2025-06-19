# Custom Integrations

PEDAL is highly extensible, supporting custom integrations via webhooks, scripts, and REST API hooks.

## Webhooks
- Inbound: Trigger workflows from external events
- Outbound: Notify external systems of workflow events

## Scripts
- Run Python, Bash, or JavaScript scripts as workflow steps
- Example: Custom notification or deployment script

## REST API Hooks
- Add custom endpoints to PEDAL's API
- Integrate with any REST-compatible service

## Example: Custom GitHub Event Handler
```yaml
workflows:
  - name: custom-github-event
    triggers:
      - webhook: github_custom_event
    steps:
      - run: python scripts/handle_event.py
```

---

> For extending PEDAL, see [Extending PEDAL](../extending/scripts.md). 