# Command Line Interface (CLI)

PEDAL's CLI lets you manage workflows, check status, and configure integrations from your terminal.

## Overview
- Manage workflows and pipelines
- Configure integrations and settings
- View logs and workflow status

## Main Commands
- `pedal init` — Initialize a new PEDAL project
- `pedal run <workflow>` — Run a workflow
- `pedal status` — Show workflow and system status
- `pedal config` — Configure PEDAL settings
- `pedal logs` — View workflow and system logs

## Common Flags
- `--verbose` — Show detailed output
- `--dry-run` — Simulate actions without making changes
- `--force` — Force execution, bypassing some checks

## Examples
```bash
# Initialize a new project
pedal init

# Run a sample workflow
pedal run sample-workflow

# View logs
pedal logs --tail 100
```

---

> For web interface usage, see [Web Interface](web.md). 