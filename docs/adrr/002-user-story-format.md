# ADR-002: User Story Format Standardization

## Status

Accepted

## Context

We need to standardize on a user story format for our PRDs to ensure consistent parsing and processing. The format needs to be:
- Clear and unambiguous
- Easy to parse programmatically
- Widely understood by stakeholders
- Compatible with our AST design

## Decision Options

### Option 1: Given/When/Then (Gherkin)
```
Given [context]
When [action]
Then [outcome]
```

#### Pros
- Clear cause-and-effect structure
- Widely used in BDD/TDD
- Good for test automation
- Clear separation of context, action, and outcome

#### Cons
- Can be verbose
- May not capture all types of requirements
- More complex to parse

### Option 2: As a/I want/So that (Connextra)
```
As a [role]
I want [feature]
So that [benefit]
```

#### Pros
- Focuses on user value
- Clear stakeholder perspective
- Concise format
- Easy to understand

#### Cons
- Less structured for automation
- May miss implementation details
- Harder to map to technical requirements

### Option 3: Hybrid Approach
Combine both formats, using:
- Connextra for high-level user stories
- Gherkin for detailed scenarios

#### Pros
- Captures both user value and implementation details
- Flexible for different levels of detail
- Comprehensive coverage

#### Cons
- More complex schema
- Requires more parsing logic
- May be overkill for simple requirements

## Decision

We will implement the Hybrid Approach (Option 3) because:

1. It provides both high-level user value (Connextra) and detailed behavior (Gherkin)
2. Maps well to our pipeline stages (PRD → Domain Model → API)
3. Supports both domain modeling and API generation needs
4. Provides clear structure for both stakeholders and developers

## Consequences

### Positive
- Standardized format for all PRDs
- Clear parsing rules
- Consistent AST representation
- Better stakeholder communication
- Supports both high-level and detailed requirements
- Better mapping to both domain model and API generation

### Negative
- Need to handle legacy formats
- May need to convert existing PRDs
- Additional validation rules
- More complex schema definition

## Implementation Notes

- Schema will support both Connextra and Gherkin formats
- Parser will handle both format types
- AST will represent both high-level stories and detailed scenarios
- Documentation will include examples of both formats
- Validation will ensure proper format usage

## References

- [Gherkin Syntax](https://cucumber.io/docs/gherkin/)
- [Connextra Format](https://www.mountaingoatsoftware.com/blog/writing-good-user-stories)
- [Issue #15](https://github.com/ForestMars/pedal/issues/15)
