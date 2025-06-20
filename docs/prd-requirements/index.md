# Product Requirements Document (PRD) Requirements for PEDAL

To ensure PEDAL can successfully process your Product Requirements Document (PRD) and generate a production-ready backend, your PRD must meet the following minimum requirements. This guide is for product owners, business analysts, and anyone responsible for authoring or submitting PRDs to the PEDAL pipeline.

---

## Minimum PRD Requirements

A valid PRD for PEDAL must:

- **Be written in clear, structured Markdown** (plain text is accepted, but Markdown is preferred for clarity).
- **Define all core entities (models/objects)** with:
  - A unique name for each entity (e.g., `User`, `Order`)
  - A list of fields/properties for each entity, with:
    - Field name (e.g., `email`)
    - Field type (e.g., `string`, `integer`, `boolean`, `date`)
    - (Optional) Field constraints (e.g., required/optional, min/max, format)
- **Describe relationships between entities** (e.g., `User has many Orders`)
- **Specify key business rules or validation requirements** (e.g., "Email must be unique", "Order total must be positive")
- **Include at least one use case or user story** (e.g., "As a user, I can register with my email and password")

---

## PRD YAML Schema Reference

For the most precise and up-to-date requirements, you can view the target PRD YAML schema that PEDAL uses for validation:
- [schema/prd-schema.yaml](../../schema/prd-schema.yaml)

This schema defines the exact structure, required fields, and allowed values for a valid PRD. Product owners and technical writers should refer to this file to ensure their PRD will be accepted by the pipeline and validation script.

---

## Best Practices for Product Owners

- **Be explicit**: Ambiguity leads to errors. Clearly state what each entity and field means.
- **Use consistent naming**: Avoid synonyms or abbreviations unless defined.
- **List all required fields**: Mark which fields are required vs. optional.
- **Describe relationships**: Use phrases like "User has many Orders" or "Order belongs to User".
- **Include edge cases**: If there are business rules (e.g., "A user cannot have more than 5 active orders"), state them clearly.
- **Avoid unstructured prose**: PEDAL works best with lists, tables, and bullet points, not long paragraphs.

---

## PRD Validation Script

PEDAL includes a validation script to check your PRD before running the full pipeline. This script:

- **Checks for required structure**: Ensures all entities, fields, and relationships are defined.
- **Reports missing or ambiguous elements**: If a field type is missing or a relationship is unclear, you'll get a clear error message.
- **Suggests corrections**: Where possible, the script will suggest how to fix issues (e.g., "Field 'email' in 'User' is missing a type").

**How to use:**
```bash
node scripts/validate-prd.js --input path/to/your.prd.md
```
- The script will print a summary of any issues found, or "Validation passed" if your PRD is ready.

---

## Example PRD

For a reference PRD that meets all requirements, see:
- [examples/sample.prd](../../examples/sample.prd)

This example demonstrates the ideal structure, level of detail, and formatting for a PEDAL-compatible PRD.

---

If you have questions or need help preparing your PRD, see the FAQ or contact the PEDAL team for support. 