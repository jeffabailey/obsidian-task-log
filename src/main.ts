import { Plugin, TFile, EventRef, Notice } from 'obsidian';
import { TaskLogSettings, TaskLogSettingTab } from './settings';
import { TaskLogger } from './task-logger';
import { TaskDetector } from './task-detector';

export default class TaskLogPlugin extends Plugin {
	settings: TaskLogSettings;
	taskLogger: TaskLogger;
	taskDetector: TaskDetector;
	private eventRef: EventRef | null = null;

	async onload() {
		await this.loadSettings();
		
		this.taskLogger = new TaskLogger(this.app, this.settings);
		this.taskDetector = new TaskDetector(this.app);
		
		// Register event listener for file modifications
		this.registerEvent(
			this.app.vault.on('modify', this.handleFileChange.bind(this))
		);
		
		// Add setting tab
		this.addSettingTab(new TaskLogSettingTab(this.app, this));
		
		// Add command to manually log current file
		this.addCommand({
			id: 'log-current-file-tasks',
			name: 'Log completed tasks from current file',
			callback: () => this.logCurrentFileTasks()
		});
	}

	onunload() {
		// Clean up event listeners
		if (this.eventRef) {
			this.app.workspace.offref(this.eventRef);
		}
	}

	private async handleFileChange(file: TFile): Promise<void> {
		if (!this.settings.enabled) return;
		
		// Prevent infinite loop by ignoring changes to the log file itself
		if (file.path.includes(this.settings.logFileName)) {
			return;
		}
		
		try {
			const completedTasks = await this.taskDetector.detectCompletedTasks(file);
			
			for (const task of completedTasks) {
				await this.taskLogger.logTask(task, file);
			}
		} catch (error) {
			console.error('Error handling file change:', error);
		}
	}

	private async logCurrentFileTasks(): Promise<void> {
		const activeFile = this.app.workspace.getActiveFile();
		if (!activeFile) {
			new Notice('No active file');
			return;
		}
		
		try {
			const completedTasks = await this.taskDetector.detectCompletedTasks(activeFile);
			
			if (completedTasks.length === 0) {
				new Notice('No completed tasks found in current file');
				return;
			}
			
			for (const task of completedTasks) {
				await this.taskLogger.logTask(task, activeFile);
			}
			
			new Notice(`Logged ${completedTasks.length} completed task(s)`);
		} catch (error) {
			console.error('Error logging current file tasks:', error);
			new Notice('Error logging tasks');
		}
	}

	async loadSettings() {
		this.settings = Object.assign({}, TaskLogSettings.DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}
