/**  
 * @fileoverview Given a valid domain model and OAS file, generates a Zod schema for each entity
 * @version 0.0.1
 * @license All rights reserved, Continuum Software
 * 
 */ 

import { z } from 'zod';

// Enhanced OpenAPI schema interface to support Phase 1 and Phase 2 features
interface OpenAPISchemaProperty {
  type?: string;
  format?: string;
  enum?: any[];
  oneOf?: any[];
  anyOf?: any[];
  allOf?: any[];
  not?: any;
  items?: OpenAPISchemaProperty;
  properties?: Record<string, OpenAPISchemaProperty>;
  required?: boolean;
  description?: string;
  
  // String validation
  minLength?: number;
  maxLength?: number;
  pattern?: string;
  
  // Number validation
  minimum?: number;
  maximum?: number;
  exclusiveMinimum?: boolean | number;
  exclusiveMaximum?: boolean | number;
  multipleOf?: number;
  
  // Array validation
  minItems?: number;
  maxItems?: number;
  uniqueItems?: boolean;
  
  // Object validation
  minProperties?: number;
  maxProperties?: number;
  additionalProperties?: boolean | OpenAPISchemaProperty;
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
      allOf?: any[];
      not?: any;
      items?: OpenAPISchemaProperty;
      minProperties?: number;
      maxProperties?: number;
      additionalProperties?: boolean | OpenAPISchemaProperty;
    }>;
  };
}

/**
 * Applies string validation rules to a Zod string schema
 */
function applyStringValidation(zodType: z.ZodString, prop: OpenAPISchemaProperty): z.ZodString {
  let result = zodType;
  
  if (prop.minLength !== undefined) {
    result = result.min(prop.minLength);
  }
  
  if (prop.maxLength !== undefined) {
    result = result.max(prop.maxLength);
  }
  
  if (prop.pattern) {
    try {
      const regex = new RegExp(prop.pattern);
      result = result.regex(regex);
    } catch (error) {
      // If regex is invalid, skip pattern validation
      console.warn(`Invalid regex pattern: ${prop.pattern}`);
    }
  }
  
  return result;
}

/**
 * Applies number validation rules to a Zod number schema
 */
function applyNumberValidation(zodType: z.ZodNumber, prop: OpenAPISchemaProperty): z.ZodType<any> {
  let result: z.ZodNumber | z.ZodEffects<z.ZodNumber> = zodType;
  
  if (prop.minimum !== undefined) {
    if (prop.exclusiveMinimum === true) {
      result = result.gt(prop.minimum);
    } else if (typeof prop.exclusiveMinimum === 'number') {
      result = result.gt(prop.exclusiveMinimum);
    } else {
      result = result.gte(prop.minimum);
    }
  }
  
  if (prop.maximum !== undefined) {
    if (prop.exclusiveMaximum === true) {
      result = result.lt(prop.maximum);
    } else if (typeof prop.exclusiveMaximum === 'number') {
      result = result.lt(prop.exclusiveMaximum);
    } else {
      result = result.lte(prop.maximum);
    }
  }
  
  if (prop.multipleOf !== undefined) {
    result = result.refine(
      (val) => val % prop.multipleOf! === 0,
      { message: `Must be a multiple of ${prop.multipleOf}` }
    );
  }
  
  return result;
}

/**
 * Applies array validation rules to a Zod array schema
 */
function applyArrayValidation(zodType: z.ZodArray<any>, prop: OpenAPISchemaProperty): z.ZodType<any> {
  let result: z.ZodArray<any> | z.ZodEffects<z.ZodArray<any>> = zodType;
  
  if (prop.minItems !== undefined) {
    result = result.min(prop.minItems);
  }
  
  if (prop.maxItems !== undefined) {
    result = result.max(prop.maxItems);
  }
  
  if (prop.uniqueItems === true) {
    result = result.refine(
      (arr) => arr.length === new Set(arr).size,
      { message: 'Array items must be unique' }
    );
  }
  
  return result;
}

/**
 * Applies object validation rules to a Zod object schema
 */
function applyObjectValidation(zodType: z.ZodObject<any>, prop: OpenAPISchemaProperty): z.ZodType<any> {
  let result: z.ZodObject<any> | z.ZodEffects<z.ZodObject<any>> = zodType;
  
  if (prop.minProperties !== undefined || prop.maxProperties !== undefined) {
    result = result.refine(
      (obj) => {
        const propertyCount = Object.keys(obj).length;
        if (prop.minProperties !== undefined && propertyCount < prop.minProperties) {
          return false;
        }
        if (prop.maxProperties !== undefined && propertyCount > prop.maxProperties) {
          return false;
        }
        return true;
      },
      { 
        message: `Object must have ${prop.minProperties || 0} to ${prop.maxProperties || 'unlimited'} properties` 
      }
    );
  }
  
  return result;
}

