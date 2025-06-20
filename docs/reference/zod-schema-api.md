# Zod Schema Generation API Reference

## `generateZodSchema`

**Signature:**
```typescript
function generateZodSchema(options: { oas: OpenAPIDocument }): { schemas: Record<string, z.ZodTypeAny> }
```

- **`options.oas`**: The OpenAPI 3.0+ document (as JS object)
- **Returns**: An object with a `schemas` property, mapping schema names to Zod schema objects

**Example:**
```typescript
import { generateZodSchema } from 'src/pipeline/stages/zod-generator';
import openApiDoc from './openapi.json';

const { schemas } = generateZodSchema({ oas: openApiDoc });
const user = schemas.User.parse({ id: '...', email: '...', age: 42 });
```

---

## `createBasicOpenAPISchema`

**Signature:**
```typescript
function createBasicOpenAPISchema(schemas?: Record<string, any>): TestOpenAPISchema
```

- **`schemas`**: Optional. Object mapping schema names to OpenAPI schema definitions.
- **Returns**: A minimal OpenAPI document for testing.

---

## Test Utilities

- **`createUserSchema()`**: Returns a sample user schema for testing.
- **`createComplexNestedSchema()`**: Returns a nested object schema.
- **`createValidationTestSchema()`**: Returns a schema with validation rules.
- **`generateValidTestData()` / `generateInvalidTestData()`**: Returns valid/invalid mock data.
- **`expectValidData(schema, data)`**: Asserts that data passes schema validation.
- **`expectInvalidData(schema, data)`**: Asserts that data fails schema validation.
- **`validatePerformance(fn, maxTimeMs)`**: Asserts that a function completes within a time budget.

---

## Notes

- All Zod schemas are generated using the latest supported features from OpenAPI 3.0+.
- For unsupported features or custom needs, extend the generated schemas in your own codebase.
- See the user guide for CLI/API usage and examples. 