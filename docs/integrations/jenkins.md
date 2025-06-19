# Jenkins Integration

PEDAL can integrate with Jenkins to trigger and manage CI/CD workflows.

## Features
- Webhook-driven workflow triggers from Jenkins
- Sync build status and logs
- Orchestrate multi-stage pipelines

## Setup
1. Configure Jenkins to send webhook events to PEDAL's API endpoint
2. Add Jenkins credentials to PEDAL's config if needed
3. Define workflows in PEDAL that respond to Jenkins events

## Example Workflow
```yaml
workflows:
  - name: jenkins-build
    triggers:
      - jenkins_job_success
    steps:
      - run: deploy.sh
```

---

> Next: [Cloud Integrations](cloud.md) 