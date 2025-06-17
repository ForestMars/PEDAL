# PEDAL PRD Requirements

## Overview
PEDAL uses a hybrid user story format combining Connextra and Gherkin styles to capture both high-level requirements and detailed behaviors.

## Format

### High-Level Stories (Connextra)
```yaml
as_a: "project manager"
i_want: "to create new projects"
so_that: "I can organize my team's work"
```

### Detailed Scenarios (Gherkin)
```yaml
given: "I am logged in"
when: "I click the 'Create Project' button"
then: "a new project is created"
```

## Schema Versioning

### Development
- No versioning during development
- Schema changes can be made freely

### Production
- Semantic versioning (MAJOR.MINOR.PATCH)
  - MAJOR: Breaking changes to schema
  - MINOR: New features, backward compatible
  - PATCH: Bug fixes, backward compatible
- Version must be specified in PRD
- Validator will check version compatibility

## Validation

1. Install dependencies:
   ```bash
   npm install
   ```

2. Run validator:
   ```bash
   node scripts/validate-prd.js path/to/your.prd.yaml
   ```

## Example

See [examples/minimal.prd.yaml](../examples/minimal.prd.yaml) for a minimal example.
