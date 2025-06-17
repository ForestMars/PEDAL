import { Program } from "@typespec/compiler";
import { generateOpenAPI } from "@typespec/openapi";

export interface OpenAPISchema {
  openapi: string;
  info: {
    title: string;
    version: string;
    description?: string;
  };
  paths: Record<string, any>;
  components: {
    schemas: Record<string, any>;
  };
}

export async function generateOASFromTypeSpec(input: { program: Program }): Promise<{ oas: OpenAPISchema }> {
  const { program } = input;
  
  try {
    // Generate OpenAPI spec directly from TypeSpec
    const oas = await generateOpenAPI(program, {
      outputFile: "openapi.json",
      version: "3.0.0"
    });

    return { oas };
  } catch (error) {
    console.error('Error generating OAS from TypeSpec:', error);
    throw error;
  }
} 