/**  
 * @fileoverview 
 * @version 0.0.1
 * @license All rights reserved, Continuum Software
 *
 */ 

import { z } from 'zod';
import { DomainEntity } from '../stages/prd-parser';

// Define the schema for domain methods
const DomainMethodSchema = z.object({
  name: z.string(),
  description: z.string(),
  parameters: z.array(z.object({
    name: z.string(),
    type: z.string(),
    description: z.string().optional(),
    required: z.boolean().optional()
  })).optional(),
  returnType: z.string().optional(),
  isEvent: z.boolean().optional(),
  isCommand: z.boolean().optional(),
  isQuery: z.boolean().optional()
});

export type DomainMethod = z.infer<typeof DomainMethodSchema>;

export async function enhanceDomainModel(input: { entities: DomainEntity[] }): Promise<{
  entities: DomainEntity[];
  methods: Record<string, DomainMethod[]>;
}> {
  const { entities } = input;
  
  // Initialize methods map
  const methods: Record<string, DomainMethod[]> = {};
  
  // For each entity, generate standard CRUD methods
  for (const entity of entities) {
    const entityMethods: DomainMethod[] = [
      {
        name: `create${entity.name}`,
        description: `Create a new ${entity.name}`,
        parameters: entity.attributes.map(attr => ({
          name: attr.name,
          type: attr.type,
          required: attr.required ?? true
        })),
        isCommand: true
      },
      {
        name: `get${entity.name}`,
        description: `Get a ${entity.name} by ID`,
        parameters: [{
          name: 'id',
          type: 'string',
          required: true
        }],
        returnType: entity.name,
        isQuery: true
      },
      {
        name: `update${entity.name}`,
        description: `Update an existing ${entity.name}`,
        parameters: [
          {
            name: 'id',
            type: 'string',
            required: true
          },
          ...entity.attributes.map(attr => ({
            name: attr.name,
            type: attr.type,
            required: false
          }))
        ],
        returnType: entity.name,
        isCommand: true
      },
      {
        name: `delete${entity.name}`,
        description: `Delete a ${entity.name}`,
        parameters: [{
          name: 'id',
          type: 'string',
          required: true
        }],
        isCommand: true
      }
    ];
    
    // Add relationship-specific methods
    if (entity.relationships) {
      for (const rel of entity.relationships) {
        entityMethods.push({
          name: `get${entity.name}${rel.target}`,
          description: `Get ${rel.target} for a ${entity.name}`,
          parameters: [{
            name: `${entity.name.toLowerCase()}Id`,
            type: 'string',
            required: true
          }],
          returnType: rel.type === 'one-to-one' ? rel.target : `${rel.target}[]`,
          isQuery: true
        });
      }
    }
    
    methods[entity.name] = entityMethods;
  }
  
  return {
    entities,
    methods
  };
} 