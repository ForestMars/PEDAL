#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Import the generateOASFromAST function from the OAS generator
const { generateOASFromAST, validateOAS } = require('../src/pipeline/typespec/oas-generator.ts');

async function generateOASFromASTFile(astPath, outputDir) {
  try {
    // Read AST file
    const astContent = fs.readFileSync(astPath, 'utf8');
    const ast = JSON.parse(astContent);
    
    // Generate OpenAPI specification
    const oasPath = await generateOASFromAST(ast, {
      outputDir,
      filename: path.basename(astPath, '.json'),
      title: ast.title || 'Generated API',
      version: ast.version || '1.0.0'
    });
    
    // Validate the generated OAS
    if (validateOAS(oasPath)) {
      console.log(`Generated and validated OpenAPI specification: ${oasPath}`);
      return oasPath;
    } else {
      throw new Error('Generated OAS failed validation');
    }
  } catch (error) {
    console.error(`Error generating OpenAPI specification from ${astPath}:`, error);
    throw error;
  }
}

async function processAllASTs() {
  const astDoneDir = path.join('artifacts', 'ast', 'done');
  const oasOutputDir = path.join('artifacts', 'oas');
  
  if (!fs.existsSync(astDoneDir)) {
    console.log('No AST files found in artifacts/ast/done/');
    return;
  }
  
  const astFiles = fs.readdirSync(astDoneDir)
    .filter(file => file.endsWith('.json'))
    .map(file => path.join(astDoneDir, file));
  
  if (astFiles.length === 0) {
    console.log('No JSON AST files found in artifacts/ast/done/');
    return;
  }
  
  console.log(`Processing ${astFiles.length} AST files for OpenAPI generation...`);
  
  for (const astFile of astFiles) {
    try {
      await generateOASFromASTFile(astFile, oasOutputDir);
      console.log(`Successfully processed: ${path.basename(astFile)}`);
      
    } catch (error) {
      console.error(`Failed to process ${astFile}:`, error);
      
      // Move failed AST to failed directory
      const failedDir = path.join('artifacts', 'ast', 'failed');
      if (!fs.existsSync(failedDir)) {
        fs.mkdirSync(failedDir, { recursive: true });
      }
      
      const fileName = path.basename(astFile);
      const failedPath = path.join(failedDir, fileName);
      
      // Only move if it's not already in failed directory
      if (path.dirname(astFile) !== failedDir) {
        fs.renameSync(astFile, failedPath);
        console.log(`Moved AST to failed: ${failedPath}`);
      }
    }
  }
  
  console.log('OpenAPI specification generation complete!');
}

// Run if called directly
if (require.main === module) {
  processAllASTs().catch(console.error);
}

module.exports = { generateOASFromASTFile, processAllASTs }; 