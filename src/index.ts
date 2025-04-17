import express from 'express';
import { config } from 'dotenv';
import { setupPipeline } from './pipeline';
import { setupDatabase } from './db';
import { setupApi } from './api';

// Load environment variables
config();

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(express.json());

// Initialize components
async function initialize() {
  try {
    // Setup database connection
    await setupDatabase();
    
    // Setup API routes
    setupApi(app);
    
    // Initialize pipeline
    await setupPipeline();
    
    // Start server
    app.listen(port, () => {
      console.log(`PEDAL app running at http://localhost:${port}`);
    });
  } catch (error) {
    console.error('Failed to initialize application:', error);
    process.exit(1);
  }
}

initialize(); 