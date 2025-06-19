# CLI Reference

A complete reference for PEDAL's command-line interface.

## Commands
- `pedal init` — Initialize a new PEDAL project
- `pedal run <workflow>` — Run a workflow
- `pedal status` — Show workflow and system status
- `pedal config` — Configure PEDAL settings
- `pedal logs` — View workflow and system logs
- `pedal user` — Manage users
- `pedal script` — Run custom scripts

## Options and Flags
- `--help` — Show help for any command
- `--verbose` — Show detailed output
- `--dry-run` — Simulate actions
- `--force` — Force execution

## Examples
```bash
pedal init
pedal run build-test-deploy --verbose
pedal logs --tail 100
```

---

> For API reference, see [API Reference](api.md) 