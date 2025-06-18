import { Program, compile, NodeHost } from "@typespec/compiler";
// import { load as yamlLoad, YAMLNode, Kind, YAMLMapping, YAMLSequence } from 'yaml-ast-parser';
import fs from 'fs';
import path from 'path';

interface PRD {
  title: string;
  version: string;
  user_stories: Array<{
    title: string;
    as_a: string;
    i_want: string;
    so_that: string;
    scenarios: Array<{
      given: string;
      when: string;
      then: string;
    }>;
  }>;
}

interface ASTEntity {
  name: string;
  type: 'model' | 'enum' | 'interface';
  properties: Array<{
    name: string;
    type: string;
    description?: string;
    required: boolean;
    decorators?: string[];
  }>;
}

interface ASTRelationship {
  source: string;
  target: string;
  type: 'one-to-one' | 'one-to-many' | 'many-to-many';
  description?: string;
}

interface ASTOperation {
  name: string;
  entity: string;
  type: 'create' | 'read' | 'update' | 'delete' | 'list' | 'custom';
  parameters: Array<{
    name: string;
    type: string;
    required: boolean;
  }>;
  decorators?: string[];
}

interface AST {
  $schema: string;
  version: string;
  entities: ASTEntity[];
  relationships: ASTRelationship[];
  operations: ASTOperation[];
}

interface Diagnostic {
  message: string;
}

export async function parsePRDToTypeSpec(input: { prd?: string }): Promise<{ program: Program; ast: AST }> {
  if (!input.prd) {
    throw new Error('No PRD provided');
  }

  try {
    // For now, parse PRD as simple object (we'll fix yaml-ast-parser later)
    const prd = JSON.parse(input.prd) as PRD;
    
    // Generate intermediate AST
    const ast = generateAST(prd);
    
    // Save AST to artifacts/ast/new/
    const astDir = path.join('artifacts', 'ast', 'new');
    if (!fs.existsSync(astDir)) {
      fs.mkdirSync(astDir, { recursive: true });
    }
    
    const astFileName = `${prd.title.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}.json`;
    const astPath = path.join(astDir, astFileName);
    fs.writeFileSync(astPath, JSON.stringify(ast, null, 2));
    
    // Convert AST to TypeSpec code
    const typeSpecCode = generateTypeSpecFromAST(ast);
    
    // Write TypeSpec code to temporary file
    const tempFile = 'temp-main.tsp';
    fs.writeFileSync(tempFile, typeSpecCode);
    
    // Create TypeSpec program using node host
    const program = await compile(NodeHost, tempFile);
    
    // Clean up temp file
    fs.unlinkSync(tempFile);
    
    // Validate the program
    const diagnostics = program.diagnostics;
    if (diagnostics.length > 0) {
      throw new Error(`Invalid TypeSpec generated: ${diagnostics.map((d: Diagnostic) => d.message).join('\n')}`);
    }

    return { program, ast };
  } catch (error) {
    console.error('Error parsing PRD to TypeSpec:', error);
    throw error;
  }
}

function generateAST(prd: PRD): AST {
  const entities: ASTEntity[] = [];
  const relationships: ASTRelationship[] = [];
  const operations: ASTOperation[] = [];
  const entityNames = new Set<string>();

  // Convert user stories to entities
  prd.user_stories.forEach(story => {
    // Generate unique entity name from story title
    let entityName = generateUniqueEntityName(story.title, entityNames);
    entityNames.add(entityName);
    
    const entity: ASTEntity = {
      name: entityName,
      type: 'model',
      properties: [
        {
          name: 'id',
          type: 'string',
          description: 'Unique identifier',
          required: true,
          decorators: ['@key']
        }
      ]
    };

    // Add properties from scenarios
    story.scenarios.forEach(scenario => {
      const propertyName = generateUniquePropertyName(scenario.then, entity.properties.map(p => p.name));
      entity.properties.push({
        name: propertyName,
        type: 'string',
        description: `${scenario.given} ${scenario.when} ${scenario.then}`,
        required: true
      });
    });

    entities.push(entity);

    // Add basic CRUD operations for each entity
    const crudOperations = ['create', 'read', 'update', 'delete', 'list'];
    crudOperations.forEach(opType => {
      operations.push({
        name: `${opType}${entityName}`,
        entity: entityName,
        type: opType as any,
        parameters: opType === 'create' || opType === 'update' ? [
          { name: 'data', type: entityName, required: true }
        ] : opType === 'read' || opType === 'delete' ? [
          { name: 'id', type: 'string', required: true }
        ] : []
      });
    });
  });

  return {
    $schema: "http://json-schema.org/draft-07/schema#",
    version: prd.version,
    entities,
    relationships,
    operations
  };
}

