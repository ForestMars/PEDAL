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

describe('Zod Generator - Phase 2', () => {
  describe('String Validation Rules', () => {
    it('should handle string length constraints', async () => {
      const mockOAS = {
        openapi: '3.0.0',
        info: { title: 'Test', version: '1.0.0', description: 'Test API' },
        paths: {},
        components: {
          schemas: {
            User: {
              type: 'object',
              properties: {
                username: { 
                  type: 'string', 
                  minLength: 3, 
                  maxLength: 20 
                },
                password: { 
                  type: 'string', 
                  minLength: 8 
                }
              }
            }
          }
        }
      };

      const result = await generateZodSchema({ oas: mockOAS });
      const userSchema = result.schemas.User;
      
      // Valid cases
      expect(() => userSchema.parse({ username: 'john', password: 'password123' })).not.toThrow();
      expect(() => userSchema.parse({ username: 'john_doe_123', password: 'password123' })).not.toThrow();
      
      // Invalid cases
      expect(() => userSchema.parse({ username: 'jo', password: 'password123' })).toThrow(); // too short
      expect(() => userSchema.parse({ username: 'john_doe_123_456_789_extra', password: 'password123' })).toThrow(); // too long
      expect(() => userSchema.parse({ username: 'john', password: 'pass' })).toThrow(); // password too short
    });

    it('should handle string pattern validation', async () => {
      const mockOAS = {
        openapi: '3.0.0',
        info: { title: 'Test', version: '1.0.0', description: 'Test API' },
        paths: {},
        components: {
          schemas: {
            User: {
              type: 'object',
              properties: {
                phone: { 
                  type: 'string', 
                  pattern: '^\\+?[1-9]\\d{1,14}$' // E.164 phone format
                },
                zipCode: { 
                  type: 'string', 
                  pattern: '^\\d{5}(-\\d{4})?$' // US ZIP code
                }
              }
            }
          }
        }
      };

      const result = await generateZodSchema({ oas: mockOAS });
      const userSchema = result.schemas.User;
      
      // Valid cases
      expect(() => userSchema.parse({ phone: '+1234567890', zipCode: '12345' })).not.toThrow();
      expect(() => userSchema.parse({ phone: '1234567890', zipCode: '12345-6789' })).not.toThrow();
      
      // Invalid cases
      expect(() => userSchema.parse({ phone: 'invalid', zipCode: '12345' })).toThrow();
      expect(() => userSchema.parse({ phone: '+1234567890', zipCode: 'invalid' })).toThrow();
    });
  });

  describe('Number Validation Rules', () => {
    it('should handle number range constraints', async () => {
      const mockOAS = {
        openapi: '3.0.0',
        info: { title: 'Test', version: '1.0.0', description: 'Test API' },
        paths: {},
        components: {
          schemas: {
            Product: {
              type: 'object',
              properties: {
                price: { 
                  type: 'number', 
                  minimum: 0,
                  maximum: 10000
                },
                rating: { 
                  type: 'number', 
                  minimum: 1,
                  maximum: 5
                },
                quantity: { 
                  type: 'integer', 
                  minimum: 0
                }
              }
            }
          }
        }
      };

      const result = await generateZodSchema({ oas: mockOAS });
      const productSchema = result.schemas.Product;
      
      // Valid cases
      expect(() => productSchema.parse({ price: 100, rating: 4.5, quantity: 10 })).not.toThrow();
      expect(() => productSchema.parse({ price: 0, rating: 1, quantity: 0 })).not.toThrow();
      
      // Invalid cases
      expect(() => productSchema.parse({ price: -10, rating: 4.5, quantity: 10 })).toThrow(); // negative price
      expect(() => productSchema.parse({ price: 100, rating: 6, quantity: 10 })).toThrow(); // rating too high
      expect(() => productSchema.parse({ price: 100, rating: 4.5, quantity: -5 })).toThrow(); // negative quantity
    });

    it('should handle exclusive minimum/maximum', async () => {
      const mockOAS = {
        openapi: '3.0.0',
        info: { title: 'Test', version: '1.0.0', description: 'Test API' },
        paths: {},
        components: {
          schemas: {
            Score: {
              type: 'object',
              properties: {
                value: { 
                  type: 'number', 
                  minimum: 0,
                  maximum: 100,
                  exclusiveMinimum: true,
                  exclusiveMaximum: true
                }
              }
            }
          }
        }
      };

      const result = await generateZodSchema({ oas: mockOAS });
      const scoreSchema = result.schemas.Score;
      
      // Valid cases
      expect(() => scoreSchema.parse({ value: 50 })).not.toThrow();
      expect(() => scoreSchema.parse({ value: 0.1 })).not.toThrow();
      expect(() => scoreSchema.parse({ value: 99.9 })).not.toThrow();
      
      // Invalid cases
      expect(() => scoreSchema.parse({ value: 0 })).toThrow(); // equal to minimum
      expect(() => scoreSchema.parse({ value: 100 })).toThrow(); // equal to maximum
    });

    it('should handle multipleOf constraint', async () => {
      const mockOAS = {
        openapi: '3.0.0',
        info: { title: 'Test', version: '1.0.0', description: 'Test API' },
        paths: {},
        components: {
          schemas: {
            Amount: {
              type: 'object',
              properties: {
                value: { 
                  type: 'number', 
                  multipleOf: 0.25
                }
              }
            }
          }
        }
      };

      const result = await generateZodSchema({ oas: mockOAS });
      const amountSchema = result.schemas.Amount;
      
      // Valid cases
      expect(() => amountSchema.parse({ value: 1.0 })).not.toThrow();
      expect(() => amountSchema.parse({ value: 1.25 })).not.toThrow();
      expect(() => amountSchema.parse({ value: 2.5 })).not.toThrow();
      
      // Invalid cases
      expect(() => amountSchema.parse({ value: 1.1 })).toThrow(); // not multiple of 0.25
      expect(() => amountSchema.parse({ value: 1.33 })).toThrow(); // not multiple of 0.25
    });
  });

  describe('Array Validation Rules', () => {
    it('should handle array length constraints', async () => {
      const mockOAS = {
        openapi: '3.0.0',
        info: { title: 'Test', version: '1.0.0', description: 'Test API' },
        paths: {},
        components: {
          schemas: {
            Order: {
              type: 'object',
              properties: {
                items: {
                  type: 'array',
                  items: { type: 'string' },
                  minItems: 1,
                  maxItems: 10
                },
                tags: {
                  type: 'array',
                  items: { type: 'string' },
                  maxItems: 5
                }
              }
            }
          }
        }
      };

      const result = await generateZodSchema({ oas: mockOAS });
      const orderSchema = result.schemas.Order;
      
      // Valid cases
      expect(() => orderSchema.parse({ items: ['item1'], tags: [] })).not.toThrow();
      expect(() => orderSchema.parse({ items: ['item1', 'item2'], tags: ['tag1', 'tag2'] })).not.toThrow();
      
      // Invalid cases
      expect(() => orderSchema.parse({ items: [], tags: [] })).toThrow(); // no items
      expect(() => orderSchema.parse({ items: Array(11).fill('item'), tags: [] })).toThrow(); // too many items
    });

    it('should handle unique items constraint', async () => {
      const mockOAS = {
        openapi: '3.0.0',
        info: { title: 'Test', version: '1.0.0', description: 'Test API' },
        paths: {},
        components: {
          schemas: {
            User: {
              type: 'object',
              properties: {
                roles: {
                  type: 'array',
                  items: { type: 'string' },
                  uniqueItems: true
                },
                permissions: {
                  type: 'array',
                  items: { type: 'string' },
                  uniqueItems: true
                }
              }
            }
          }
        }
      };

      const result = await generateZodSchema({ oas: mockOAS });
      const userSchema = result.schemas.User;
      
      // Valid cases
      expect(() => userSchema.parse({ roles: ['admin'], permissions: ['read', 'write'] })).not.toThrow();
      expect(() => userSchema.parse({ roles: ['admin', 'user'], permissions: ['read'] })).not.toThrow();
      
      // Invalid cases
      expect(() => userSchema.parse({ roles: ['admin', 'admin'], permissions: ['read'] })).toThrow(); // duplicate role
      expect(() => userSchema.parse({ roles: ['admin'], permissions: ['read', 'read'] })).toThrow(); // duplicate permission
    });
  });

  describe('Object Validation Rules', () => {
    it('should handle property count constraints', async () => {
      const mockOAS = {
        openapi: '3.0.0',
        info: { title: 'Test', version: '1.0.0', description: 'Test API' },
        paths: {},
        components: {
          schemas: {
            Config: {
              type: 'object',
              properties: {
                name: { type: 'string' },
                value: { type: 'string' },
                description: { type: 'string' }
              },
              minProperties: 1,
              maxProperties: 3
            }
          }
        }
      };

      const result = await generateZodSchema({ oas: mockOAS });
      const configSchema = result.schemas.Config;
      
      // Valid cases
      expect(() => configSchema.parse({ name: 'test' })).not.toThrow();
      expect(() => configSchema.parse({ name: 'test', value: 'value' })).not.toThrow();
      expect(() => configSchema.parse({ name: 'test', value: 'value', description: 'desc' })).not.toThrow();
      
      // Invalid cases
      expect(() => configSchema.parse({})).toThrow(); // no properties
      expect(() => configSchema.parse({ name: 'test', value: 'value', description: 'desc', extra: 'extra' })).toThrow(); // too many properties
    });
  });

  describe('Advanced Validation Features', () => {
    it('should handle allOf (intersection)', async () => {
      const mockOAS = {
        openapi: '3.0.0',
        info: { title: 'Test', version: '1.0.0', description: 'Test API' },
        paths: {},
        components: {
          schemas: {
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
          }
        }
      };

      const result = await generateZodSchema({ oas: mockOAS });
      const managerSchema = result.schemas.Manager;
      
      // Valid case
      const validManager = {
        name: 'John Doe',
        age: 35,
        id: 'EMP001',
        department: 'Engineering',
        reports: ['EMP002', 'EMP003']
      };
      
      expect(() => managerSchema.parse(validManager)).not.toThrow();
    });

    it('should handle not (inverse) validation', async () => {
      const mockOAS = {
        openapi: '3.0.0',
        info: { title: 'Test', version: '1.0.0', description: 'Test API' },
        paths: {},
        components: {
          schemas: {
            NonEmptyString: {
              type: 'string',
              not: {
                type: 'string',
                maxLength: 0
              }
            }
          }
        }
      };

      const result = await generateZodSchema({ oas: mockOAS });
      const nonEmptyStringSchema = result.schemas.NonEmptyString;
      
      // Valid cases
      expect(() => nonEmptyStringSchema.parse('hello')).not.toThrow();
      expect(() => nonEmptyStringSchema.parse('a')).not.toThrow();
      
      // Invalid cases
      expect(() => nonEmptyStringSchema.parse('')).toThrow(); // empty string
    });
  });
});

