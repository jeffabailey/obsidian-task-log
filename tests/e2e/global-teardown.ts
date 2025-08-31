import { FullConfig } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

async function globalTeardown(config: FullConfig) {
  // Clean up any test artifacts
  const sandboxPath = path.join(__dirname, 'sandbox-vault');
  
  // Remove the task-log.md file if it was created during testing
  const logFile = path.join(sandboxPath, 'task-log.md');
  if (fs.existsSync(logFile)) {
    fs.unlinkSync(logFile);
  }

  // Remove any test directories that might have been created
  const testLogsDir = path.join(sandboxPath, 'test-logs');
  if (fs.existsSync(testLogsDir)) {
    fs.rmSync(testLogsDir, { recursive: true, force: true });
  }

  console.log('✅ E2E test cleanup completed');
}

export default globalTeardown;
