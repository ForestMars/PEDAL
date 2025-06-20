import { z } from 'zod';

/**
 * Test utilities for Zod schema generation testing
 */

// Basic OpenAPI schema structure for testing
export interface TestOpenAPISchema {
  openapi: string;
  info: {
    title: string;
    version: string;
    description: string;
  };
  paths: Record<string, any>;
  components: {
    schemas: Record<string, any>;
  };
}

/**
 * Creates a basic OpenAPI schema for testing
 */
export function createBasicOpenAPISchema(schemas: Record<string, any> = {}): TestOpenAPISchema {
  return {
    openapi: '3.0.0',
    info: {
      title: 'Test API',
      version: '1.0.0',
      description: 'Test API for Zod schema generation'
    },
    paths: {},
    components: {
      schemas
    }
  };
}

/**
 * Generates a simple user schema for testing
 */
export function createUserSchema() {
  return {
    type: 'object',
    properties: {
      id: { type: 'string', format: 'uuid' },
      name: { type: 'string', minLength: 1, maxLength: 100 },
      email: { type: 'string', format: 'email' },
      age: { type: 'integer', minimum: 0, maximum: 150 },
      isActive: { type: 'boolean' },
      createdAt: { type: 'string', format: 'date-time' }
    },
    required: ['id', 'name', 'email']
  };
}

/**
 * Generates a complex nested schema for testing
 */
export function createComplexNestedSchema() {
  return {
    type: 'object',
    properties: {
      user: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          profile: {
            type: 'object',
            properties: {
              firstName: { type: 'string' },
              lastName: { type: 'string' },
              addresses: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    street: { type: 'string' },
                    city: { type: 'string' },
                    country: { type: 'string' }
                  }
                },
                minItems: 1,
                maxItems: 5
              }
            }
          }
        }
      },
      metadata: {
        type: 'object',
        additionalProperties: { type: 'string' }
      }
    }
  };
}

/**
 * Generates a schema with validation rules for testing
 */
export function createValidationTestSchema() {
  return {
    type: 'object',
    properties: {
      username: { 
        type: 'string', 
        minLength: 3, 
        maxLength: 20,
        pattern: '^[a-zA-Z0-9_]+$'
      },
      password: { 
        type: 'string', 
        minLength: 8,
        pattern: '^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d).+$'
      },
      score: { 
        type: 'number', 
        minimum: 0,
        maximum: 100,
        multipleOf: 0.5
      },
      tags: {
        type: 'array',
        items: { type: 'string' },
        minItems: 1,
        maxItems: 10,
        uniqueItems: true
      },
      settings: {
        type: 'object',
        minProperties: 1,
        maxProperties: 5
      }
    },
    required: ['username', 'password']
  };
}

/**
 * Generates test data that should pass validation
 */
export function generateValidTestData() {
  return {
    user: {
      id: '123e4567-e89b-12d3-a456-426614174000',
      name: 'John Doe',
      email: 'john@example.com',
      age: 30,
      isActive: true,
      createdAt: '2023-01-01T00:00:00Z'
    },
    validation: {
      username: 'john_doe_123',
      password: 'Password123',
      score: 85.5,
      tags: ['tag1', 'tag2', 'tag3'],
      settings: {
        theme: 'dark',
        notifications: 'enabled'
      }
    }
  };
}

/**
 * Generates test data that should fail validation
 */
export function generateInvalidTestData() {
  return {
    user: {
      id: 'invalid-uuid',
      name: '',
      email: 'invalid-email',
      age: -5,
      isActive: 'not-boolean',
      createdAt: 'invalid-date'
    },
    validation: {
      username: 'jo', // too short
      password: 'weak', // too short, no uppercase/digit
      score: 150, // too high
      tags: ['tag1', 'tag1'], // duplicate
      settings: {} // no properties
    }
  };
}

/**
 * Validates that a Zod schema correctly accepts valid data
 */
