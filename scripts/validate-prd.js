#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const Ajv = require('ajv');
const addFormats = require('ajv-formats');
const yaml = require('js-yaml');

// Initialize Ajv
const ajv = new Ajv({ allErrors: true, strict: false });
addFormats(ajv);

// Load schema
const schemaPath = path.join(__dirname, '../schema/prd-schema.yaml');
const schema = yaml.load(fs.readFileSync(schemaPath, 'utf8'));

// Create validator
const validate = ajv.compile(schema);

// Get PRD file path from command line argument
const prdPath = process.argv[2];
if (!prdPath) {
  console.error('Please provide a PRD file path');
  process.exit(1);
}

try {
  // Load and parse PRD
  const prd = yaml.load(fs.readFileSync(prdPath, 'utf8'));
  
  // Validate
  const valid = validate(prd);
  
  if (valid) {
    console.log('✅ PRD is valid');
    process.exit(0);
  } else {
    console.error('❌ PRD is invalid:');
    console.error(validate.errors);
    process.exit(1);
  }
} catch (error) {
  console.error('Error:', error.message);
  process.exit(1);
} 