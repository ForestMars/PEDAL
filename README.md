[![Build Status](https://github.com/ForestMars/PEDAL/actions/workflows/ci.yml/badge.svg)](https://github.com/ForestMars/PEDAL/actions)
[![Python 3.10+](https://img.shields.io/badge/python-3.10%2B-green.svg)](https://www.python.org/downloads/)
[![TypeScript](https://img.shields.io/badge/typescript-4.x-blue.svg)](https://www.typescriptlang.org/)

# Product Engineering Development Automation Lifecycle (PEDAL)

#### an end-to-end workflow engine that ingests product requirements and outputs a production‑ready backend stack

Full documentation at [https://pedal.gitbook.io/docs](https://pedal.gitbook.io/docs)

PEDAL automates the journey from a Product Requirements Document (PRD) to a fully coded backend.  Think of it as a *staff engineer* who parses requirements and scaffolds code, without any dicey AI. (No shade) Every transformation in PEDAL (excluding the initial PRD validation) is fully deterministic and formally verifiable.  The system runs as a modular pipeline: each stage is implemented in code (Typescript/Python core, see below) and output is predictable and auditable.  This makes PEDAL ideal for product-focused teams that demand both speed and rigor.

## Architecture & Design Principles

PEDAL’s core orchestrates a sequence of pipeline stages.  Each stage takes a well-defined input and produces a verifiable output.  For example, one stage generates the domain model; another runs *event-storming* heuristics to attach behaviors to entities; subsequent stages emit an OpenAPI spec and Zod schemas; then the database (Supabase) is provisioned and seeded; finally, a TypeScript backend (Express routes, controllers, and tests) is scaffolded.  All generated artifacts live in a parallel TypeScript project that handles API routing, controllers, and tests.  Because every step is just code, you can inspect, swap out, or extend any stage (plugin-style) without breaking the chain.  In short: no black-box magic, just clear, composable transformations.

* **Deterministic Pipeline.** PEDAL uses no stochastic AI in its core transforms.  (We may optionally invoke an LLM *only* to massage any sprawling PRD text into a consistent format for parsing – but every pipeline transformation itself is rule-based and repeatable.)  This means the same PRD will always yield the same domain model, API spec, and code, making results *formally verifiable*. PEDAL includes unit tests for the Python pipeline (`pytest src/pipeline`) and for the generated TypeScript (`npm test`), ensuring every piece works as intended.
* **Domain-Driven Design.** The pipeline builds an internal *domain model* of your application entities from the PRD.  Behaviors (methods/events) are attached via event-storming heuristics, and then the enriched model drives everything that follows.  This enforces a clear separation of concerns between *what your system is* (the model) and *how it works* (the generated code).
* **Full Type Safety.** Outputs are fully typed. PEDAL auto-generates OpenAPI (Swagger) definitions and matching Zod validation schemas.  The TypeScript backend code uses these Zod schemas for request/response validation, ensuring type safety end-to-end.  The generated Express routes, controllers, and repository layer are strongly typed and come with Jest tests out of the box.
* **Infrastructure as Code.** Database schema and seed data are managed with Supabase. PEDAL auto-runs migrations and seeds against a Supabase project.  In practice you get SQL migration scripts and seed files alongside your TypeScript artifacts (see `db/` folder), so spinning up or resetting the database is a one-click affair. This eliminates manual DB setup and keeps schema, API, and code in sync.

## Pipeline Stages (End‑to‑End Flow)

PEDAL’s workflow is sequential.  Given a markdown PRD, it executes stages in order:

1. **PRD → Domain Model:** Parse the PRD text into domain entities and relationships. (This may use a simple NLP assistant to normalize the text, but once tokenized the extraction is pure code.)
2. **Enhance Domain Model:** Run event-storming heuristics to assign verbs/methods (aggregate behaviors) to each entity. This transforms a passive data model into an active, behavior-rich model.
3. **OpenAPI Spec Generation:** Render an OpenAPI v3 YAML/JSON spec from the enriched domain model. This becomes the API contract.
4. **Zod Schema Generation:** Convert the OpenAPI spec schemas into TypeScript/Zod validation schemas. These will validate incoming requests and outgoing responses in the API.
5. **Database Provisioning:** Use the domain model to create database migrations and seed scripts. PEDAL runs these against Supabase (or any PostgreSQL via the `DATABASE_URL`), setting up tables and inserting example data.
6. **Backend Implementation:** Scaffold the TypeScript backend: Express route handlers, a repository layer, and automated Jest tests are generated based on the model. All code is fully typed. In a nutshell, you end up with a ready-to-run API server.

After running the full pipeline, you’ll find the outputs neatly organized: **`models/`** (domain models), **`schema/`** (Zod schemas), **`api/`** (OAS spec),**`backend/`** TypeScript interfaces), and **`db/`** (SQL migrations and seed scripts).  The generated API matches your PRD’s intent, and the accompanying test suite exercises every endpoint. (Now you can use all the AI you want to build a frontend client for your fully determinant backend.)

## Usage & Best Practices

* **Prerequisites:** Node.js 18+ (npm or yarn), Python 3.10+, and Docker (for running Supabase locally).  (An OpenAI API key is optional if you want PRD-shaping assistance.)
* **Installation:** Clone the repo and bootstrap dependencies:

  ```bash
  git clone https://github.com/ForestMars/PEDAL.git  
  cd PEDAL  
  ./install.sh      # installs Python & TS deps, sets up virtual env and tooling
  ```
* **Configuration:** Copy the example env file and set your credentials:

  ```bash
  cp .env.example .env
  # Then edit .env:
  #   SUPABASE_URL, SUPABASE_KEY, DATABASE_URL (Postgres connection) 
  #   [Optional] OPENAI_API_KEY if using PRD normalization
  ```
* **Running the Pipeline:** Use the Python CLI to run the pipeline on a PRD markdown file. For example:

  ```bash
  python src/index.py --input examples/sample-prd.md
  ```

  This executes all stages and writes outputs into the project folders. For a live development setup (auto-regenerating code on changes), you can run:

  ```bash
  npm run dev        # starts TS dev server (restarting on file changes)
  python src/index.py   # run pipeline; updates `api/`, `models/`, `db/` as you edit
  ```
* **Inspecting Outputs:** After execution, check the `api/` folder for generated OpenAPI docs, `backend/` for interfaces and validators, `db/` for SQL migrations, etc. Run `npm test` and `pytest src/pipeline` to execute the full test suite.
* **Extending the Pipeline:** PEDAL is designed to be modified. You can write custom pipeline stages or tweak the existing ones in `src/pipeline/` (Python) and adjust templates under `src/api/` or `src/db/` for tailored code generation. The plugin-style architecture means adding a stage or altering behavior doesn’t require hacking the core; just implement the stage and register it.

## Determinism & Verifiability

PEDAL deliberately avoids any non-deterministic behavior.  There’s no random seed or AI “black box” deciding your schema; every transformation is an explicit algorithm. This means reproducibility: running the pipeline twice on the same PRD yields identical results. It also means verifiability: you can review and formally reason about each stage.  Need proof? The pipeline code lives in Python (with type-annotated data models) and comes with unit tests. The TypeScript side uses Zod schemas so invalid inputs are caught at compile-time or runtime, making the overall system very robust.

As a result, PEDAL is not just a factory of code; it’s a transparent design tool. You can point to any piece of logic (in the Python or generated TS code) and understand why a particular endpoint exists or why a field is required. This level of rigor is crucial when building enterprise-grade products: you get both the speed of auto-generation and the confidence of formal correctness.

## Examples

The `examples/` folder contains a sample PRD (more to come) and their expected outputs. Try running the pipeline on `examples/sample-prd.md` to see how the pieces fit together. You’ll see that adding a new entity or field in the PRD automatically appears as a TypeScript interface, a Zod rule, an OpenAPI schema, and a database column after generation. This end-to-end traceability is the core promise of PEDAL.

## License & Contributing

License: All Rights Reserved, Continuum Software

> *Disclaimer:* PEDAL generates code automatically, but it’s still *your* codebase. Always review generated migrations and business logic to ensure they match your product’s needs. Trust, but verify.
