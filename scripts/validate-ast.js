#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const Ajv = require('ajv');
const addFormats = require('ajv-formats');
const yaml = require('js-yaml');

const SCHEMA_FILE = 'ast-schema.yaml';

// Initialize Ajv
const ajv = new Ajv({ allErrors: true, strict: false });
addFormats(ajv);

// Load schema
const schemaPath = path.join(__dirname, '../schema', SCHEMA_FILE);
const schema = yaml.load(fs.readFileSync(schemaPath, 'utf8'));

// Create validator
const validate = ajv.compile(schema);

// Get AST file path from command line argument
const astPath = process.argv[2];
if (!astPath) {
  console.error('Please provide an AST file path');
  process.exit(1);
}

try {
  // Load and parse AST
  const ast = yaml.load(fs.readFileSync(astPath, 'utf8'));
  
  // Validate
  const valid = validate(ast);
  
  if (valid) {
    console.log('✅ AST is valid');
    process.exit(0);
  } else {
    console.error('❌ AST is invalid:');
    console.error(validate.errors);
    process.exit(1);
  }
} catch (error) {
  console.error('Error:', error.message);
  process.exit(1);
} 