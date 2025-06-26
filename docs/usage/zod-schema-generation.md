# Zod Schema Generation User Guide

## Overview

This guide explains how to use the Zod schema generation feature in PEDAL, including supported features, usage examples, and troubleshooting tips.

---

## Usage

### CLI

To generate Zod schemas from an OpenAPI or AST file:

```bash
node scripts/generate-zod.js --input path/to/openapi.yaml --output path/to/zod-schemas.ts
```

- `--input`: Path to your OpenAPI YAML/JSON or AST file
- `--output`: Path to write the generated Zod schemas

### API

You can also use the generator programmatically:

```typescript
import { generateZodSchema } from 'src/pipeline/stages/zod-generator';
import openApiDoc from './openapi.json';

const { schemas } = generateZodSchema({ oas: openApiDoc });
console.log(schemas.User.parse({ ... }));
```

---

## Supported Features

- **Type Mapping**: string, number, integer, boolean, array, object, enum, union (oneOf/anyOf), intersection (allOf)
- **Format Support**: uuid, email, uri, date, date-time
- **Validation Rules**: minLength, maxLength, pattern, minimum, maximum, exclusiveMinimum, exclusiveMaximum, multipleOf, minItems, maxItems, uniqueItems, minProperties, maxProperties
- **References**: `$ref` resolution for local schemas
- **Edge Cases**: Handles empty schemas, optional-only objects, invalid patterns

---

## Limitations

- **Circular References**: Not fully supported; will throw or skip
- **Polymorphism**: Discriminators and advanced polymorphic constructs are not supported
- **External $ref**: Only local references are supported
- **Custom Zod Refinements**: Only standard OpenAPI validation rules are mapped

---

## Example

**OpenAPI Input:**
```yaml
User:
  type: object
  properties:
    id:
      type: string
      format: uuid
    email:
      type: string
      format: email
    age:
      type: integer
      minimum: 0
  required: [id, email]
```

**Generated Zod Schema:**
```typescript
export const UserSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  age: z.number().int().gte(0).optional()
});
export type User = z.infer<typeof UserSchema>;
```

---

## FAQ

**Q: How do I add custom validation?**
A: Extend the generated schema with `.refine()` in your own code.

**Q: What if my OpenAPI uses unsupported features?**
A: The generator will skip or throw for unsupported constructs. See limitations above.

**Q: How do I run tests?**
A: See `src/pipeline/stages/__tests__/README.md` for test instructions.

**Q: How do I contribute?**
A: See CONTRIBUTING.md for guidelines.

---

## Schema Patterns & Best Practices

### Common Schema Patterns

#### Basic Types
```yaml
Simple:
  type: object
  properties:
    name: { type: string }
    age: { type: integer }
    isActive: { type: boolean }
```
```typescript
z.object({
  name: z.string(),
  age: z.number().int(),
  isActive: z.boolean()
})
```

#### Validation Rules
```yaml
Validated:
  type: object
  properties:
    username: { type: string, minLength: 3, maxLength: 20, pattern: '^[a-zA-Z0-9_]+$' }
    score: { type: number, minimum: 0, maximum: 100, multipleOf: 0.5 }
```
```typescript
z.object({
  username: z.string().min(3).max(20).regex(/^[a-zA-Z0-9_]+$/),
  score: z.number().gte(0).lte(100).refine(v => v % 0.5 === 0)
})
```

#### Required vs. Optional
```yaml
User:
  type: object
  properties:
    id: { type: string }
    email: { type: string }
    age: { type: integer }
  required: [id, email]
```
```typescript
z.object({
  id: z.string(),
  email: z.string(),
  age: z.number().int().optional()
})
```

#### Enums, Unions, Intersections
```yaml
Status:
  enum: [active, inactive, pending]
Response:
  oneOf:
    - type: string
    - type: number
Manager:
  allOf:
    - $ref: '#/components/schemas/Person'
    - $ref: '#/components/schemas/Employee'
```
```typescript
z.enum(['active', 'inactive', 'pending'])
z.union([z.string(), z.number()])
z.intersection(PersonSchema, EmployeeSchema)
```

#### Not/Inverse Validation
```yaml
NonEmptyString:
  type: string
  not:
    type: string
    maxLength: 0
```
```typescript
z.string().refine(val => val.length > 0, { message: 'Must not be empty' })
```

### Advanced & Real-World Patterns

#### Nested Objects & Arrays
```yaml
Order:
  type: object
  properties:
    items:
      type: array
      items:
        type: object
        properties:
          sku: { type: string }
          qty: { type: integer, minimum: 1 }
      minItems: 1
```
```typescript
z.object({
  items: z.array(z.object({
    sku: z.string(),
    qty: z.number().int().gte(1)
  })).min(1)
})
```

#### Cross-Referenced Schemas
```yaml
UserProfile:
  type: object
  properties:
    user: { $ref: '#/components/schemas/User' }
    preferences:
      type: object
      properties:
        theme: { type: string, enum: [light, dark] }
        notifications: { type: boolean }
```

#### Format-Specific Strings
```yaml
Email:
  type: string
  format: email
```
```typescript
z.string().email()
```

### Best Practices
- Prefer explicit required/optional fields for clarity.
- Use OpenAPI validation keywords to maximize Zod's static validation.
- For custom logic, extend generated schemas with `.refine()` in your codebase.
- Avoid circular references and unsupported polymorphism.
- Keep schemas modular and reusable.

### Usage Examples
- See the [test suite](../../src/pipeline/stages/__tests__/zod-generator.test.ts) for real-world and edge-case examples.
- Use generated Zod schemas for API validation, form validation, and data transformation. 