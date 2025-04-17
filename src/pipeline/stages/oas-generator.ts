import { DomainEntity, DomainMethod } from './domain-enhancer';

interface OpenAPISchema {
  openapi: string;
  info: {
    title: string;
    version: string;
    description: string;
  };
  paths: Record<string, any>;
  components: {
    schemas: Record<string, any>;
  };
}

export async function generateOAS(input: {
  entities: DomainEntity[];
  methods: Record<string, DomainMethod[]>;
}): Promise<{ oas: OpenAPISchema }> {
  const { entities, methods } = input;
  
  const oas: OpenAPISchema = {
    openapi: '3.0.0',
    info: {
      title: 'PEDAL Generated API',
      version: '1.0.0',
      description: 'API generated from domain model'
    },
    paths: {},
    components: {
      schemas: {}
    }
  };
  
  // Generate schemas for each entity
  for (const entity of entities) {
    oas.components.schemas[entity.name] = {
      type: 'object',
      properties: {
        id: {
          type: 'string',
          description: 'Unique identifier'
        },
        ...entity.attributes.reduce((props, attr) => ({
          ...props,
          [attr.name]: {
            type: attr.type.toLowerCase(),
            description: attr.description
          }
        }), {})
      },
      required: ['id', ...entity.attributes.filter(a => a.required).map(a => a.name)]
    };
  }
  
  // Generate paths for each method
  for (const [entityName, entityMethods] of Object.entries(methods)) {
    for (const method of entityMethods) {
      const path = method.name.toLowerCase();
      const httpMethod = method.isQuery ? 'get' : 'post';
      
      oas.paths[`/${path}`] = {
        [httpMethod]: {
          summary: method.description,
          operationId: method.name,
          parameters: method.parameters?.map(param => ({
            name: param.name,
            in: 'query',
            required: param.required,
            schema: {
              type: param.type.toLowerCase()
            }
          })) || [],
          requestBody: method.isCommand ? {
            required: true,
            content: {
              'application/json': {
                schema: {
                  $ref: `#/components/schemas/${entityName}`
                }
              }
            }
          } : undefined,
          responses: {
            '200': {
              description: 'Success',
              content: method.returnType ? {
                'application/json': {
                  schema: {
                    $ref: `#/components/schemas/${method.returnType}`
                  }
                }
              } : undefined
            },
            '400': {
              description: 'Bad Request'
            },
            '404': {
              description: 'Not Found'
            }
          }
        }
      };
    }
  }
  
  return { oas };
} 