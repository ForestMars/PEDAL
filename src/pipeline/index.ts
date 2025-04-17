import { parsePRD } from './stages/prd-parser';
import { enhanceDomainModel } from './stages/domain-enhancer';
import { generateOAS } from './stages/oas-generator';
import { generateZodSchema } from './stages/zod-generator';
import { setupDatabase } from './stages/database-setup';
import { generateBackend } from './stages/backend-generator';

export interface PipelineStage {
  name: string;
  description: string;
  execute: (input: any) => Promise<any>;
}

export const pipelineStages: PipelineStage[] = [
  {
    name: 'prd-parser',
    description: 'Parse PRD and extract domain entities using AI',
    execute: parsePRD
  },
  {
    name: 'domain-enhancer',
    description: 'Add verbs/methods through event storming',
    execute: enhanceDomainModel
  },
  {
    name: 'oas-generator',
    description: 'Create OpenAPI specification from domain model',
    execute: generateOAS
  },
  {
    name: 'zod-generator',
    description: 'Convert OAS to Zod validation schemas',
    execute: generateZodSchema
  },
  {
    name: 'database-setup',
    description: 'Set up Supabase with the generated schema',
    execute: setupDatabase
  },
  {
    name: 'backend-generator',
    description: 'Generate TypeScript backend with tests',
    execute: generateBackend
  }
];

export async function setupPipeline() {
  console.log('Initializing PEDAL pipeline...');
  
  // Create pipeline state
  let state: any = {};
  
  // Execute each stage in sequence
  for (const stage of pipelineStages) {
    try {
      console.log(`Executing stage: ${stage.name}`);
      state = await stage.execute(state);
      console.log(`Completed stage: ${stage.name}`);
    } catch (error) {
      console.error(`Error in stage ${stage.name}:`, error);
      throw error;
    }
  }
  
  return state;
} 