import { Program } from "@typespec/compiler";
import { parsePRDToTypeSpec } from './prd-parser';
import { generateOASFromTypeSpec } from './oas-generator';
import { generateZodSchema } from '../stages/zod-generator';
import { setupDatabase } from '../stages/database-setup';
import { generateBackend } from '../stages/backend-generator';

export interface PipelineStage {
  name: string;
  description: string;
  execute: (input: any) => Promise<any>;
}

export const typespecPipelineStages: PipelineStage[] = [
  {
    name: 'prd-parser',
    description: 'Parse PRD and generate TypeSpec',
    execute: parsePRDToTypeSpec
  },
  {
    name: 'oas-generator',
    description: 'Generate OpenAPI spec from TypeSpec',
    execute: generateOASFromTypeSpec
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

export async function setupTypeSpecPipeline() {
  console.log('Initializing TypeSpec-based PEDAL pipeline...');
  
  // Create pipeline state
  let state: any = {};
  
  // Execute each stage in sequence
  for (const stage of typespecPipelineStages) {
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