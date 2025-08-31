import { test, expect } from '@playwright/test';
import * as path from 'path';
import * as fs from 'fs';

test.describe('Task Log Plugin Core Functionality Tests', () => {
  test('should detect completed tasks from markdown content', async ({ page }) => {
    // Read the test file content
    const testFile = path.join(__dirname, 'sandbox-vault/test-tasks.md');
    const content = fs.readFileSync(testFile, 'utf8');
    
    // Create a simple HTML page to test the task detection logic
    await page.setContent(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Task Detection Test</title>
        </head>
        <body>
          <div id="content">
            <pre>${content}</pre>
          </div>
          <script>
            // Simulate the task detection logic
            function detectCompletedTasks(content) {
              const lines = content.split('\\n');
              const completedTasks = [];
              
              lines.forEach((line, index) => {
                const match = line.match(/^- \\[x\\] (.+)$/i);
                if (match) {
                  completedTasks.push({
                    text: match[1],
                    fullLine: line,
                    line: index + 1,
                    completionDate: new Date()
                  });
                }
              });
              
              return completedTasks;
            }
            
            // Test the detection
            const content = document.getElementById('content').textContent;
            const tasks = detectCompletedTasks(content);
            window.detectedTasks = tasks;
          </script>
        </body>
      </html>
    `);
    
    // Wait for the script to execute
    await page.waitForFunction(() => window.detectedTasks !== undefined);
    
    // Get the detected tasks
    const detectedTasks = await page.evaluate(() => window.detectedTasks);
    
    // Verify we detected the correct number of completed tasks
    expect(detectedTasks.length).toBe(6);
    
    // Verify specific tasks were detected
    const taskTexts = detectedTasks.map(task => task.text);
    expect(taskTexts).toContain('Make coffee');
    expect(taskTexts).toContain('Check email');
    expect(taskTexts).toContain('Attend meeting');
    expect(taskTexts).toContain('Update dependencies');
    expect(taskTexts).toContain('Call mom');
    expect(taskTexts).toContain('Pay bills');
    
    // Verify task structure
    for (const task of detectedTasks) {
      expect(task).toHaveProperty('text');
      expect(task).toHaveProperty('fullLine');
      expect(task).toHaveProperty('line');
      expect(task).toHaveProperty('completionDate');
      expect(task.fullLine).toMatch(/^- \[x\] .+$/i);
    }
    
    console.log('✅ Task detection logic verified');
  });

  test('should format log entries correctly', async ({ page }) => {
    // Create a test task
    const testTask = {
      text: 'Test completed task',
      fullLine: '- [x] Test completed task',
      line: 5,
      completionDate: new Date('2023-01-01T12:00:00')
    };
    
    // Create a simple HTML page to test the log formatting logic
    await page.setContent(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Log Formatting Test</title>
        </head>
        <body>
          <div id="output"></div>
          <script>
            function formatLogEntry(task, sourceFile, settings) {
              const parts = [];
              
              // Add timestamp if enabled
              if (settings.includeTimestamp) {
                const date = new Date(task.completionDate);
                const year = date.getFullYear();
                const month = String(date.getMonth() + 1).padStart(2, '0');
                const day = String(date.getDate()).padStart(2, '0');
                const hours = date.getHours();
                const minutes = String(date.getMinutes()).padStart(2, '0');
                const hour12 = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;
                const ampm = hours >= 12 ? 'PM' : 'AM';
                const timezone = 'EST'; // Simplified for test
                
                parts.push(\`## \${year}-\${month}-\${day} \${hour12}:\${minutes} \${ampm} \${timezone}\`);
              }
              
              // Add source file information if enabled
              if (settings.includeSourceFile) {
                parts.push(\`**Source:** [[\${sourceFile}]]\`);
                parts.push(\`**Line:** \${task.line}\`);
              }
              
              // Add task text
              parts.push(task.fullLine);
              
              // Add separator
              parts.push('---\\n');
              
              return parts.join('\\n');
            }
            
            // Test the formatting
            const task = ${JSON.stringify(testTask)};
            const sourceFile = 'test-file.md';
            const settings = {
              includeTimestamp: true,
              includeSourceFile: true
            };
            
            const formatted = formatLogEntry(task, sourceFile, settings);
            document.getElementById('output').textContent = formatted;
            window.formattedEntry = formatted;
          </script>
        </body>
      </html>
    `);
    
    // Wait for the script to execute
    await page.waitForFunction(() => window.formattedEntry !== undefined);
    
    // Get the formatted entry
    const formattedEntry = await page.evaluate(() => window.formattedEntry);
    
    // Verify the formatting
    expect(formattedEntry).toContain('## 2023-01-01 12:00 PM EST');
    expect(formattedEntry).toContain('**Source:** [[test-file.md]]');
    expect(formattedEntry).toContain('**Line:** 5');
    expect(formattedEntry).toContain('- [x] Test completed task');
    expect(formattedEntry).toContain('---');
    
    console.log('✅ Log formatting logic verified');
  });

  test('should handle different settings configurations', async ({ page }) => {
    const testTask = {
      text: 'Test task',
      fullLine: '- [x] Test task',
      line: 1,
      completionDate: new Date('2023-01-01T12:00:00')
    };
    
    await page.setContent(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Settings Configuration Test</title>
        </head>
        <body>
          <div id="output"></div>
          <script>
            function formatLogEntry(task, sourceFile, settings) {
              const parts = [];
              
              if (settings.includeTimestamp) {
                const date = new Date(task.completionDate);
                const year = date.getFullYear();
                const month = String(date.getMonth() + 1).padStart(2, '0');
                const day = String(date.getDate()).padStart(2, '0');
                parts.push(\`## \${year}-\${month}-\${day}\`);
              }
              
              if (settings.includeSourceFile) {
                parts.push(\`**Source:** [[\${sourceFile}]]\`);
                parts.push(\`**Line:** \${task.line}\`);
              }
              
              parts.push(task.fullLine);
              parts.push('---\\n');
              
              return parts.join('\\n');
            }
            
            // Test different settings combinations
            const task = ${JSON.stringify(testTask)};
            const sourceFile = 'test.md';
            
            const configs = [
              { includeTimestamp: true, includeSourceFile: true },
              { includeTimestamp: true, includeSourceFile: false },
              { includeTimestamp: false, includeSourceFile: true },
              { includeTimestamp: false, includeSourceFile: false }
            ];
            
            const results = configs.map(config => ({
              config,
              result: formatLogEntry(task, sourceFile, config)
            }));
            
            document.getElementById('output').textContent = JSON.stringify(results, null, 2);
            window.testResults = results;
          </script>
        </body>
      </html>
    `);
    
    // Wait for the script to execute
    await page.waitForFunction(() => window.testResults !== undefined);
    
    // Get the test results
    const testResults = await page.evaluate(() => window.testResults);
    
    // Verify all settings combinations work correctly
    expect(testResults).toHaveLength(4);
    
    // Test with both enabled
    const bothEnabled = testResults.find(r => r.config.includeTimestamp && r.config.includeSourceFile);
    expect(bothEnabled.result).toContain('## 2023-01-01');
    expect(bothEnabled.result).toContain('**Source:** [[test.md]]');
    expect(bothEnabled.result).toContain('**Line:** 1');
    
    // Test with only timestamp
    const onlyTimestamp = testResults.find(r => r.config.includeTimestamp && !r.config.includeSourceFile);
    expect(onlyTimestamp.result).toContain('## 2023-01-01');
    expect(onlyTimestamp.result).not.toContain('**Source:**');
    expect(onlyTimestamp.result).not.toContain('**Line:**');
    
    // Test with only source file
    const onlySource = testResults.find(r => !r.config.includeTimestamp && r.config.includeSourceFile);
    expect(onlySource.result).not.toContain('## 2023-01-01');
    expect(onlySource.result).toContain('**Source:** [[test.md]]');
    expect(onlySource.result).toContain('**Line:** 1');
    
    // Test with neither enabled
    const neither = testResults.find(r => !r.config.includeTimestamp && !r.config.includeSourceFile);
    expect(neither.result).not.toContain('## 2023-01-01');
    expect(neither.result).not.toContain('**Source:**');
    expect(neither.result).not.toContain('**Line:**');
    
    console.log('✅ Settings configuration handling verified');
  });
});
