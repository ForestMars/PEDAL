/**  
 * @fileoverview Given a valid domain model and OAS file, generates a Zod schema for each entity
 * @version 0.0.1
 * @license All rights reserved, Continuum Software
 * 
 */ 

import { z } from 'zod';

// Enhanced OpenAPI schema interface to support Phase 1 features
interface OpenAPISchemaProperty {
  type?: string;
  format?: string;
  enum?: any[];
  oneOf?: any[];
  anyOf?: any[];
  items?: OpenAPISchemaProperty;
  properties?: Record<string, OpenAPISchemaProperty>;
  required?: boolean;
  description?: string;
}

interface OpenAPISchema {
  openapi: string;
  info: {
    title: string;
    version: string;
    description: string;
  };
  paths: Record<string, any>;
  components: {
    schemas: Record<string, {
      type?: string;
      properties?: Record<string, OpenAPISchemaProperty>;
      required?: string[];
      enum?: any[];
      oneOf?: any[];
      anyOf?: any[];
      items?: OpenAPISchemaProperty;
    }>;
  };
}

/**
 * Maps OpenAPI property to Zod schema with enhanced type support
 */
function mapOpenAPIPropertyToZod(prop: OpenAPISchemaProperty, propName: string): z.ZodType<any> {
  let zodType: z.ZodType<any>;

  // Handle enums first
  if (prop.enum && Array.isArray(prop.enum)) {
    zodType = z.enum(prop.enum as [string, ...string[]]);
  }
  // Handle unions (oneOf, anyOf)
  else if (prop.oneOf && Array.isArray(prop.oneOf) && prop.oneOf.length >= 2) {
    const unionTypes = prop.oneOf.map((unionProp: any) => 
      mapOpenAPIPropertyToZod(unionProp, propName)
    );
    zodType = z.union([unionTypes[0], unionTypes[1], ...unionTypes.slice(2)]);
  }
  else if (prop.anyOf && Array.isArray(prop.anyOf) && prop.anyOf.length >= 2) {
    const unionTypes = prop.anyOf.map((unionProp: any) => 
      mapOpenAPIPropertyToZod(unionProp, propName)
    );
    zodType = z.union([unionTypes[0], unionTypes[1], ...unionTypes.slice(2)]);
  }
  // Handle arrays
  else if (prop.type === 'array' && prop.items) {
    const itemType = mapOpenAPIPropertyToZod(prop.items, `${propName}Item`);
    zodType = z.array(itemType);
  }
  // Handle objects
  else if (prop.type === 'object' || prop.properties) {
    if (prop.properties) {
      const objectProperties: Record<string, z.ZodType<any>> = {};
      for (const [key, value] of Object.entries(prop.properties)) {
        objectProperties[key] = mapOpenAPIPropertyToZod(value, key);
      }
      zodType = z.object(objectProperties);
    } else {
      zodType = z.record(z.any());
    }
  }
  // Handle basic types with format support
  else {
    switch (prop.type) {
      case 'string':
        // Enhanced string type mapping with format support
        if (prop.format) {
          switch (prop.format) {
            case 'email':
              zodType = z.string().email();
              break;
            case 'uuid':
              zodType = z.string().uuid();
              break;
            case 'date':
              zodType = z.string().datetime();
              break;
            case 'date-time':
              zodType = z.string().datetime();
              break;
            case 'uri':
              zodType = z.string().url();
              break;
            default:
              zodType = z.string();
          }
        } else {
          zodType = z.string();
        }
        break;
      case 'number':
      case 'integer':
      case 'float':
      case 'decimal':
        zodType = z.number();
        break;
      case 'boolean':
        zodType = z.boolean();
        break;
      case 'date':
      case 'date-time':
        zodType = z.date();
        break;
      default:
        zodType = z.any();
    }
  }

  // Add description if available
  if (prop.description) {
    zodType = zodType.describe(prop.description);
  }

  return zodType;
}

export async function generateZodSchema(input: { oas: OpenAPISchema }): Promise<{
  schemas: Record<string, z.ZodType<any>>;
}> {
  const { oas } = input;
  const schemas: Record<string, z.ZodType<any>> = {};
  
  // Convert OpenAPI schemas to Zod schemas
  for (const [name, schema] of Object.entries(oas.components.schemas)) {
    // Handle enum schemas
    if (schema.enum && Array.isArray(schema.enum)) {
      schemas[name] = z.enum(schema.enum as [string, ...string[]]);
      continue;
    }

    // Handle union schemas
    if (schema.oneOf && Array.isArray(schema.oneOf) && schema.oneOf.length >= 2) {
      const unionTypes = schema.oneOf.map((unionSchema: any) => {
        if (unionSchema.enum) {
          return z.enum(unionSchema.enum as [string, ...string[]]);
        }
        return mapOpenAPIPropertyToZod(unionSchema, name);
      });
      schemas[name] = z.union([unionTypes[0], unionTypes[1], ...unionTypes.slice(2)]);
      continue;
    }

    if (schema.anyOf && Array.isArray(schema.anyOf) && schema.anyOf.length >= 2) {
      const unionTypes = schema.anyOf.map((unionSchema: any) => {
        if (unionSchema.enum) {
          return z.enum(unionSchema.enum as [string, ...string[]]);
        }
        return mapOpenAPIPropertyToZod(unionSchema, name);
      });
      schemas[name] = z.union([unionTypes[0], unionTypes[1], ...unionTypes.slice(2)]);
      continue;
    }

    // Handle object schemas
    if (schema.properties) {
      const properties: Record<string, z.ZodType<any>> = {};
      
      for (const [propName, prop] of Object.entries(schema.properties)) {
        const zodType = mapOpenAPIPropertyToZod(prop, propName);
        
        properties[propName] = schema.required?.includes(propName) 
          ? zodType 
          : zodType.optional();
      }
      
      schemas[name] = z.object(properties);
    } else {
      // Fallback for schemas without properties
      schemas[name] = z.any();
    }
  }
  
  return { schemas };
} 