import { chromium, FullConfig } from '@playwright/test';
import * as path from 'path';
import * as fs from 'fs';

async function globalSetup(config: FullConfig) {
  // Ensure the sandbox vault exists and is properly configured
  const sandboxPath = path.join(__dirname, 'sandbox-vault');
  
  // Copy the built plugin to the sandbox vault
  const pluginSource = path.join(__dirname, '../../main.js');
  const pluginDest = path.join(sandboxPath, '.obsidian/plugins/obsidian-task-log/main.js');
  
  if (fs.existsSync(pluginSource)) {
    fs.copyFileSync(pluginSource, pluginDest);
  } else {
    throw new Error('Plugin not built. Run npm run build first.');
  }

  // Copy manifest.json
  const manifestSource = path.join(__dirname, '../../manifest.json');
  const manifestDest = path.join(sandboxPath, '.obsidian/plugins/obsidian-task-log/manifest.json');
  fs.copyFileSync(manifestSource, manifestDest);

  console.log('✅ Sandbox vault prepared for E2E testing');
}

export default globalSetup;
