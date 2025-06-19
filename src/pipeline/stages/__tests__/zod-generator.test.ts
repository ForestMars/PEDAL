import { generateZodSchema } from '../zod-generator';
import { z } from 'zod';

describe('Zod Generator - Phase 1', () => {
  describe('Enhanced Type Mapping', () => {
    it('should handle basic types with format support', async () => {
      const mockOAS = {
        openapi: '3.0.0',
        info: { title: 'Test', version: '1.0.0', description: 'Test API' },
        paths: {},
        components: {
          schemas: {
            User: {
              type: 'object',
              properties: {
                id: { type: 'string', format: 'uuid' },
                email: { type: 'string', format: 'email' },
                website: { type: 'string', format: 'uri' },
                age: { type: 'integer' },
                isActive: { type: 'boolean' },
                createdAt: { type: 'string', format: 'date-time' }
              },
              required: ['id', 'email']
            }
          }
        }
      };

      const result = await generateZodSchema({ oas: mockOAS });
      
      expect(result.schemas.User).toBeDefined();
      
      // Test that the schema can validate data
      const userSchema = result.schemas.User;
      const validUser = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        email: 'test@example.com',
        website: 'https://example.com',
        age: 30,
        isActive: true,
        createdAt: '2023-01-01T00:00:00Z'
      };
      
      expect(() => userSchema.parse(validUser)).not.toThrow();
    });
  });

  describe('Enum Support', () => {
    it('should handle enum schemas', async () => {
      const mockOAS = {
        openapi: '3.0.0',
        info: { title: 'Test', version: '1.0.0', description: 'Test API' },
        paths: {},
        components: {
          schemas: {
            Status: {
              enum: ['active', 'inactive', 'pending']
            }
          }
        }
      };

      const result = await generateZodSchema({ oas: mockOAS });
      
      expect(result.schemas.Status).toBeDefined();
      
      const statusSchema = result.schemas.Status;
      expect(() => statusSchema.parse('active')).not.toThrow();
      expect(() => statusSchema.parse('invalid')).toThrow();
    });
  });

  describe('Union Support', () => {
    it('should handle oneOf schemas', async () => {
      const mockOAS = {
        openapi: '3.0.0',
        info: { title: 'Test', version: '1.0.0', description: 'Test API' },
        paths: {},
        components: {
          schemas: {
            Response: {
              oneOf: [
                { type: 'string' },
                { type: 'number' }
              ]
            }
          }
        }
      };

      const result = await generateZodSchema({ oas: mockOAS });
      
      expect(result.schemas.Response).toBeDefined();
      
      const responseSchema = result.schemas.Response;
      expect(() => responseSchema.parse('hello')).not.toThrow();
      expect(() => responseSchema.parse(42)).not.toThrow();
      expect(() => responseSchema.parse({})).toThrow();
    });
  });

  describe('Nested Objects', () => {
    it('should handle nested object properties', async () => {
      const mockOAS = {
        openapi: '3.0.0',
        info: { title: 'Test', version: '1.0.0', description: 'Test API' },
        paths: {},
        components: {
          schemas: {
            Address: {
              type: 'object',
              properties: {
                street: { type: 'string' },
                city: { type: 'string' },
                country: { type: 'string' }
              }
            },
            User: {
              type: 'object',
              properties: {
                name: { type: 'string' },
                address: { 
                  type: 'object',
                  properties: {
                    street: { type: 'string' },
                    city: { type: 'string' }
                  }
                }
              }
            }
          }
        }
      };

      const result = await generateZodSchema({ oas: mockOAS });
      
      expect(result.schemas.Address).toBeDefined();
      expect(result.schemas.User).toBeDefined();
      
      const userSchema = result.schemas.User;
      const validUser = {
        name: 'John Doe',
        address: {
          street: '123 Main St',
          city: 'Anytown'
        }
      };
      
      expect(() => userSchema.parse(validUser)).not.toThrow();
    });
  });

  describe('Arrays', () => {
    it('should handle arrays of objects', async () => {
      const mockOAS = {
        openapi: '3.0.0',
        info: { title: 'Test', version: '1.0.0', description: 'Test API' },
        paths: {},
        components: {
          schemas: {
            UserList: {
              type: 'object',
              properties: {
                users: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      id: { type: 'string' },
                      name: { type: 'string' }
                    }
                  }
                }
              }
            }
          }
        }
      };

      const result = await generateZodSchema({ oas: mockOAS });
      
      expect(result.schemas.UserList).toBeDefined();
      
      const userListSchema = result.schemas.UserList;
      const validUserList = {
        users: [
          { id: '1', name: 'John' },
          { id: '2', name: 'Jane' }
        ]
      };
      
      expect(() => userListSchema.parse(validUserList)).not.toThrow();
    });
  });
}); 