/**
 * Maps OpenAPI property to Zod schema with enhanced type support and validation rules
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
  // Handle allOf (intersection)
  else if (prop.allOf && Array.isArray(prop.allOf) && prop.allOf.length >= 2) {
    const intersectionTypes = prop.allOf.map((intersectionProp: any) => 
      mapOpenAPIPropertyToZod(intersectionProp, propName)
    );
    zodType = z.intersection(intersectionTypes[0], intersectionTypes[1]);
    for (let i = 2; i < intersectionTypes.length; i++) {
      zodType = z.intersection(zodType, intersectionTypes[i]);
    }
  }
  // Handle not (inverse)
  else if (prop.not) {
    const notType = mapOpenAPIPropertyToZod(prop.not, propName);
    zodType = z.any().refine(
      (val) => !notType.safeParse(val).success,
      { message: 'Value must not match the specified schema' }
    );
  }
  // Handle arrays
  else if (prop.type === 'array' && prop.items) {
    const itemType = mapOpenAPIPropertyToZod(prop.items, `${propName}Item`);
    zodType = z.array(itemType);
    zodType = applyArrayValidation(zodType as z.ZodArray<any>, prop);
  }
  // Handle objects
  else if (prop.type === 'object' || prop.properties) {
    if (prop.properties) {
      const objectProperties: Record<string, z.ZodType<any>> = {};
      for (const [key, value] of Object.entries(prop.properties)) {
        objectProperties[key] = mapOpenAPIPropertyToZod(value, key);
      }
      let objectSchema: z.ZodType<any> = z.object(objectProperties);
      
      // Make object strict if additionalProperties is false or maxProperties is set
      if (prop.additionalProperties === false || prop.maxProperties !== undefined) {
        objectSchema = (objectSchema as z.ZodObject<any>).strict();
      }
      
      // Apply object-level validation rules
      if (prop.minProperties !== undefined || prop.maxProperties !== undefined) {
        objectSchema = objectSchema.refine(
          (obj) => {
            const propertyCount = Object.keys(obj).length;
            if (prop.minProperties !== undefined && propertyCount < prop.minProperties) {
              return false;
            }
            if (prop.maxProperties !== undefined && propertyCount > prop.maxProperties) {
              return false;
            }
            return true;
          },
          { 
            message: `Object must have ${prop.minProperties || 0} to ${prop.maxProperties || 'unlimited'} properties` 
          }
        );
      }
      
      zodType = objectSchema;
    } else {
      zodType = z.record(z.any());
    }
  }
  // Handle basic types with format support and validation
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
        zodType = applyStringValidation(zodType as z.ZodString, prop);
        break;
      case 'number':
      case 'integer':
      case 'float':
      case 'decimal':
        zodType = z.number();
        zodType = applyNumberValidation(zodType as z.ZodNumber, prop);
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

    // Handle allOf (intersection)
    if (schema.allOf && Array.isArray(schema.allOf) && schema.allOf.length >= 2) {
      const intersectionTypes = schema.allOf.map((intersectionSchema: any) => {
        if (intersectionSchema.enum) {
          return z.enum(intersectionSchema.enum as [string, ...string[]]);
        }
        return mapOpenAPIPropertyToZod(intersectionSchema, name);
      });
      let intersectionSchema = z.intersection(intersectionTypes[0], intersectionTypes[1]);
      for (let i = 2; i < intersectionTypes.length; i++) {
        intersectionSchema = z.intersection(intersectionSchema, intersectionTypes[i]);
      }
      schemas[name] = intersectionSchema;
      continue;
    }

    // Handle not (inverse)
    if (schema.not) {
      const notType = mapOpenAPIPropertyToZod(schema.not, name);
      schemas[name] = z.any().refine(
        (val) => !notType.safeParse(val).success,
        { message: 'Value must not match the specified schema' }
      );
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
      
      let objectSchema: z.ZodType<any> = z.object(properties);
      
      // Make object strict if additionalProperties is false or maxProperties is set
      if (schema.additionalProperties === false || schema.maxProperties !== undefined) {
        objectSchema = (objectSchema as z.ZodObject<any>).strict();
      }
      
      // Apply object-level validation rules
      if (schema.minProperties !== undefined || schema.maxProperties !== undefined) {
        objectSchema = objectSchema.refine(
          (obj) => {
            const propertyCount = Object.keys(obj).length;
            if (schema.minProperties !== undefined && propertyCount < schema.minProperties) {
              return false;
            }
            if (schema.maxProperties !== undefined && propertyCount > schema.maxProperties) {
              return false;
            }
            return true;
          },
          { 
            message: `Object must have ${schema.minProperties || 0} to ${schema.maxProperties || 'unlimited'} properties` 
          }
        );
      }
      
      schemas[name] = objectSchema;
    } else {
      // Fallback for schemas without properties
      schemas[name] = z.any();
    }
  }
  
  return { schemas };
} 