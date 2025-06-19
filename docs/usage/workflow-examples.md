# Workflow Examples

Explore common PEDAL workflow scenarios.

## CI/CD Pipeline
Automate build, test, and deploy for a Python web app.
```yaml
workflows:
  - name: build-test-deploy
    triggers:
      - github_push
    steps:
      - run: pip install -r requirements.txt
      - run: pytest
      - run: docker build -t myapp .
      - run: docker push myapp
```

## Microservice Orchestration
Coordinate builds and deploys for multiple services.

## Monorepo Setup
Manage builds for a monorepo with selective triggers.

## Scheduled Tasks
Run daily dependency scans or maintenance jobs.

---

> For more on integrations, see [Integrations](../integrations/index.md). 