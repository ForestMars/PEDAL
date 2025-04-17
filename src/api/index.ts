import express from 'express';
import { OpenAPISchema } from '../pipeline/stages/oas-generator';
import { DomainMethod } from '../pipeline/stages/domain-enhancer';

export function setupApi(app: express.Application, input?: {
  oas: OpenAPISchema;
  methods: Record<string, DomainMethod[]>;
}) {
  // Health check endpoint
  app.get('/health', (req, res) => {
    res.json({ status: 'ok' });
  });
  
  // If we have the OAS and methods, set up the API routes
  if (input) {
    const { oas, methods } = input;
    
    // Set up routes for each method
    for (const [entityName, entityMethods] of Object.entries(methods)) {
      for (const method of entityMethods) {
        const path = method.name.toLowerCase();
        const httpMethod = method.isQuery ? 'get' : 'post';
        
        app[httpMethod](`/api/${path}`, async (req, res) => {
          try {
            // Import the generated function
            const { [method.name]: handler } = await import(`../functions/${entityName.toLowerCase()}`);
            
            // Execute the function
            const result = await handler(...Object.values(req.body));
            
            // Return the result
            res.json(result);
          } catch (error) {
            console.error(`Error in ${method.name}:`, error);
            res.status(500).json({ error: 'Internal server error' });
          }
        });
      }
    }
  }
} 