/**
 * Utility script to wait for the backend server to be ready
 * Used in CI/CD to ensure server is running before executing tests
 */

import axios from 'axios';

const API_URL = process.env.API_URL || 'http://localhost:3000';
const MAX_RETRIES = 30;
const RETRY_INTERVAL = 1000; // 1 second

async function waitForServer(): Promise<void> {
  console.log(`Waiting for server at ${API_URL}...`);

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const response = await axios.get(`${API_URL}/ping`, {
        timeout: 5000,
      });

      if (response.status === 200) {
        console.log(`✓ Server is ready after ${attempt} attempts`);
        process.exit(0);
      }
    } catch (error) {
      console.log(`Attempt ${attempt}/${MAX_RETRIES}: Server not ready yet...`);

      if (attempt === MAX_RETRIES) {
        console.error('✗ Server failed to start within timeout period');
        process.exit(1);
      }

      // Wait before next retry
      await new Promise(resolve => setTimeout(resolve, RETRY_INTERVAL));
    }
  }
}

waitForServer();