export function expectValidData(schema: z.ZodType<any>, data: any) {
  expect(() => schema.parse(data)).not.toThrow();
}

/**
 * Validates that a Zod schema correctly rejects invalid data
 */
export function expectInvalidData(schema: z.ZodType<any>, data: any) {
  expect(() => schema.parse(data)).toThrow();
}

/**
 * Validates that a Zod schema produces the expected TypeScript type
 */
export function expectTypeInference<T>(schema: z.ZodType<T>, expectedType: T) {
  type InferredType = z.infer<typeof schema>;
  const _typeCheck: InferredType = expectedType;
  expect(_typeCheck).toBeDefined();
}

/**
 * Creates a performance test schema with many properties
 */
export function createLargeSchema(propertyCount: number = 100) {
  const properties: Record<string, any> = {};
  
  for (let i = 0; i < propertyCount; i++) {
    properties[`property${i}`] = {
      type: i % 4 === 0 ? 'string' : i % 4 === 1 ? 'number' : i % 4 === 2 ? 'boolean' : 'array',
      ...(i % 4 === 3 && { items: { type: 'string' } })
    };
  }
  
  return {
    type: 'object',
    properties
  };
}

/**
 * Measures the time it takes to generate a Zod schema
 */
export function measureSchemaGenerationTime(generator: () => any): number {
  const start = performance.now();
  generator();
  const end = performance.now();
  return end - start;
}

/**
 * Creates a schema with circular references for testing
 */
export function createCircularReferenceSchema() {
  return {
    type: 'object',
    properties: {
      name: { type: 'string' },
      parent: { $ref: '#/components/schemas/Node' },
      children: {
        type: 'array',
        items: { $ref: '#/components/schemas/Node' }
      }
    }
  };
}

/**
 * Creates enum schemas for testing
 */
export function createEnumSchemas() {
  return {
    Status: {
      enum: ['active', 'inactive', 'pending', 'deleted']
    },
    Role: {
      enum: ['admin', 'user', 'moderator', 'guest']
    },
    Priority: {
      enum: ['low', 'medium', 'high', 'critical']
    }
  };
}

/**
 * Creates union schemas for testing
 */
export function createUnionSchemas() {
  return {
    Response: {
      oneOf: [
        { type: 'string' },
        { type: 'number' },
        { type: 'boolean' }
      ]
    },
    Error: {
      anyOf: [
        { type: 'string' },
        {
          type: 'object',
          properties: {
            code: { type: 'string' },
            message: { type: 'string' }
          }
        }
      ]
    }
  };
}

/**
 * Creates intersection schemas for testing
 */
export function createIntersectionSchemas() {
  return {
    Person: {
      type: 'object',
      properties: {
        name: { type: 'string' },
        age: { type: 'number' }
      }
    },
    Employee: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        department: { type: 'string' }
      }
    },
    Manager: {
      allOf: [
        { $ref: '#/components/schemas/Person' },
        { $ref: '#/components/schemas/Employee' },
        {
          type: 'object',
          properties: {
            reports: {
              type: 'array',
              items: { type: 'string' }
            }
          }
        }
      ]
    }
  };
}

/**
 * Validates schema generation performance
 */
export function validatePerformance(generator: () => any, maxTimeMs: number = 100) {
  const time = measureSchemaGenerationTime(generator);
  expect(time).toBeLessThan(maxTimeMs);
}

/**
 * Creates a comprehensive test suite for a schema
 */
export function createSchemaTestSuite(
  schemaName: string,
  schema: any,
  validData: any,
  invalidData: any
) {
  return {
    name: schemaName,
    schema,
    validData,
    invalidData,
    testValid: (generatedSchema: z.ZodType<any>) => {
      expectValidData(generatedSchema, validData);
    },
    testInvalid: (generatedSchema: z.ZodType<any>) => {
      expectInvalidData(generatedSchema, invalidData);
    }
  };
} 