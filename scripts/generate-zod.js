#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Import the generateZodSchema function from the parser
const { generateZodSchema } = require('../src/pipeline/typespec/prd-parser.ts');

function generateZodFromAST(astPath, outputDir) {
  try {
    // Read AST file
    const astContent = fs.readFileSync(astPath, 'utf8');
    const ast = JSON.parse(astContent);
    
    // Generate Zod schema
    const zodSchema = generateZodSchema(ast);
    
    // Create output directory if it doesn't exist
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    
    // Generate output filename
    const baseName = path.basename(astPath, '.json');
    const outputPath = path.join(outputDir, `${baseName}.ts`);
    
    // Write Zod schema to file
    fs.writeFileSync(outputPath, zodSchema);
    
    console.log(`Generated Zod schema: ${outputPath}`);
    return outputPath;
  } catch (error) {
    console.error(`Error generating Zod schema from ${astPath}:`, error);
    throw error;
  }
}

function processAllASTs() {
  const astNewDir = path.join('artifacts', 'ast', 'new');
  const zodOutputDir = path.join('artifacts', 'zod');
  
  if (!fs.existsSync(astNewDir)) {
    console.log('No AST files found in artifacts/ast/new/');
    return;
  }
  
  const astFiles = fs.readdirSync(astNewDir)
    .filter(file => file.endsWith('.json'))
    .map(file => path.join(astNewDir, file));
  
  if (astFiles.length === 0) {
    console.log('No JSON AST files found in artifacts/ast/new/');
    return;
  }
  
  console.log(`Processing ${astFiles.length} AST files...`);
  
  astFiles.forEach(astFile => {
    try {
      generateZodFromAST(astFile, zodOutputDir);
      
      // Move processed AST to done directory
      const doneDir = path.join('artifacts', 'ast', 'done');
      if (!fs.existsSync(doneDir)) {
        fs.mkdirSync(doneDir, { recursive: true });
      }
      
      const fileName = path.basename(astFile);
      const donePath = path.join(doneDir, fileName);
      fs.renameSync(astFile, donePath);
      console.log(`Moved AST to done: ${donePath}`);
      
    } catch (error) {
      console.error(`Failed to process ${astFile}:`, error);
      
      // Move failed AST to failed directory
      const failedDir = path.join('artifacts', 'ast', 'failed');
      if (!fs.existsSync(failedDir)) {
        fs.mkdirSync(failedDir, { recursive: true });
      }
      
      const fileName = path.basename(astFile);
      const failedPath = path.join(failedDir, fileName);
      fs.renameSync(astFile, failedPath);
      console.log(`Moved AST to failed: ${failedPath}`);
    }
  });
  
  console.log('Zod schema generation complete!');
}

// Run if called directly
if (require.main === module) {
  processAllASTs();
}

module.exports = { generateZodFromAST, processAllASTs }; 