describe('Zod Generator - Phase 3: Comprehensive Testing', () => {
  describe('Edge Cases', () => {
    it('should handle empty strings, arrays, and objects', async () => {
      const mockOAS = {
        openapi: '3.0.0',
        info: { title: 'Test', version: '1.0.0', description: 'Test API' },
        paths: {},
        components: {
          schemas: {
            EmptyCases: {
              type: 'object',
              properties: {
                emptyString: { type: 'string', minLength: 0 },
                emptyArray: { type: 'array', items: { type: 'string' }, minItems: 0 },
                emptyObject: { type: 'object', minProperties: 0 }
              }
            }
          }
        }
      };
      const result = await generateZodSchema({ oas: mockOAS });
      const schema = result.schemas.EmptyCases;
      expect(() => schema.parse({ emptyString: '', emptyArray: [], emptyObject: {} })).not.toThrow();
    });

    it('should handle boundary values for min/max constraints', async () => {
      const mockOAS = {
        openapi: '3.0.0',
        info: { title: 'Test', version: '1.0.0', description: 'Test API' },
        paths: {},
        components: {
          schemas: {
            Boundaries: {
              type: 'object',
              properties: {
                minLen: { type: 'string', minLength: 3 },
                maxLen: { type: 'string', maxLength: 5 },
                minItems: { type: 'array', items: { type: 'number' }, minItems: 2 },
                maxItems: { type: 'array', items: { type: 'number' }, maxItems: 3 }
              }
            }
          }
        }
      };
      const result = await generateZodSchema({ oas: mockOAS });
      const schema = result.schemas.Boundaries;
      expect(() => schema.parse({ minLen: 'abc', maxLen: 'abcde', minItems: [1,2], maxItems: [1,2,3] })).not.toThrow();
      expect(() => schema.parse({ minLen: 'ab', maxLen: 'abcdef', minItems: [1], maxItems: [1,2,3,4] })).toThrow();
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid input types', async () => {
      const mockOAS = {
        openapi: '3.0.0',
        info: { title: 'Test', version: '1.0.0', description: 'Test API' },
        paths: {},
        components: {
          schemas: {
            Types: {
              type: 'object',
              properties: {
                str: { type: 'string' },
                num: { type: 'number' },
                arr: { type: 'array', items: { type: 'string' } }
              }
            }
          }
        }
      };
      const result = await generateZodSchema({ oas: mockOAS });
      const schema = result.schemas.Types;
      expect(() => schema.parse({ str: 123, num: 'abc', arr: 'not-an-array' })).toThrow();
    });

    it('should handle invalid regex patterns gracefully', async () => {
      const mockOAS = {
        openapi: '3.0.0',
        info: { title: 'Test', version: '1.0.0', description: 'Test API' },
        paths: {},
        components: {
          schemas: {
            InvalidPattern: {
              type: 'object',
              properties: {
                field: { type: 'string', pattern: '[invalid-regex' }
              }
            }
          }
        }
      };
      const result = await generateZodSchema({ oas: mockOAS });
      const schema = result.schemas.InvalidPattern;
      expect(() => schema.parse({ field: 'any string' })).not.toThrow();
    });
  });

  describe('Complex/Nested Validation', () => {
    it('should handle deeply nested objects and arrays', async () => {
      const mockOAS = {
        openapi: '3.0.0',
        info: { title: 'Test', version: '1.0.0', description: 'Test API' },
        paths: {},
        components: {
          schemas: {
            Deep: {
              type: 'object',
              properties: {
                level1: {
                  type: 'object',
                  properties: {
                    level2: {
                      type: 'object',
                      properties: {
                        arr: {
                          type: 'array',
                          items: {
                            type: 'object',
                            properties: {
                              value: { type: 'string', minLength: 2 }
                            }
                          },
                          minItems: 1
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
      const result = await generateZodSchema({ oas: mockOAS });
      const schema = result.schemas.Deep;
      expect(() => schema.parse({ level1: { level2: { arr: [{ value: 'ab' }] } } })).not.toThrow();
      expect(() => schema.parse({ level1: { level2: { arr: [] } } })).toThrow();
      expect(() => schema.parse({ level1: { level2: { arr: [{ value: 'a' }] } } })).toThrow();
    });
  });

  describe('Advanced Features', () => {
    it('should handle enum, union, intersection, and not/inverse validation', async () => {
      const mockOAS = {
        openapi: '3.0.0',
        info: { title: 'Test', version: '1.0.0', description: 'Test API' },
        paths: {},
        components: {
          schemas: {
            Advanced: {
              type: 'object',
              properties: {
                status: { type: 'string', enum: ['active', 'inactive'] },
                value: { oneOf: [ { type: 'string' }, { type: 'number' } ] },
                both: { allOf: [ { type: 'string', minLength: 2 }, { pattern: '^a' } ] },
                notEmpty: { type: 'string', not: { type: 'string', maxLength: 0 } }
              }
            }
          }
        }
      };
      const result = await generateZodSchema({ oas: mockOAS });
      const schema = result.schemas.Advanced;
      expect(() => schema.parse({ status: 'active', value: 42, both: 'ab', notEmpty: 'x' })).not.toThrow();
      expect(() => schema.parse({ status: 'inactive', value: 'hello', both: 'a1', notEmpty: 'notempty' })).not.toThrow();
      expect(() => schema.parse({ status: 'invalid', value: true, both: 'b', notEmpty: '' })).toThrow();
    });
  });

  describe('Negative Tests for Validation Rules', () => {
    it('should fail with clear errors for all validation rules', async () => {
      const mockOAS = {
        openapi: '3.0.0',
        info: { title: 'Test', version: '1.0.0', description: 'Test API' },
        paths: {},
        components: {
          schemas: {
            Negatives: {
              type: 'object',
              properties: {
                short: { type: 'string', minLength: 3 },
                long: { type: 'string', maxLength: 2 },
                pattern: { type: 'string', pattern: '^abc' },
                minNum: { type: 'number', minimum: 5 },
                maxNum: { type: 'number', maximum: 10 },
                minArr: { type: 'array', items: { type: 'number' }, minItems: 2 },
                maxArr: { type: 'array', items: { type: 'number' }, maxItems: 1 },
                minObj: { type: 'object', minProperties: 2 },
                maxObj: { type: 'object', maxProperties: 1 },
                notEmpty: { type: 'string', not: { type: 'string', maxLength: 0 } }
              }
            }
          }
        }
      };
      const result = await generateZodSchema({ oas: mockOAS });
      const schema = result.schemas.Negatives;
      // Each of these should throw
      expect(() => schema.parse({ short: 'ab' })).toThrow(/at least 3 characters/);
      expect(() => schema.parse({ long: 'abc' })).toThrow(/at most 2 characters/);
      expect(() => schema.parse({ pattern: 'def' })).toThrow(/pattern/);
      expect(() => schema.parse({ minNum: 4 })).toThrow();
      expect(() => schema.parse({ maxNum: 11 })).toThrow();
      expect(() => schema.parse({ minArr: [1] })).toThrow();
      expect(() => schema.parse({ maxArr: [1,2] })).toThrow();
      expect(() => schema.parse({ minObj: { a: 1 } })).toThrow(/at least 2 properties/);
      expect(() => schema.parse({ maxObj: { a: 1, b: 2 } })).toThrow(/at most 1 properties/);
      expect(() => schema.parse({ notEmpty: '' })).toThrow(/NOT match/);
    });
  });
}); 