# Cloud Integrations

PEDAL supports deployment and integration with major cloud providers.

## Supported Providers
- **AWS:** S3 (artifacts), ECS/EKS (deploy), CloudWatch (logs)
- **Azure:** App Services, AKS, Blob Storage
- **GCP:** Cloud Run, GKE, Stackdriver

## Deployment Targets
- Deploy directly to cloud services from PEDAL workflows
- Use cloud credentials in PEDAL config or environment variables

## Setup Notes
- Store cloud credentials securely (e.g., environment variables, secrets manager)
- Configure deployment steps in workflow YAML

---

> Next: [Slack Integration](slack.md) 