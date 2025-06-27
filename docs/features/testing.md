# Testing

PEDAL automates testing at every stage of your workflow.

## Test Automation
- Run unit, integration, and end-to-end tests (e.g., pytest, Cypress, Selenium)
- Integrate tests into build and deploy pipelines

## Test Environments
- Spin up ephemeral containers for isolated testing
- Manage test data and environment variables

## Reporting
- Generate JUnit XML and HTML dashboards
- View test results in the web interface

## Zod Schema Generation Test Coverage

The Zod schema generation module is covered by a comprehensive suite of automated tests, ensuring correctness, robustness, and reliability. The test coverage includes:

### Unit Tests
- **Type Mapping:** Verifies correct mapping of OpenAPI types (string, number, boolean, array, object, enum, union, intersection) to Zod schemas.
- **Validation Rules:** Ensures all validation constraints (min/max length, pattern, min/max value, multipleOf, min/max items, unique items, min/max properties) are enforced.
- **Edge Cases:** Tests empty strings, arrays, and objects, as well as boundary values for all constraints.
- **Error Handling:** Checks that invalid input types, invalid regex patterns, and unsupported schema features are handled gracefully.

### Integration & Complex Scenarios
- **Nested Structures:** Validates deeply nested objects and arrays, including mixed required/optional fields.
- **Advanced Features:** Covers enum, union, intersection, and not/inverse validation logic.
- **Negative Testing:** Intentionally fails validation to ensure error messages are clear and accurate for all rules.

### Continuous Improvement
- The test suite is regularly expanded to cover new features, edge cases, and real-world OpenAPI schema examples.
- All tests are run in CI to prevent regressions and ensure ongoing reliability.

For details, see the test files in `src/pipeline/stages/__tests__/zod-generator.test.ts` and `zod-generator.integration.test.ts`.

## How to Run the Tests

PEDAL uses [Jest](https://jestjs.io/) for running all unit and integration tests, including Zod schema generation and other pipeline stages.

### Run All Tests
```bash
npm test
```

### Run a Specific Test File
```bash
npm test -- src/pipeline/stages/__tests__/zod-generator.test.ts
```

### Run with Coverage Report
```bash
npm test -- --coverage
```

For more details on Zod schema generation test coverage, see:
- `src/pipeline/stages/__tests__/README.md`

You can also use these commands for other test files in the pipeline or features directories.

---

> Next: [Deploying](deploying.md) 