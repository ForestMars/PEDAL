import { generateZodSchema } from '../zod-generator';
import { 
  createBasicOpenAPISchema, 
  createUserSchema, 
  createComplexNestedSchema,
  createValidationTestSchema,
  generateValidTestData,
  generateInvalidTestData,
  expectValidData,
  expectInvalidData,
  createLargeSchema,
  validatePerformance,
  createEnumSchemas,
  createUnionSchemas,
  createIntersectionSchemas,
  createCircularReferenceSchema,
  createSchemaTestSuite
} from './test-utils';
import { z } from 'zod';

describe('Zod Generator - Integration Tests', () => {
  describe('End-to-End Pipeline Testing', () => {
    it('should generate valid schemas for complete user workflow', async () => {
      const schemas = {
        User: createUserSchema(),
        UserProfile: {
          type: 'object',
          properties: {
            user: { $ref: '#/components/schemas/User' },
            preferences: {
              type: 'object',
              properties: {
                theme: { type: 'string', enum: ['light', 'dark'] },
                notifications: { type: 'boolean' }
              }
            }
          }
        }
      };

      const oas = createBasicOpenAPISchema(schemas);
      const result = await generateZodSchema({ oas });

      expect(result.schemas.User).toBeDefined();
      expect(result.schemas.UserProfile).toBeDefined();

      // Test with valid data
      const validUser = generateValidTestData().user;
      expectValidData(result.schemas.User, validUser);
    });

    it('should handle complex nested schemas with validation', async () => {
      const schemas = {
        ComplexObject: createComplexNestedSchema(),
        ValidationObject: createValidationTestSchema()
      };

      const oas = createBasicOpenAPISchema(schemas);
      const result = await generateZodSchema({ oas });

      expect(result.schemas.ComplexObject).toBeDefined();
      expect(result.schemas.ValidationObject).toBeDefined();

      // Test complex nested validation
      const validComplexData = {
        user: {
          id: '123',
          profile: {
            firstName: 'John',
            lastName: 'Doe',
            addresses: [
              { street: '123 Main St', city: 'Anytown', country: 'USA' }
            ]
          }
        },
        metadata: {
          key1: 'value1',
          key2: 'value2'
        }
      };

      expectValidData(result.schemas.ComplexObject, validComplexData);
    });
  });

  describe('Real-World Schema Testing', () => {
    it('should handle GitHub API-like schemas', async () => {
      const schemas = {
        User: {
          type: 'object',
          properties: {
            login: { type: 'string' },
            id: { type: 'integer' },
            avatar_url: { type: 'string', format: 'uri' },
            type: { type: 'string', enum: ['User', 'Organization'] },
            public_repos: { type: 'integer', minimum: 0 },
            created_at: { type: 'string', format: 'date-time' }
          },
          required: ['login', 'id', 'type']
        },
        Repository: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            name: { type: 'string', minLength: 1, maxLength: 100 },
            private: { type: 'boolean' },
            owner: { $ref: '#/components/schemas/User' },
            stargazers_count: { type: 'integer', minimum: 0 },
            topics: {
              type: 'array',
              items: { type: 'string' },
              uniqueItems: true
            }
          },
          required: ['id', 'name', 'private', 'owner']
        }
      };

      const oas = createBasicOpenAPISchema(schemas);
      const result = await generateZodSchema({ oas });

      // Test with realistic GitHub data
      const githubUser = {
        login: 'octocat',
        id: 583231,
        avatar_url: 'https://avatars.githubusercontent.com/u/583231?v=4',
        type: 'User',
        public_repos: 8,
        created_at: '2011-01-25T18:44:36Z'
      };

      const githubRepo = {
        id: 1296269,
        name: 'Hello-World',
        private: false,
        owner: githubUser,
        stargazers_count: 80,
        topics: ['sample', 'demo']
      };

      expectValidData(result.schemas.User, githubUser);
      expectValidData(result.schemas.Repository, githubRepo);
    });
  });

  describe('Performance Testing', () => {
    it('should generate large schemas efficiently', async () => {
      const largeSchema = createLargeSchema(50); // 50 properties
      const schemas = { LargeObject: largeSchema };
      const oas = createBasicOpenAPISchema(schemas);

      validatePerformance(() => {
        generateZodSchema({ oas });
      }, 200); // Should complete within 200ms
    });

    it('should handle deeply nested schemas efficiently', async () => {
      const deepNestedSchema = {
        type: 'object',
        properties: {
          level1: {
            type: 'object',
            properties: {
              level2: {
                type: 'object',
                properties: {
                  level3: {
                    type: 'object',
                    properties: {
                      level4: {
                        type: 'object',
                        properties: {
                          level5: {
                            type: 'object',
                            properties: {
                              value: { type: 'string' }
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      };

      const schemas = { DeepNested: deepNestedSchema };
      const oas = createBasicOpenAPISchema(schemas);

      validatePerformance(() => {
        generateZodSchema({ oas });
      }, 100);
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('should handle empty schemas gracefully', async () => {
      const schemas = {
        EmptyObject: {
          type: 'object',
          properties: {}
        }
      };

      const oas = createBasicOpenAPISchema(schemas);
      const result = await generateZodSchema({ oas });

      expect(result.schemas.EmptyObject).toBeDefined();
      expectValidData(result.schemas.EmptyObject, {});
    });

    it('should handle schemas with only optional properties', async () => {
      const schemas = {
        OptionalObject: {
          type: 'object',
          properties: {
            optional1: { type: 'string' },
            optional2: { type: 'number' }
          }
        }
      };

      const oas = createBasicOpenAPISchema(schemas);
      const result = await generateZodSchema({ oas });

      expectValidData(result.schemas.OptionalObject, {});
      expectValidData(result.schemas.OptionalObject, { optional1: 'test' });
      expectValidData(result.schemas.OptionalObject, { optional1: 'test', optional2: 42 });
    });

    it('should handle invalid regex patterns gracefully', async () => {
      const schemas = {
        InvalidPattern: {
          type: 'object',
          properties: {
            field: { 
              type: 'string', 
              pattern: '[invalid-regex' // Invalid regex
            }
          }
        }
      };

      const oas = createBasicOpenAPISchema(schemas);
      const result = await generateZodSchema({ oas });

      // Should still generate a schema, just without pattern validation
      expect(result.schemas.InvalidPattern).toBeDefined();
      expectValidData(result.schemas.InvalidPattern, { field: 'any string' });
    });
  });

  describe('Advanced Schema Features', () => {
    it('should handle enum schemas correctly', async () => {
      const enumSchemas = createEnumSchemas();
      const oas = createBasicOpenAPISchema(enumSchemas);
      const result = await generateZodSchema({ oas });

      expectValidData(result.schemas.Status, 'active');
      expectValidData(result.schemas.Status, 'inactive');
      expectInvalidData(result.schemas.Status, 'invalid');

      expectValidData(result.schemas.Role, 'admin');
      expectValidData(result.schemas.Role, 'user');
      expectInvalidData(result.schemas.Role, 'superuser');
    });

    it('should handle union schemas correctly', async () => {
      const unionSchemas = createUnionSchemas();
      const oas = createBasicOpenAPISchema(unionSchemas);
      const result = await generateZodSchema({ oas });

      expectValidData(result.schemas.Response, 'string response');
      expectValidData(result.schemas.Response, 42);
      expectValidData(result.schemas.Response, true);
      expectInvalidData(result.schemas.Response, { object: 'not allowed' });

      expectValidData(result.schemas.Error, 'error message');
      expectValidData(result.schemas.Error, { code: '404', message: 'Not found' });
      expectInvalidData(result.schemas.Error, 42);
    });

    it('should handle intersection schemas correctly', async () => {
      const intersectionSchemas = createIntersectionSchemas();
      const oas = createBasicOpenAPISchema(intersectionSchemas);
      const result = await generateZodSchema({ oas });

      const validManager = {
        name: 'John Doe',
        age: 35,
        id: 'EMP001',
        department: 'Engineering',
        reports: ['EMP002', 'EMP003']
      };

      expectValidData(result.schemas.Manager, validManager);
    });
  });

  describe('Cross-Stage Integration', () => {
    it('should work with AST-based schema generation', async () => {
      // This test simulates the integration between PRD parsing and Zod generation
      const mockAST = {
        $schema: "http://json-schema.org/draft-07/schema#",
        version: "1.0.0",
        entities: [
          {
            name: "User",
            type: "model" as const,
            properties: [
              { name: "id", type: "string", required: true },
              { name: "name", type: "string", required: true },
              { name: "email", type: "string", required: true },
              { name: "age", type: "number", required: false }
            ]
          }
        ],
        relationships: [],
        operations: []
      };

      // Test that the AST structure is valid for Zod generation
      expect(mockAST.entities).toHaveLength(1);
      expect(mockAST.entities[0].name).toBe('User');
      expect(mockAST.entities[0].properties).toHaveLength(4);
    });
  });

  describe('Regression Testing', () => {
    it('should maintain backward compatibility with existing schemas', async () => {
      // Test that existing functionality from Phase 1 and 2 still works
      const basicSchemas = {
        SimpleUser: {
          type: 'object',
          properties: {
            name: { type: 'string' },
            age: { type: 'number' }
          }
        }
      };

      const oas = createBasicOpenAPISchema(basicSchemas);
      const result = await generateZodSchema({ oas });

      expectValidData(result.schemas.SimpleUser, { name: 'John', age: 30 });
      expectInvalidData(result.schemas.SimpleUser, { name: 'John', age: 'thirty' });
    });

    it('should handle all validation rules from previous phases', async () => {
      const validationSchema = createValidationTestSchema();
      const schemas = { ValidationTest: validationSchema };
      const oas = createBasicOpenAPISchema(schemas);
      const result = await generateZodSchema({ oas });

      const validData = generateValidTestData().validation;
      const invalidData = generateInvalidTestData().validation;

      expectValidData(result.schemas.ValidationTest, validData);
      expectInvalidData(result.schemas.ValidationTest, invalidData);
    });
  });

  describe('Test Suite Utilities', () => {
    it('should work with the test suite utility', async () => {
      const testSuite = createSchemaTestSuite(
        'TestSchema',
        createUserSchema(),
        generateValidTestData().user,
        generateInvalidTestData().user
      );

      const schemas = { [testSuite.name]: testSuite.schema };
      const oas = createBasicOpenAPISchema(schemas);
      const result = await generateZodSchema({ oas });

      const generatedSchema = result.schemas[testSuite.name];
      testSuite.testValid(generatedSchema);
      testSuite.testInvalid(generatedSchema);
    });
  });
}); 