function generateUniqueEntityName(storyTitle: string, existingNames: Set<string>): string {
  // Convert story title to camelCase entity name
  let baseName = storyTitle
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '') // Remove special characters
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join('');
  
  // Ensure it starts with a letter
  if (!/^[a-zA-Z]/.test(baseName)) {
    baseName = 'Entity' + baseName;
  }
  
  // If name already exists, add a number suffix
  let finalName = baseName;
  let counter = 1;
  while (existingNames.has(finalName)) {
    finalName = `${baseName}${counter}`;
    counter++;
  }
  
  return finalName;
}

function generateUniquePropertyName(scenarioThen: string, existingNames: string[]): string {
  // Extract meaningful property name from scenario
  let propertyName = scenarioThen
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '') // Remove special characters
    .split(' ')
    .filter(word => word.length > 2) // Filter out short words
    .slice(0, 3) // Take first 3 meaningful words
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join('');
  
  // Ensure it starts with a letter
  if (!/^[a-zA-Z]/.test(propertyName)) {
    propertyName = 'Property' + propertyName;
  }
  
  // If name already exists, add a number suffix
  let finalName = propertyName;
  let counter = 1;
  while (existingNames.includes(finalName)) {
    finalName = `${propertyName}${counter}`;
    counter++;
  }
  
  return finalName;
}

export function generateZodSchema(ast: AST): string {
  const imports = `import { z } from 'zod';`;
  
  const schemas = ast.entities.map(entity => {
    const properties: string[] = [];
    
    entity.properties.forEach(prop => {
      let zodType = 'z.string()';
      
      // Map TypeScript types to Zod types
      switch (prop.type.toLowerCase()) {
        case 'number':
        case 'int':
        case 'float':
          zodType = 'z.number()';
          break;
        case 'boolean':
          zodType = 'z.boolean()';
          break;
        case 'date':
          zodType = 'z.date()';
          break;
        case 'string':
        default:
          zodType = 'z.string()';
      }
      
      if (prop.required) {
        properties.push(`  ${prop.name}: ${zodType},`);
      } else {
        properties.push(`  ${prop.name}: ${zodType}.optional(),`);
      }
    });
    
    return `export const ${entity.name}Schema = z.object({
${properties.join('\n')}
});`;
  }).join('\n\n');
  
  const operations = ast.operations.map(op => {
    const params = op.parameters.map(param => {
      let zodType = 'z.string()';
      switch (param.type.toLowerCase()) {
        case 'number':
          zodType = 'z.number()';
          break;
        case 'boolean':
          zodType = 'z.boolean()';
          break;
        default:
          zodType = 'z.string()';
      }
      return param.required ? zodType : `${zodType}.optional()`;
    });
    
    return `export const ${op.name}Schema = z.object({
  ${op.parameters.map((param, i) => `${param.name}: ${params[i]}`).join(',\n  ')}
});`;
  }).join('\n\n');
  
  return `${imports}

${schemas}

${operations}

// Export types
${ast.entities.map(entity => `export type ${entity.name} = z.infer<typeof ${entity.name}Schema>;`).join('\n')}
${ast.operations.map(op => `export type ${op.name}Params = z.infer<typeof ${op.name}Schema>;`).join('\n')}
`;
}

function generateTypeSpecFromAST(ast: AST): string {
  const models = ast.entities.map(entity => {
    const properties = entity.properties.map(prop => {
      let decorators = '';
      if (prop.decorators) {
        decorators = prop.decorators.map(d => `  ${d}\n`).join('');
      }
      return `${decorators}  ${prop.name}${prop.required ? '' : '?'}: ${prop.type};`;
    }).join('\n');
    
    return `model ${entity.name} {
${properties}
}`;
  }).join('\n\n');

  return `
@service({
  title: "Generated from AST",
  version: "${ast.version}"
})
namespace GeneratedService;

${models}
`;
}

function convertASTToPRD(node: any): PRD {
  // Placeholder - will be implemented when yaml-ast-parser is fixed
  throw new Error('Not implemented yet');
}

function generateTypeSpec(prd: PRD): string {
  // Legacy function - now using generateTypeSpecFromAST
  const ast = generateAST(prd);
  return generateTypeSpecFromAST(ast);
} 