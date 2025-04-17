import { z } from 'zod';
import { OpenAPISchema } from './oas-generator';

export async function generateZodSchema(input: { oas: OpenAPISchema }): Promise<{
  schemas: Record<string, z.ZodType<any>>;
}> {
  const { oas } = input;
  const schemas: Record<string, z.ZodType<any>> = {};
  
  // Convert OpenAPI schemas to Zod schemas
  for (const [name, schema] of Object.entries(oas.components.schemas)) {
    const properties: Record<string, z.ZodType<any>> = {};
    
    for (const [propName, prop] of Object.entries(schema.properties)) {
      let zodType: z.ZodType<any>;
      
      switch (prop.type) {
        case 'string':
          zodType = z.string();
          break;
        case 'number':
          zodType = z.number();
          break;
        case 'boolean':
          zodType = z.boolean();
          break;
        case 'array':
          zodType = z.array(z.any());
          break;
        case 'object':
          zodType = z.record(z.any());
          break;
        default:
          zodType = z.any();
      }
      
      if (prop.description) {
        zodType = zodType.describe(prop.description);
      }
      
      properties[propName] = schema.required?.includes(propName) 
        ? zodType 
        : zodType.optional();
    }
    
    schemas[name] = z.object(properties);
  }
  
  return { schemas };
} 