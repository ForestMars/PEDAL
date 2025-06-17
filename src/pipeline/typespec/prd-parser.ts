import { Program, createProgram } from "@typespec/compiler";
import { load as yamlLoad, YAMLNode, Kind } from 'yaml-ast-parser';
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

export async function parsePRDToTypeSpec(input: { prd?: string }): Promise<{ program: Program }> {
  if (!input.prd) {
    throw new Error('No PRD provided');
  }

  try {
    // Parse PRD YAML into AST
    const ast = yamlLoad(input.prd);
    if (!ast || ast.kind !== Kind.MAP) {
      throw new Error('Invalid PRD format: root must be a map');
    }

    // Convert AST to structured object
    const prd = convertASTToPRD(ast);
    
    // Convert PRD structure to TypeSpec code
    const typeSpecCode = generateTypeSpec(prd);
    
    // Create TypeSpec program
    const program = await createProgram(typeSpecCode);
    
    // Validate the program
    const diagnostics = program.diagnostics;
    if (diagnostics.length > 0) {
      throw new Error(`Invalid TypeSpec generated: ${diagnostics.map(d => d.message).join('\n')}`);
    }

    return { program };
  } catch (error) {
    console.error('Error parsing PRD to TypeSpec:', error);
    throw error;
  }
}

function convertASTToPRD(node: YAMLNode): PRD {
  if (node.kind !== Kind.MAP) {
    throw new Error('Expected map node');
  }

  const prd: PRD = {
    title: '',
    version: '',
    user_stories: []
  };

  for (const mapping of node.mappings) {
    const key = mapping.key.value;
    const value = mapping.value;

    switch (key) {
      case 'title':
        prd.title = value.value;
        break;
      case 'version':
        prd.version = value.value;
        break;
      case 'user_stories':
        if (value.kind !== Kind.SEQ) {
          throw new Error('user_stories must be a sequence');
        }
        prd.user_stories = value.items.map(item => {
          if (item.kind !== Kind.MAP) {
            throw new Error('Each user story must be a map');
          }
          const story: any = {};
          for (const storyMapping of item.mappings) {
            const storyKey = storyMapping.key.value;
            const storyValue = storyMapping.value;
            
            if (storyKey === 'scenarios') {
              if (storyValue.kind !== Kind.SEQ) {
                throw new Error('scenarios must be a sequence');
              }
              story[storyKey] = storyValue.items.map(scenario => {
                if (scenario.kind !== Kind.MAP) {
                  throw new Error('Each scenario must be a map');
                }
                const scenarioObj: any = {};
                for (const scenarioMapping of scenario.mappings) {
                  scenarioObj[scenarioMapping.key.value] = scenarioMapping.value.value;
                }
                return scenarioObj;
              });
            } else {
              story[storyKey] = storyValue.value;
            }
          }
          return story;
        });
        break;
    }
  }

  return prd;
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