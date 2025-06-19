# Custom Scripts

PEDAL allows you to extend workflows with custom scripts in Python, Bash, or JavaScript.

## Writing Scripts
- Scripts can be used as workflow steps
- Place scripts in a `scripts/` directory or reference external scripts

## Script Execution
- Run scripts via CLI: `pedal script run my_script.py`
- Use scripts in workflow YAML:
```yaml
steps:
  - run: python scripts/my_script.py
```

## Examples
- Dependency update script
- Custom Slack notification
- Automated deployment

---

> Next: [Plugin Development](plugins.md) 