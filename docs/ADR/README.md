# Architectural Decision Records

This directory contains Architectural Decision Records (ADRs) for the PEDAL project.

## What is an ADR?

An Architectural Decision Record is a document that captures an important architectural decision made along with its context, consequences, and rationale.

## ADR Index

| ADR | Title | Status | Date |
|-----|-------|--------|------|
| [ADR-001](./001-prd-to-typespec-transformation.md) | PRD to TypeSpec Transformation Strategy | Accepted | 2024-06-17 |
| [ADR-002](./002-user-story-format.md) | User Story Format | Accepted | 2024-06-17 |
| [ADR-003](./003-zod-generation-approach.md) | Zod Generation Approach | Proposed | 2024-06-18 |

## ADR Status

- **Proposed**: Decision is under consideration
- **Accepted**: Decision has been made and is being implemented
- **Deprecated**: Decision has been superseded by a newer ADR
- **Superseded**: Decision has been replaced by a newer ADR

## Creating a New ADR

To create a new ADR:

1. Copy the template: `cp template.md 004-your-decision.md`
2. Fill in the template with your decision details
3. Update this index
4. Submit a pull request for review

## Template

Use the following template for new ADRs:

```markdown
# ADR-XXX: [Title]

## Status

**Proposed** - YYYY-MM-DD

## Context

[Describe the context and problem statement]

## Decision Options

### Option A: [Description]
**Pros:**
- [Pro 1]
- [Pro 2]

**Cons:**
- [Con 1]
- [Con 2]

### Option B: [Description]
**Pros:**
- [Pro 1]
- [Pro 2]

**Cons:**
- [Con 1]
- [Con 2]

## Decision

**We will implement Option [X]**

### Rationale

[Explain the reasoning behind the decision]

## Consequences

### Positive
- [Positive consequence 1]
- [Positive consequence 2]

### Negative
- [Negative consequence 1]
- [Negative consequence 2]

### Mitigation
- [How to mitigate negative consequences]

## References

- [Reference 1]
- [Reference 2]
```
