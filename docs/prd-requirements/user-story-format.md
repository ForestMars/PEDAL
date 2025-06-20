# Hybrid User Story Format: Connextra + Gherkin

PEDAL requires user stories in a hybrid format that combines the clarity of Connextra with the structure of Gherkin. This ensures that user stories are both human-readable and machine-parseable, enabling deterministic pipeline processing and accurate API generation.

---

## Why a Hybrid Format?

- **Connextra** provides context: role, goal, and benefit ("As a [role], I want [feature], so that [benefit]").
- **Gherkin** provides structure for behavior: Given/When/Then steps for scenarios.
- **Hybrid** ensures every story is actionable, testable, and unambiguous for both humans and the PEDAL parser.

---

## Required Structure

Each user story must include:

1. **Connextra Statement** (context):
   - `As a [role], I want [feature], so that [benefit].`
2. **Gherkin Scenario** (behavior):
   - `Scenario: [short description]`
   - `Given [initial context]`
   - `When [action/event]`
   - `Then [expected outcome]`

**All four Gherkin lines (Scenario, Given, When, Then) are required for each story.**

---

## Canonical Example

```
As a registered user, I want to reset my password, so that I can regain access if I forget it.

Scenario: Successful password reset
  Given I am on the password reset page
  And I have entered my registered email address
  When I submit the password reset form
  Then I receive an email with a reset link
  And my password is updated when I follow the link
```

- **Connextra:** "As a registered user, I want to reset my password, so that I can regain access if I forget it."
- **Gherkin:** Scenario, Given, When, Then (with optional "And" for additional steps)

---

## Mapping to PEDAL Pipeline

- **Role/Feature/Benefit**: Used to infer the entity, action, and business value.
- **Scenario/Given/When/Then**: Used to generate API endpoints, determine required HTTP verbs, and define validation logic.
- **Each user story must be specific enough** for PEDAL to infer:
  - The entity/entities involved
  - The action (CRUD or custom)
  - The expected input/output
  - The business rules and validation

---

## Common Pitfalls

- **Missing Connextra or Gherkin parts**: Both are required for every story.
- **Vague actions**: "Manage my account" is too broad. Use specific actions like "reset my password" or "update my email address."
- **Unclear outcomes**: The "Then" step must describe a concrete, testable result.
- **No entity mapping**: Make sure the story clearly references the relevant entity (e.g., User, Order).
- **Long prose**: Avoid paragraphs; use the structured format above.

---

## More Examples

**Good:**
```
As an admin, I want to deactivate a user, so that I can control access.

Scenario: Deactivate user
  Given I am logged in as an admin
  And a user exists with status 'active'
  When I deactivate the user
  Then the user's status is set to 'inactive'
  And the user cannot log in
```

**Bad:**
```
As a user, I want to manage my account.
```
*(Missing Gherkin, too vague, not actionable)*

---

## Reference

- See the [PRD YAML schema](../schema/prd-schema.yaml) for the exact structure PEDAL expects.
- See the [example PRD](../examples/sample.prd) for real-world usage.

If you have questions or need help writing hybrid user stories, contact the PEDAL team or see the FAQ. 