import { Program, createTypeSpecProgram } from "@typespec/compiler";
import OpenAI from 'openai';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export async function parsePRDToTypeSpec(input: { prd?: string }): Promise<{ program: Program }> {
  if (!input.prd) {
    throw new Error('No PRD provided');
  }

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: `You are a TypeSpec generation assistant. Convert the PRD into TypeSpec code.
          Follow these rules:
          1. Use @doc decorators for descriptions
          2. Use @key decorators for unique fields
          3. Use proper TypeSpec types (string, int32, etc)
          4. Include proper relationships using @relationship decorators
          5. Include proper HTTP operations using @http decorators
          6. Follow REST API best practices
          7. Use proper namespaces and models
          8. Include proper validation rules
          Return only the TypeSpec code, no explanations.`
        },
        {
          role: "user",
          content: input.prd
        }
      ]
    });

    const typeSpecCode = completion.choices[0].message.content;
    
    // Create TypeSpec program
    const program = await createTypeSpecProgram(typeSpecCode);
    
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