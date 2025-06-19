# Quick Start Guide

Get up and running with PEDAL in minutes.

## 1. Install PEDAL
```bash
pip install pedal
```

## 2. Initialize a Sample Project
```bash
pedal init
```

## 3. Run a Sample Workflow
```bash
pedal run sample-workflow
```

## 4. Access the Web Interface
Open your browser to [http://localhost:8000](http://localhost:8000)

## 5. Test the API
```bash
curl -H "Authorization: Bearer <token>" http://localhost:8000/health
```

## 6. Trigger a GitHub CI/CD Pipeline (Example)
- Configure a GitHub webhook to call PEDAL on push events.
- PEDAL will automatically run the configured pipeline.

---

> For more details, see [Installation & Setup](installation/index.md) and [Using PEDAL](usage/cli.md). 