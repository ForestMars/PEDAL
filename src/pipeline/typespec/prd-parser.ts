import { Program, compile, NodeHost } from "@typespec/compiler";
// import { load as yamlLoad, YAMLNode, Kind, YAMLMapping, YAMLSequence } from 'yaml-ast-parser';
import fs from 'fs';

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

interface Diagnostic {
  message: string;
}

export async function parsePRDToTypeSpec(input: { prd?: string }): Promise<{ program: Program }> {
  if (!input.prd) {
    throw new Error('No PRD provided');
  }

  try {
    // For now, parse PRD as simple object (we'll fix yaml-ast-parser later)
    const prd = JSON.parse(input.prd) as PRD;
    
    // Convert PRD structure to TypeSpec code
    const typeSpecCode = generateTypeSpec(prd);
    
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

    return { program };
  } catch (error) {
    console.error('Error parsing PRD to TypeSpec:', error);
    throw error;
  }
}

function convertASTToPRD(node: any): PRD {
  // Placeholder - will be implemented when yaml-ast-parser is fixed
  throw new Error('Not implemented yet');
}

function generateTypeSpec(prd: PRD): string {
  // Convert PRD structure to TypeSpec code
  const models = prd.user_stories.map(story => {
    const modelName = story.title.split(' ')[0]; // Simple heuristic, could be improved
    return `
@doc("${story.as_a} wants to ${story.i_want} so that ${story.so_that}")
model ${modelName} {
  @key
  id: string;
  
  ${story.scenarios.map(scenario => 
    `@doc("${scenario.given} ${scenario.when} ${scenario.then}")
    ${scenario.then.toLowerCase().split(' ')[0]}: string;`
  ).join('\n  ')}
}`;
  }).join('\n\n');

  return `
@service({
  title: "${prd.title}",
  version: "${prd.version}"
})
namespace ${prd.title.toLowerCase().replace(/\s+/g, '')};

${models}
`;
} 