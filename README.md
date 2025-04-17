# PEDAL - Product Engineering Development Artifact Lifecycle

A minimal implementation of the PEDAL workflow management app that transforms Product Requirements Documents (PRD) into working backend implementations.

## Pipeline Stages

1. **PRD to Domain Model**: Parses PRD and extracts domain entities using AI
2. **Domain Model Enhancement**: Adds verbs/methods through event storming
3. **OAS Generation**: Creates OpenAPI specification from domain model
4. **Zod Schema Generation**: Converts OAS to Zod validation schemas
5. **Database Population**: Sets up Supabase with the generated schema
6. **Backend Implementation**: Generates TypeScript backend with tests

## Project Structure

```
src/
├── pipeline/           # Pipeline stage implementations
├── models/            # Domain models and schemas
├── api/               # API endpoints
├── db/                # Database configuration
├── utils/             # Utility functions
└── index.ts           # Application entry point
```

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Configure environment variables:
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

## Development

- `npm run dev`: Start development server
- `npm run build`: Build the project
- `npm test`: Run tests

## Environment Variables

- `OPENAI_API_KEY`: OpenAI API key for PRD parsing
- `SUPABASE_URL`: Supabase project URL
- `SUPABASE_KEY`: Supabase API key
- `DATABASE_URL`: PostgreSQL connection string 