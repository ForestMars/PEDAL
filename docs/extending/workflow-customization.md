# Workflow Customization

PEDAL supports advanced workflow customization for unique automation needs.

## DSL
- Define workflows in `pedal.yaml` or JSON
- Use triggers, steps, dependencies, and conditions

## Custom Triggers
- Event-based: GitHub push, Jenkins job, webhook
- Time-based: Scheduled (cron)
- Manual: Triggered by user action

## Example: Custom CI/CD Pipeline
```yaml
workflows:
  - name: custom-pipeline
    triggers:
      - github_push
      - schedule: "0 2 * * *"
    steps:
      - run: pytest
      - run: deploy.sh
```

---

> Next: [API Extensions](api-extensions.md) 