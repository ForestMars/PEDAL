[![Build Status](https://github.com/ForestMars/PEDAL/actions/workflows/ci.yml/badge.svg)](https://github.com/ForestMars/PEDAL/actions)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Python 3.10+](https://img.shields.io/badge/python-3.10%2B-green.svg)](https://www.python.org/downloads/)
[![TypeScript](https://img.shields.io/badge/typescript-4.x-blue.svg)](https://www.typescriptlang.org/)

# PEDAL – Product Engineering Development Artifact Lifecycle

an end-to-end workflow engine that ingests product requirements and outputs a production‑ready backend stack

## table of contents

1. overview

2. key features

3. architecture

4. getting started

5. configuration

6. usage

7. examples

8. pipeline stages deep dive

9. folder structure

10. testing

11. deployment

12. roadmap

13. contributing

14. license

15. overview

---

PEDAL automates the transformation of a text‑based product requirements document (PRD) into
a fully coded backend implementation—complete with domain model, validation, database schema,
API specification, and boilerplate business logic and tests. it’s designed as a modular pipeline
so every stage can be inspected, swapped out, or extended, making it ideal for product‑focused
engineering teams that demand both speed and rigor.

2. key features

---

•  end‑to‑end automation from PRD to production‑ready TypeScript backend
•  AI‑driven domain extraction and event‑storming enrichment
•  auto‑generated OpenAPI (OAS) definitions and Zod validation schemas
•  one‑click Supabase setup and seed data population
•  fully typed, testable endpoint implementations
•  plugin‑style pipeline: add, remove, or customize stages
•  CLI commands and DevOps‑friendly shell scripts

3. architecture

---

PEDAL core is written in Python. it orchestrates a sequence of stages (see “pipeline stages deep dive” below).
generated artifacts live in a parallel TypeScript project that handles API routing, controllers, and tests.

```
       +-------------------+   
       |  PRD (markdown)   |   
       +---------+---------+   
                 |               
                 v               
       +-------------------+   
       | domain model gen  |   
       +---------+---------+   
                 |               
                 v               
       +-------------------+   
       | event storming    |   
       +---------+---------+   
                 |               
                 v               
       +-------------------+   
       | OpenAPI spec gen  |   
       +---------+---------+   
                 |               
                 v               
       +-------------------+   
       | Zod schema gen    |   
       +---------+---------+   
                 |               
                 v               
       +-------------------+   
       | Supabase provision|   
       +---------+---------+   
                 |               
                 v               
       +-------------------+   
       | TS backend + tests|   
       +-------------------+   
```

## 4. getting started

prerequisites
•  node.js 18+
•  npm or yarn
•  python 3.10+
•  docker (for local supabase)
•  an OpenAI API key

clone and install

```bash
git clone https://github.com/ForestMars/PEDAL.git  
cd PEDAL  
./install.sh       # installs Python & TS deps, sets up venv  
```

5. configuration

---

copy the example env file and fill in your secrets:

```bash
cp .env.example .env  
# open .env in your editor and set  
# OPENAI_API_KEY, SUPABASE_URL, SUPABASE_KEY, DATABASE_URL  
```

6. usage

---

run the full pipeline against a PRD file:

```bash
python src/index.py --input examples/sample-prd.md  
```

or in dev mode with live reload:

```bash
npm run dev           # kicks off TS server watching for changes  
python src/index.py   # generates artifacts into `api/` and `db/`  
```

7. examples

---

open `examples/sample-prd.md` for a starter PRD. after running the pipeline you’ll find:
•  `models/` – TypeScript interfaces and Zod schemas
•  `api/` – Express route handlers and OpenAPI docs
•  `db/` – SQL migration files and seed scripts

8. pipeline stages deep dive

---

1. PRD to domain model
   •  leverage OpenAI to parse free‑form text into entities and relationships

2. domain model enhancement
   •  apply event storming heuristics to assign behaviors (methods) to entities

3. OAS generation
   •  render an OpenAPI v3 YAML spec from the enriched domain model

4. Zod schema generation
   •  convert OAS definitions into TypeScript Zod validators for request/response

5. database population
   •  run migrations against Supabase and seed with example data

6. backend implementation
   •  scaffold Express controllers, repository layer, and automated Jest tests

7. folder structure

---

```
PEDAL/  
├─ airflow/          # optional DAG definitions for orchestration  
├─ artifacts/        # output from last pipeline run  
├─ examples/         # sample PRDs and expected output  
├─ src/  
│  ├─ pipeline/      # pipelined stage implementations  
│  ├─ models/        # internal Python DTOs  
│  ├─ api/           # TS project for serverless/Express  
│  ├─ db/            # SQL migrations and seed scripts  
│  ├─ utils/         # shared helper functions  
│  └─ index.py       # CLI entrypoint  
├─ .env.example      # sample environment config  
├─ install.sh        # bootstrap script  
├─ aaa.sh            # helper for local debugging  
├─ package.json      # TS dependencies and scripts  
├─ requirements.txt  # Python dependencies  
└─ tsconfig.json     # TS compiler options  
```

10. testing

---

run Python unit tests and TS tests in one command:

```bash
npm test  
pytest src/pipeline  
```

11. deployment

---

1. build the TS server: `npm run build`

2. dockerize with provided `Dockerfile`

3. push to container registry

4. deploy to your favorite cloud (Heroku, Vercel, AWS ECS)

5. roadmap

---

•  support for alternate AI providers
•  custom plugin hooks at each pipeline stage
•  UI dashboard for monitoring runs
•  multi‑tenant mode with RBAC

13. contributing

---

1. open an issue for any feature request or bug

2. fork the repo and branch from `main`

3. follow the code style (black + Prettier + ESLint)

4. write tests for new features

5. submit a pull request, referencing your issue

6. license

---

License: All Rights Reserved, Contiuum Software 
