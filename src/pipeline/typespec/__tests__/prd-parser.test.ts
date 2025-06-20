/**  
 * @fileoverview Tests parser based on sample prd (major assumption that sample.prd is unchanged!) 
 * @version 0.0.1
 * @license All rights reserved. 
 */ 

import { parsePRDToTypeSpec, generateZodSchema } from '../prd-parser';
import { 
  createBasicOpenAPISchema, 
  createUserSchema, 
  generateValidTestData,
  generateInvalidTestData,
  expectValidData,
  expectInvalidData,
  validatePerformance
} from '../../stages/__tests__/test-utils';
import fs from 'fs';
import path from 'path';
import { z } from 'zod';

describe('TypeSpec PRD Parser', () => {
  const samplePRD = fs.readFileSync(
    path.join(__dirname, '../../../examples/sample.prd'),
    'utf-8'
  );

  describe('Basic PRD Parsing', () => {
    it('should generate valid TypeSpec from PRD', async () => {
      const { program } = await parsePRDToTypeSpec({ prd: samplePRD });
      expect(program.diagnostics).toHaveLength(0);
    });

    it('should throw error for invalid PRD', async () => {
      await expect(parsePRDToTypeSpec({ prd: '' }))
        .rejects
        .toThrow('No PRD provided');
    });

    it('should generate TypeSpec with proper models', async () => {
      const { program } = await parsePRDToTypeSpec({ prd: samplePRD });
          
      // Check for User model
      const userModel = (program as any).models?.find((m: any) => m.name === 'User');
      expect(userModel).toBeDefined();
      expect(userModel?.properties).toContainEqual(
        expect.objectContaining({
          name: 'username',
          type: expect.any(Object)
        })
      );

      // Check for Role model
      const roleModel = (program as any).models?.find((m: any) => m.name === 'Role');
      expect(roleModel).toBeDefined();
      expect(roleModel?.properties).toContainEqual(
        expect.objectContaining({
          name: 'name',
          type: expect.any(Object)
        })
      );

      // Check for Permission model
      const permissionModel = (program as any).models?.find((m: any) => m.name === 'Permission');
      expect(permissionModel).toBeDefined();
      expect(permissionModel?.properties).toContainEqual(
        expect.objectContaining({
          name: 'name',
          type: expect.any(Object)
        })
      );
    });

    it('should include proper relationships', async () => {
      const { program } = await parsePRDToTypeSpec({ prd: samplePRD });
      
      // Check User-Role relationship
      const userModel = (program as any).models?.find((m: any) => m.name === 'User');
      expect(userModel?.relationships).toContainEqual(
        expect.objectContaining({
          target: 'Role',
          type: 'many-to-many'
        })
      );

      // Check Role-Permission relationship
      const roleModel = (program as any).models?.find((m: any) => m.name === 'Role');
      expect(roleModel?.relationships).toContainEqual(
        expect.objectContaining({
          target: 'Permission',
          type: 'many-to-many'
        })
      );
    });
  });

  describe('Zod Schema Generation', () => {
    it('should generate valid Zod schemas from AST', () => {
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
          },
          {
            name: "Product",
            type: "model" as const,
            properties: [
              { name: "id", type: "string", required: true },
              { name: "name", type: "string", required: true },
              { name: "price", type: "number", required: true },
              { name: "description", type: "string", required: false }
            ]
          }
        ],
        relationships: [],
        operations: []
      };

      const zodCode = generateZodSchema(mockAST);
      
      expect(zodCode).toContain('import { z } from \'zod\'');
      expect(zodCode).toContain('export const UserSchema');
      expect(zodCode).toContain('export const ProductSchema');
      expect(zodCode).toContain('export type User = z.infer<typeof UserSchema>');
      expect(zodCode).toContain('export type Product = z.infer<typeof ProductSchema>');
    });

    it('should handle validation rules in Zod generation', () => {
      const mockAST = {
        $schema: "http://json-schema.org/draft-07/schema#",
        version: "1.0.0",
        entities: [
          {
            name: "ValidatedUser",
            type: "model" as const,
            properties: [
              { name: "username", type: "string", required: true, minLength: 3, maxLength: 20 },
              { name: "email", type: "string", required: true },
              { name: "age", type: "number", required: false, minimum: 0, maximum: 150 },
              { name: "tags", type: "array", required: false, minItems: 1, maxItems: 10, uniqueItems: true }
            ]
          }
        ],
        relationships: [],
        operations: []
      };

      const zodCode = generateZodSchema(mockAST);
      
      expect(zodCode).toContain('z.string().min(3).max(20)');
      expect(zodCode).toContain('z.number().gte(0).lte(150)');
      expect(zodCode).toContain('z.array(z.string()).min(1).max(10)');
    });

    it('should handle complex nested schemas', () => {
      const mockAST = {
        $schema: "http://json-schema.org/draft-07/schema#",
        version: "1.0.0",
        entities: [
          {
            name: "Order",
            type: "model" as const,
            properties: [
              { name: "id", type: "string", required: true },
              { name: "customer", type: "object", required: true },
              { name: "items", type: "array", required: true },
              { name: "total", type: "number", required: true }
            ]
          }
        ],
        relationships: [],
        operations: []
      };

      const zodCode = generateZodSchema(mockAST);
      
      expect(zodCode).toContain('export const OrderSchema');
      expect(zodCode).toContain('z.object({');
      expect(zodCode).toContain('z.array(');
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('should handle empty entities gracefully', () => {
      const mockAST = {
        $schema: "http://json-schema.org/draft-07/schema#",
        version: "1.0.0",
        entities: [],
        relationships: [],
        operations: []
      };

      const zodCode = generateZodSchema(mockAST);
      
      expect(zodCode).toContain('import { z } from \'zod\'');
      expect(zodCode).toContain('// Export types');
    });

    it('should handle entities with no properties', () => {
      const mockAST = {
        $schema: "http://json-schema.org/draft-07/schema#",
        version: "1.0.0",
        entities: [
          {
            name: "EmptyEntity",
            type: "model" as const,
            properties: []
          }
        ],
        relationships: [],
        operations: []
      };

      const zodCode = generateZodSchema(mockAST);
      
      expect(zodCode).toContain('export const EmptyEntitySchema');
      expect(zodCode).toContain('z.object({');
    });

    it('should handle operations with parameters', () => {
      const mockAST = {
        $schema: "http://json-schema.org/draft-07/schema#",
        version: "1.0.0",
        entities: [],
        relationships: [],
        operations: [
          {
            name: "createUser",
            entity: "User",
            type: "create" as const,
            parameters: [
              { name: "data", type: "User", required: true },
              { name: "options", type: "object", required: false }
            ]
          }
        ]
      };

      const zodCode = generateZodSchema(mockAST);
      
      expect(zodCode).toContain('export const createUserSchema');
      expect(zodCode).toContain('export type createUserParams');
    });
  });

  describe('Performance Testing', () => {
    it('should generate schemas efficiently for large ASTs', () => {
      const largeAST = {
        $schema: "http://json-schema.org/draft-07/schema#",
        version: "1.0.0",
        entities: Array.from({ length: 20 }, (_, i) => ({
          name: `Entity${i}`,
          type: "model" as const,
          properties: Array.from({ length: 10 }, (_, j) => ({
            name: `property${j}`,
            type: j % 3 === 0 ? "string" : j % 3 === 1 ? "number" : "boolean",
            required: j === 0
          }))
        })),
        relationships: [],
        operations: []
      };

      validatePerformance(() => {
        generateZodSchema(largeAST);
      }, 500); // Should complete within 500ms
    });
  });

  describe('Integration with OpenAPI Generation', () => {
    it('should work with the complete pipeline', async () => {
      // Test the integration between PRD parsing and Zod generation
      const { ast } = await parsePRDToTypeSpec({ prd: samplePRD });
      
      expect(ast).toBeDefined();
      expect(ast.entities).toBeInstanceOf(Array);
      expect(ast.entities.length).toBeGreaterThan(0);
      
      // Generate Zod schemas from the AST
      const zodCode = generateZodSchema(ast);
      
      expect(zodCode).toContain('import { z } from \'zod\'');
      expect(zodCode).toContain('export const');
      expect(zodCode).toContain('export type');
    });
  });

  describe('Validation Testing', () => {
    it('should generate schemas that validate correctly', () => {
      const mockAST = {
        $schema: "http://json-schema.org/draft-07/schema#",
        version: "1.0.0",
        entities: [
          {
            name: "TestUser",
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

      const zodCode = generateZodSchema(mockAST);
      
      // The generated code should be valid TypeScript/JavaScript
      expect(() => {
        // This is a basic syntax check - in a real scenario, you might want to
        // actually evaluate the generated code or use a TypeScript compiler
        new Function(zodCode);
      }).not.toThrow();
    });
  });

  describe('Regression Testing', () => {
    it('should maintain backward compatibility', async () => {
      const { program, ast } = await parsePRDToTypeSpec({ prd: samplePRD });
      
      // Ensure the program still has no diagnostics
      expect(program.diagnostics).toHaveLength(0);
      
      // Ensure the AST has the expected structure
      expect(ast.$schema).toBe("http://json-schema.org/draft-07/schema#");
      expect(ast.version).toBeDefined();
      expect(ast.entities).toBeInstanceOf(Array);
      expect(ast.relationships).toBeInstanceOf(Array);
      expect(ast.operations).toBeInstanceOf(Array);
    });

    it('should handle the same PRD consistently', async () => {
      const result1 = await parsePRDToTypeSpec({ prd: samplePRD });
      const result2 = await parsePRDToTypeSpec({ prd: samplePRD });
      
      // The results should be consistent
      expect(result1.ast.entities.length).toBe(result2.ast.entities.length);
      expect(result1.ast.relationships.length).toBe(result2.ast.relationships.length);
      expect(result1.ast.operations.length).toBe(result2.ast.operations.length);
    });
  });
}); 