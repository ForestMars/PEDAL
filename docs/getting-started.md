# Getting Started with PEDAL

Get up and running with PEDAL in minutes. Follow these steps to generate backend artifacts from a Product Requirements Document (PRD).

---

## 1. Prerequisites
- Node.js (version 18+ recommended)
- npm or yarn

---

## 2. Installation
```bash
git clone https://github.com/ForestMars/PEDAL.git
cd PEDAL
npm install
```

---

## 3. Validate a PRD (Recommended)
Check that your PRD meets all requirements:
```bash
node scripts/validate-prd.js --input examples/sample.prd
```
- To use your own PRD, see [PRD Requirements](../prd-requirements/index.md).

---

## 4. Run the Pipeline
Generate OpenAPI, Zod schemas, and backend artifacts:
```bash
node scripts/run-pipeline.js --input examples/sample.prd
```

---

## 5. Inspect the Output
- Artifacts are generated in the `artifacts/` directory and related folders.
- You'll find the OpenAPI spec, Zod schemas, and backend code ready for use.

---

## 6. Next Steps
- To use your own PRD, follow the [PRD Requirements](../prd-requirements/index.md) and [Hybrid User Story Format](../prd-requirements/user-story-format.md).
- For troubleshooting, see [Troubleshooting](../troubleshooting/common-issues.md).
- To run tests:
  ```bash
  npm test
  ```

---

For more details, see the full documentation in the sidebar. 