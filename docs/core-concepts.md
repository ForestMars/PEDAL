# Core Concepts

PEDAL automates the full product engineering lifecycle. Understanding its core concepts will help you get the most out of the platform.

## Lifecycle Stages
- **Plan**: Define requirements, tasks, and workflows.
- **Code**: Scaffold projects, integrate with version control, enforce code quality.
- **Build**: Automate builds, manage artifacts.
- **Test**: Run unit, integration, and end-to-end tests.
- **Deploy**: Deploy to cloud, on-prem, or hybrid environments.
- **Monitor**: Track metrics, logs, and workflow health.
- **Maintain**: Update dependencies, clean up resources.

## Key Terminology
- **Workflow**: A sequence of automated steps (DAG) for a product lifecycle stage.
- **Pipeline**: A set of connected workflows.
- **Trigger**: An event that starts a workflow (e.g., GitHub push).
- **Integration**: Connection to external tools (e.g., GitHub, Jenkins, Slack).
- **Artifact**: Output of a build or test (e.g., Docker image).

## PEDAL Architecture

PEDAL follows a modular, service-oriented architecture:

- **CLI**: Command-line interface for managing workflows and interacting with the platform.
- **API**: RESTful API for automation and integration with external systems.
- **Web Interface**: Dashboard for monitoring and managing workflows visually.
- **Backend**: FastAPI server handling orchestration, integrations, and business logic.
- **Database**: Stores workflow state, metadata, and execution history.
- **Pipeline Engine**: Core orchestration engine that executes workflows and manages dependencies.
- **Integration Layer**: Handles connections to external services (GitHub, Slack, etc.).

The architecture is designed for scalability, with clear separation of concerns and extensible plugin support.

---

> Next: [Quick Start](quick-start.md) 