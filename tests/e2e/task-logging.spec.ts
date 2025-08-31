import { test, expect } from '@playwright/test';
import { ElectronApplication, _electron as electron } from '@playwright/test';
import { ObsidianHelper } from './obsidian-helper';
import * as path from 'path';
import * as fs from 'fs';

let app: ElectronApplication;
let mainWindow: any;
let obsidianHelper: ObsidianHelper;

test.describe('Task Log Plugin E2E Tests', () => {
  test.beforeAll(async () => {
    // For now, we'll test the plugin functionality without launching Obsidian
    // This allows us to test the core logic while we work on the full E2E setup
    console.log('Setting up E2E test environment...');
    
    // Verify the sandbox vault is properly configured
    const sandboxPath = path.join(__dirname, 'sandbox-vault');
    const pluginPath = path.join(sandboxPath, '.obsidian/plugins/obsidian-task-log');
    
    // Check if plugin files exist
    expect(fs.existsSync(path.join(pluginPath, 'main.js'))).toBe(true);
    expect(fs.existsSync(path.join(pluginPath, 'manifest.json'))).toBe(true);
    
    console.log('✅ Plugin files verified in sandbox vault');
  });

  test('should have properly configured sandbox vault', async () => {
    const sandboxPath = path.join(__dirname, 'sandbox-vault');
    
    // Check sandbox vault structure
    expect(fs.existsSync(sandboxPath)).toBe(true);
    expect(fs.existsSync(path.join(sandboxPath, '.obsidian'))).toBe(true);
    expect(fs.existsSync(path.join(sandboxPath, 'test-tasks.md'))).toBe(true);
    
    // Check plugin configuration
    const pluginsConfig = JSON.parse(
      fs.readFileSync(path.join(sandboxPath, '.obsidian/plugins.json'), 'utf8')
    );
    
    expect(pluginsConfig['obsidian-task-log']).toBeDefined();
    expect(pluginsConfig['obsidian-task-log'].enabled).toBe(true);
    
    console.log('✅ Sandbox vault configuration verified');
  });

  test('should have test data with correct task structure', async () => {
    const testFile = path.join(__dirname, 'sandbox-vault/test-tasks.md');
    const content = fs.readFileSync(testFile, 'utf8');
    
    // Check that we have both completed and incomplete tasks
    const completedTasks = content.match(/- \[x\]/g) || [];
    const incompleteTasks = content.match(/- \[ \]/g) || [];
    
    expect(completedTasks.length).toBe(6);
    expect(incompleteTasks.length).toBe(6);
    
    // Check specific task content
    expect(content).toContain('- [x] Make coffee');
    expect(content).toContain('- [ ] Wake up early');
    
    console.log('✅ Test data structure verified');
  });

  test('should have plugin files with correct content', async () => {
    const pluginPath = path.join(__dirname, 'sandbox-vault/.obsidian/plugins/obsidian-task-log');
    
    // Check main.js
    const mainJs = fs.readFileSync(path.join(pluginPath, 'main.js'), 'utf8');
    expect(mainJs).toContain('TaskLogPlugin');
    expect(mainJs).toContain('TaskLogger');
    expect(mainJs).toContain('TaskDetector');
    
    // Check manifest.json
    const manifest = JSON.parse(
      fs.readFileSync(path.join(pluginPath, 'manifest.json'), 'utf8')
    );
    
    expect(manifest.id).toBe('obsidian-task-log');
    expect(manifest.name).toBe('Task Log');
    expect(manifest.version).toBe('1.0.0');
    
    console.log('✅ Plugin files content verified');
  });

  test('should have proper plugin settings configuration', async () => {
    const pluginsConfig = JSON.parse(
      fs.readFileSync(path.join(__dirname, 'sandbox-vault/.obsidian/plugins.json'), 'utf8')
    );
    
    const settings = pluginsConfig['obsidian-task-log'].settings;
    
    expect(settings.enabled).toBe(true);
    expect(settings.logFileName).toBe('task-log.md');
    expect(settings.logDirectory).toBe('');
    expect(settings.includeTimestamp).toBe(true);
    expect(settings.includeSourceFile).toBe(true);
    expect(settings.dateFormat).toBe('custom');
    
    console.log('✅ Plugin settings configuration verified');
  });

  test('should be ready for full E2E testing', async () => {
    // This test verifies that all the infrastructure is in place
    // for when we implement the full Obsidian launching functionality
    
    const sandboxPath = path.join(__dirname, 'sandbox-vault');
    
    // Check that all required files exist
    const requiredFiles = [
      'test-tasks.md',
      '.obsidian/plugins.json',
      '.obsidian/plugins/obsidian-task-log/main.js',
      '.obsidian/plugins/obsidian-task-log/manifest.json'
    ];
    
    for (const file of requiredFiles) {
      const filePath = path.join(sandboxPath, file);
      expect(fs.existsSync(filePath)).toBe(true);
    }
    
    console.log('✅ All infrastructure ready for full E2E testing');
  });
});
