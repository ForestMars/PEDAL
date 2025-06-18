import { Program } from "@typespec/compiler";
import { resolve } from "path";
import fs from 'fs';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export interface OASGeneratorOptions {
  outputDir?: string;
  filename?: string;
  version?: string;
  title?: string;
  description?: string;
}

export async function generateOAS(
  program: Program, 
  options: OASGeneratorOptions = {}
): Promise<string> {
  const {
    outputDir = 'artifacts/oas',
    filename = 'api-spec',
    version = '1.0.0',
    title = 'Generated API',
    description = 'API generated from PRD via TypeSpec'
  } = options;

  try {
    // Create output directory
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    // Write TypeSpec code to temporary file
    const tempFile = 'temp-typespec.tsp';
    const typeSpecCode = generateTypeSpecFromProgram(program);
    fs.writeFileSync(tempFile, typeSpecCode);

    // Use TypeSpec CLI to generate OpenAPI
    const outputPath = resolve(outputDir, `${filename}.json`);
    const command = `npx typespec compile ${tempFile} --emit @typespec/openapi --output-dir ${outputDir}`;
    
    await execAsync(command);
    
    // Clean up temp file
    fs.unlinkSync(tempFile);

    console.log(`Generated OpenAPI specification: ${outputPath}`);
    return outputPath;
  } catch (error) {
    console.error('Error generating OpenAPI specification:', error);
    throw error;
  }
}

function generateTypeSpecFromProgram(program: Program): string {
  // Extract TypeSpec code from the program
  // This is a simplified approach - in practice, you'd want to traverse the program AST
  return `
@service({
  title: "Generated API",
  version: "1.0.0"
})
namespace GeneratedService;

// This would be populated from the actual program AST
model Example {
  id: string;
  name: string;
}
`;
}

export async function generateOASFromAST(ast: any, options: OASGeneratorOptions = {}): Promise<string> {
  // First convert AST to TypeSpec, then generate OAS
  const { parsePRDToTypeSpec } = await import('./prd-parser');
  
  // Convert AST back to PRD format for the parser
  const prdData = {
    title: ast.title || 'Generated API',
    version: ast.version || '1.0.0',
    user_stories: ast.entities.map((entity: any) => ({
      title: entity.name,
      as_a: 'user',
      i_want: `to manage ${entity.name}`,
      so_that: 'I can interact with the system',
      scenarios: entity.properties
        .filter((prop: any) => prop.name !== 'id')
        .map((prop: any) => ({
          given: `I have a ${entity.name}`,
          when: `I access the ${prop.name} property`,
          then: `I get the ${prop.name} value`
        }))
    }))
  };

  const { program } = await parsePRDToTypeSpec({ prd: JSON.stringify(prdData) });
  
  return generateOAS(program, options);
}

export function validateOAS(oasPath: string): boolean {
  try {
    const oasContent = fs.readFileSync(oasPath, 'utf8');
    const oas = JSON.parse(oasContent);
    
    // Basic OpenAPI 3.0 validation
    if (!oas.openapi || !oas.openapi.startsWith('3.')) {
      throw new Error('Invalid OpenAPI version');
    }
    
    if (!oas.info || !oas.info.title) {
      throw new Error('Missing required info.title');
    }
    
    if (!oas.paths) {
      throw new Error('Missing paths object');
    }
    
    console.log(`OpenAPI specification is valid: ${oasPath}`);
    return true;
  } catch (error) {
    console.error(`Invalid OpenAPI specification: ${error}`);
    return false;
  }
} 