import { ElectronApplication, Page } from '@playwright/test';
import * as path from 'path';

export class ObsidianHelper {
  private app: ElectronApplication;
  private mainWindow: Page;
  private sandboxPath: string;

  constructor(app: ElectronApplication, mainWindow: Page, sandboxPath: string) {
    this.app = app;
    this.mainWindow = mainWindow;
    this.sandboxPath = sandboxPath;
  }

  /**
   * Wait for Obsidian to be fully loaded
   */
  async waitForObsidianReady(): Promise<void> {
    // Wait for the main workspace to be visible
    await this.mainWindow.waitForSelector('.workspace-leaf-content', { timeout: 30000 });
    
    // Wait for the plugin to be loaded
    await this.mainWindow.waitForFunction(() => {
      return (window as any).app?.plugins?.enabledPlugins?.includes('obsidian-task-log');
    }, { timeout: 10000 });
  }

  /**
   * Open a file in the editor
   */
  async openFile(filename: string): Promise<void> {
    // Use the file explorer to open the file
    const fileExplorerItem = this.mainWindow.locator(`[data-path="${filename}"]`);
    await fileExplorerItem.click();
    
    // Wait for the file to open in the editor
    await this.mainWindow.waitForSelector('.markdown-source-view');
  }

  /**
   * Get the content of the currently open file
   */
  async getEditorContent(): Promise<string> {
    const editor = this.mainWindow.locator('.markdown-source-view textarea');
    return await editor.inputValue();
  }

  /**
   * Set the content of the currently open file
   */
  async setEditorContent(content: string): Promise<void> {
    const editor = this.mainWindow.locator('.markdown-source-view textarea');
    await editor.fill(content);
    
    // Trigger a save (Ctrl+S)
    await this.mainWindow.keyboard.press('Control+s');
    
    // Wait for save to complete
    await this.mainWindow.waitForTimeout(1000);
  }

  /**
   * Open the command palette
   */
  async openCommandPalette(): Promise<void> {
    await this.mainWindow.keyboard.press('Control+Shift+p');
    await this.mainWindow.waitForSelector('.prompt-input-container');
  }

  /**
   * Execute a command from the command palette
   */
  async executeCommand(commandName: string): Promise<void> {
    await this.openCommandPalette();
    
    const commandInput = this.mainWindow.locator('.prompt-input-container input');
    await commandInput.fill(commandName);
    
    // Wait for the command to appear and click it
    const commandItem = this.mainWindow.locator(`.suggestion-item:has-text("${commandName}")`);
    await commandItem.click();
  }

  /**
   * Check if a file exists in the vault
   */
  async fileExists(filename: string): Promise<boolean> {
    try {
      await this.mainWindow.waitForSelector(`[data-path="${filename}"]`, { timeout: 5000 });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Get the content of a file from the vault
   */
  async getFileContent(filename: string): Promise<string> {
    // Open the file
    await this.openFile(filename);
    
    // Get the content
    const content = await this.getEditorContent();
    
    return content;
  }

  /**
   * Wait for a task to be logged (check if task-log.md exists and has content)
   */
  async waitForTaskLogging(): Promise<void> {
    // Wait for the task-log.md file to appear
    await this.mainWindow.waitForFunction(() => {
      const fileExplorer = document.querySelector('.nav-files-container');
      return fileExplorer?.textContent?.includes('task-log.md');
    }, { timeout: 10000 });
  }

  /**
   * Get the number of completed tasks in the current file
   */
  async getCompletedTaskCount(): Promise<number> {
    const content = await this.getEditorContent();
    const completedTasks = content.match(/- \[x\]/gi) || [];
    return completedTasks.length;
  }

  /**
   * Mark a task as complete by changing [ ] to [x]
   */
  async completeTask(taskText: string): Promise<void> {
    const content = await this.getEditorContent();
    const newContent = content.replace(
      new RegExp(`- \\[ \\] ${taskText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`),
      `- [x] ${taskText}`
    );
    
    await this.setEditorContent(newContent);
  }
}
