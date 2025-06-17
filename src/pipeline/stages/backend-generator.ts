/**  
 * @fileoverview Given an OAS file and a Zod schema, stubs out backend functionality
 * @version 0.0.1
 * @license All rights reserved, Continuum Software
 *
 */ 

import { OpenAPISchema } from './oas-generator';
import { DomainMethod } from './domain-enhancer';
import { z } from 'zod';

export async function generateBackend(input: {
  oas: OpenAPISchema;
  methods: Record<string, DomainMethod[]>;
}): Promise<{ backend: Record<string, string> }> {
  const { oas, methods } = input;
  const backend: Record<string, string> = {};
  
  // Generate backend functions for each method
  for (const [entityName, entityMethods] of Object.entries(methods)) {
    const functions: string[] = [];
    const tests: string[] = [];
    
    for (const method of entityMethods) {
      // Generate function
      const functionCode = `
import { ${entityName} } from '../models/${entityName.toLowerCase()}';
import { db } from '../db';

export async function ${method.name}(${method.parameters?.map(p => 
  `${p.name}: ${p.type}`
).join(', ')}) {
  try {
    ${method.isQuery ? `
    const result = await db.query.${entityName.toLowerCase()}.findFirst({
      where: (${entityName.toLowerCase()}, { eq }) => eq(${entityName.toLowerCase()}.id, id)
    });
    
    if (!result) {
      throw new Error('${entityName} not found');
    }
    
    return result;
    ` : method.isCommand ? `
    const result = await db.insert(${entityName.toLowerCase()})
      .values({
        ${method.parameters?.filter(p => p.name !== 'id').map(p => 
          `${p.name}`
        ).join(',\n')}
      })
      .returning();
    
    return result[0];
    ` : ''}
  } catch (error) {
    console.error('Error in ${method.name}:', error);
    throw error;
  }
}
      `;
      
      // Generate test
      const testCode = `
import { ${method.name} } from './${method.name}';
import { db } from '../db';

describe('${method.name}', () => {
  beforeEach(async () => {
    await db.delete(${entityName.toLowerCase()});
  });
  
  ${method.isQuery ? `
  it('should return ${entityName} by id', async () => {
    const ${entityName.toLowerCase()} = await db.insert(${entityName.toLowerCase()})
      .values({
        ${method.parameters?.filter(p => p.name !== 'id').map(p => 
          `${p.name}: 'test-${p.name}'`
        ).join(',\n')}
      })
      .returning();
    
    const result = await ${method.name}(${entityName.toLowerCase()}[0].id);
    expect(result).toEqual(${entityName.toLowerCase()}[0]);
  });
  
  it('should throw error if ${entityName} not found', async () => {
    await expect(${method.name}('non-existent-id'))
      .rejects
      .toThrow('${entityName} not found');
  });
  ` : method.isCommand ? `
  it('should create ${entityName}', async () => {
    const data = {
      ${method.parameters?.filter(p => p.name !== 'id').map(p => 
        `${p.name}: 'test-${p.name}'`
      ).join(',\n')}
    };
    
    const result = await ${method.name}(${Object.keys(data).join(', ')});
    expect(result).toMatchObject(data);
  });
  ` : ''}
});
      `;
      
      functions.push(functionCode);
      tests.push(testCode);
    }
    
    backend[`${entityName.toLowerCase()}.ts`] = functions.join('\n\n');
    backend[`${entityName.toLowerCase()}.test.ts`] = tests.join('\n\n');
  }
  
  return { backend };
} 