#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Use ts-node to handle TypeScript imports
require('ts-node/register');

// Import pipeline functions
const { parsePRDToTypeSpec } = require('../src/pipeline/typespec/prd-parser.ts');
const { generateOASFromAST } = require('../src/pipeline/typespec/oas-generator.ts');

async function runPipeline(prdPath) {
  console.log('🚀 Starting PEDAL Pipeline...');
  console.log(`📄 Processing PRD: ${prdPath}`);
  
  try {
    // Step 1: Read PRD
    const prdContent = fs.readFileSync(prdPath, 'utf8');
    const prd = JSON.parse(prdContent);
    
    console.log('✅ PRD loaded successfully');
    
    // Step 2: Parse PRD to TypeSpec and generate AST
    console.log('🔄 Converting PRD to TypeSpec and generating AST...');
    const { program, ast } = await parsePRDToTypeSpec({ prd: prdContent });
    
    console.log('✅ TypeSpec program created');
    console.log('✅ AST generated and saved to artifacts/ast/new/');
    console.log(`   • Entities: ${ast.entities.length}`);
    console.log(`   • Operations: ${ast.operations.length}`);
    
    // Step 3: Generate OpenAPI Specification
    console.log('🔄 Generating OpenAPI Specification...');
    const oasPath = await generateOASFromAST(ast, {
      title: prd.title,
      version: prd.version,
      description: `API generated from PRD: ${prd.title}`
    });
    
    console.log(`✅ OpenAPI Specification generated: ${oasPath}`);
    
    // Step 4: Generate Zod Schemas
    console.log('🔄 Generating Zod Schemas...');
    const { generateZodSchema } = require('../src/pipeline/typespec/prd-parser.ts');
    const zodSchema = generateZodSchema(ast);
    
    const zodDir = path.join('artifacts', 'zod');
    if (!fs.existsSync(zodDir)) {
      fs.mkdirSync(zodDir, { recursive: true });
    }
    
    const zodPath = path.join(zodDir, `${prd.title.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}.ts`);
    fs.writeFileSync(zodPath, zodSchema);
    
    console.log(`✅ Zod Schema generated: ${zodPath}`);
    
    // Step 5: Move AST to done directory
    const astNewDir = path.join('artifacts', 'ast', 'new');
    const astDoneDir = path.join('artifacts', 'ast', 'done');
    
    if (!fs.existsSync(astDoneDir)) {
      fs.mkdirSync(astDoneDir, { recursive: true });
    }
    
    const astFiles = fs.readdirSync(astNewDir)
      .filter(file => file.endsWith('.json'))
      .map(file => path.join(astNewDir, file));
    
    astFiles.forEach(astFile => {
      const fileName = path.basename(astFile);
      const donePath = path.join(astDoneDir, fileName);
      fs.renameSync(astFile, donePath);
      console.log(`✅ Moved AST to done: ${donePath}`);
    });
    
    // Summary
    console.log('\n🎉 Pipeline completed successfully!');
    console.log('📊 Generated artifacts:');
    console.log(`   • AST: artifacts/ast/done/`);
    console.log(`   • TypeSpec: Generated in memory`);
    console.log(`   • OpenAPI: ${oasPath}`);
    console.log(`   • Zod Schema: ${zodPath}`);
    
    return {
      ast,
      program,
      oasPath,
      zodPath
    };
    
  } catch (error) {
    console.error('❌ Pipeline failed:', error);
    
    // Move failed AST to failed directory if it exists
    const astNewDir = path.join('artifacts', 'ast', 'new');
    if (fs.existsSync(astNewDir)) {
      const astFiles = fs.readdirSync(astNewDir)
        .filter(file => file.endsWith('.json'))
        .map(file => path.join(astNewDir, file));
      
      if (astFiles.length > 0) {
        const astFailedDir = path.join('artifacts', 'ast', 'failed');
        if (!fs.existsSync(astFailedDir)) {
          fs.mkdirSync(astFailedDir, { recursive: true });
        }
        
        astFiles.forEach(astFile => {
          const fileName = path.basename(astFile);
          const failedPath = path.join(astFailedDir, fileName);
          fs.renameSync(astFile, failedPath);
          console.log(`❌ Moved failed AST to: ${failedPath}`);
        });
      }
    }
    
    throw error;
  }
}

// Run if called directly
if (require.main === module) {
  const prdPath = process.argv[2];
  
  if (!prdPath) {
    console.error('❌ Please provide a PRD file path');
    console.log('Usage: node scripts/run-pipeline.js <prd-file-path>');
    console.log('Example: node scripts/run-pipeline.js examples/test-pipeline.prd.json');
    process.exit(1);
  }
  
  if (!fs.existsSync(prdPath)) {
    console.error(`❌ PRD file not found: ${prdPath}`);
    process.exit(1);
  }
  
  runPipeline(prdPath).catch(error => {
    console.error('❌ Pipeline execution failed:', error);
    process.exit(1);
  });
}

module.exports = { runPipeline }; 