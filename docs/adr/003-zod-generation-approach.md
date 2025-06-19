# ADR-003: Zod Generation Approach (Summary for Issue #17)

## Context
We evaluated two approaches for generating Zod schemas in the PEDAL pipeline: a file-based approach (static TypeScript file generation) and an object-based approach (dynamic, in-memory schema generation). Each has distinct advantages for different use cases.

**File-based approach (static TypeScript file generation):**
- Produces TypeScript files that can be directly imported into applications
- Enables static analysis and IDE auto-completion
- Integrates well with build pipelines and codebases that expect source files
- Facilitates sharing, versioning, and reviewing schemas as code
- Useful for scenarios where schemas are stable and known at build time

**Object-based approach (dynamic, in-memory schema generation):**
- Allows for runtime schema generation and validation
- Supports dynamic or user-driven schema creation
- Integrates easily with pipelines that require in-memory validation or transformation
- Reduces file management overhead (no need to write/read files)
- Useful for testing, prototyping, or environments where schemas may change frequently or be generated on the fly

This breakdown clarifies why a hybrid approach was chosen: it allows us to leverage the strengths of both methods, depending on the needs of the workflow or deployment scenario.

## Decision
We chose a **hybrid approach**: supporting both file-based and object-based Zod generation. This maximizes flexibility for both static code generation and dynamic runtime scenarios.

## Rationale
- File-based generation is ideal for producing TypeScript files that can be directly imported into applications and used for static analysis.
- Object-based generation is better for runtime validation, dynamic pipelines, and integration with other tools.
- Supporting both allows us to address a wider range of use cases without sacrificing developer experience or pipeline flexibility.

## Implementation Plan (High-Level)
- **File-based generator**: Reads OAS files and outputs TypeScript files with Zod schemas and types.
- **Object-based generator**: Accepts OAS or AST objects and returns Zod schema objects for use in code.
- **Shared core logic**: Both generators will use a common module for mapping OAS/AST to Zod, ensuring consistency.
- **Pipeline integration**: The pipeline will allow configuration to select the desired mode (file or object) via CLI flag or config.
- **Migration/transition**: The current object-based approach remains the default; file-based is introduced as an opt-in feature. Both will be documented and tested in CI.

This approach is detailed in the ADR file (`docs/adr/003-zod-generation-approach.md`) and will be kept up to date as implementation progresses. 