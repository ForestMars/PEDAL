# ADR-003: Zod Generation Approach

## Status

**Proposed** - 2024-06-18

## Context

We need to generate Zod schemas as part of the PEDAL pipeline. We have two different approaches available:

1. **File-based approach** (`oas-to-zod.ts` from DrZONST repo):
   - Takes input from a file (OAS specification)
   - Writes output to a file (`zodSchemas.ts`)
   - Generates complete TypeScript files with imports and exports
   - Suitable for static code generation

2. **Object-based approach** (`zod-generator.ts`):
   - Takes input as a parameter (AST or OAS object)
   - Returns schemas as JavaScript objects
   - More flexible for runtime generation
   - Suitable for dynamic schema generation

## Decision Options

### Option A: File-based Generation (DrZONST approach)
**Pros:**
- Generates complete, standalone TypeScript files
- Includes proper imports (`import { z } from 'zod'`)
- Exports both schemas and inferred types
- Files can be directly imported and used in applications
- Follows established patterns from DrZONST repository
- Better for static analysis and IDE support

**Cons:**
- Less flexible for runtime scenarios
- Requires file I/O operations
- Harder to integrate into dynamic pipelines
- Generated files need to be managed (cleanup, versioning)

### Option B: Object-based Generation (Current approach)
**Pros:**
- More flexible and composable
- Can be used in both static and dynamic scenarios
- Easier to integrate into existing pipelines
- No file management overhead
- Can be used for runtime validation

**Cons:**
- Requires additional step to convert objects to files
- Less convenient for direct import into applications
- May need additional tooling for file generation

### Option C: Hybrid Approach
**Pros:**
- Supports both use cases
- File-based for static generation
- Object-based for dynamic/runtime scenarios
- Maximum flexibility

**Cons:**
- More complex implementation
- Two different APIs to maintain
- Potential for inconsistency between approaches

## Decision

**We will implement Option C: Hybrid Approach**

### Rationale

The hybrid approach provides the best of both worlds:

1. **File-based generation** for static scenarios where we want to generate complete TypeScript files that can be imported directly into applications
2. **Object-based generation** for dynamic scenarios where we need runtime flexibility or integration with other tools

### Implementation Plan

1. **Keep current object-based approach** (`generateZodSchema()` in `prd-parser.ts`)
2. **Add file-based generation** using DrZONST approach:
   - Create `src/pipeline/zod/oas-to-zod.ts` (adapted from DrZONST)
   - Create `src/pipeline/zod/zod-generator.ts` (object-based)
3. **Update scripts**:
   - `generate-zod` - uses object-based approach (current)
   - `generate-zod-files` - uses file-based approach (new)
4. **Update pipeline** to use file-based generation for final output

### File Structure

```
src/pipeline/zod/
├── oas-to-zod.ts          # File-based generation (DrZONST approach)
├── zod-generator.ts       # Object-based generation (current approach)
└── index.ts              # Exports both approaches
```

### Usage Examples

```typescript
// Object-based (current)
const zodSchemas = generateZodSchema(ast);
const validationResult = zodSchemas.UserSchema.parse(userData);

// File-based (new)
await generateZodFiles(oasPath, outputDir);
// Generates: artifacts/zod/schemas.ts
// Usage: import { UserSchema } from './artifacts/zod/schemas';
```

## Consequences

### Positive
- Maximum flexibility for different use cases
- Maintains compatibility with existing pipeline
- Provides both static and dynamic generation capabilities
- Follows established patterns from DrZONST

### Negative
- Increased complexity in the codebase
- Need to maintain two different generation approaches
- Potential for drift between the two approaches

### Mitigation
- Clear separation of concerns between the two approaches
- Comprehensive testing for both approaches
- Documentation clearly explaining when to use each approach
- Regular review to ensure consistency

## References

- [DrZONST Repository](https://github.com/example/drzonst) - Source of `oas-to-zod.ts`
- [Current Zod Generation Implementation](./src/pipeline/typespec/prd-parser.ts)
- [ADR-001: PRD to TypeSpec Transformation Strategy](./001-prd-to-typespec-transformation.md)
- [ADR-002: User Story Format](./002-user-story-format.md) 