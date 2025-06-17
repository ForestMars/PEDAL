/**  
 * @fileoverview Given a PRD meeting our requirements we generate a domain model (currently using a general purpose LLM)
 * @version 0.0.1
 * @license All rights reserved, Continuum Software
 * 
 * @TODO We want to be able to swap out AI providers easily. 

 */ 

import OpenAI from 'openai';
import { z } from 'zod';

// Define the schema for domain entities
const DomainEntitySchema = z.object({
  name: z.string(),
  description: z.string(),
  attributes: z.array(z.object({
    name: z.string(),
    type: z.string(),
    description: z.string().optional(),
    required: z.boolean().optional()
  })),
  relationships: z.array(z.object({
    target: z.string(),
    type: z.enum(['one-to-one', 'one-to-many', 'many-to-many']),
    description: z.string().optional()
  })).optional()
});

export type DomainEntity = z.infer<typeof DomainEntitySchema>;

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export async function parsePRD(input: { prd?: string }): Promise<{ entities: DomainEntity[] }> {
  if (!input.prd) {
    throw new Error('No PRD provided');
  }

  try {
    // Use OpenAI to extract domain entities from PRD
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are a domain model extraction assistant. Extract domain entities and their relationships from the provided PRD. Return the response in JSON format matching the DomainEntitySchema."
        },
        {
          role: "user",
          content: input.prd
        }
      ],
      response_format: { type: "json_object" }
    });

    // Parse and validate the response
    const response = JSON.parse(completion.choices[0].message.content || '{}');
    const entities = DomainEntitySchema.array().parse(response.entities || []);

    return { entities };
  } catch (error) {
    console.error('Error parsing PRD:', error);
    throw error;
  }
} 