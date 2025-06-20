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