# Advanced Usage

Explore advanced PEDAL features: custom scripts, integrations, scheduling, and notifications.

## Custom Scripts
- Add a `script` step in your workflow:
```yaml
steps:
  - script: ./scripts/my-script.sh
```

## Integrations
- Configure GitHub, Slack, or Jenkins in `pedal.yaml`:
```yaml
integrations:
  github:
    token: ${GITHUB_TOKEN}
```

## Scheduling Workflows
- Use the `schedule` trigger:
```yaml
triggers:
  - schedule: "0 2 * * *"
```

## Notifications
- Add a `notify` step:
```yaml
steps:
  - notify: slack
```

---

> Next: [Best Practices](../best-practices.md) 