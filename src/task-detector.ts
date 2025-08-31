import { App, TFile } from 'obsidian';

export interface CompletedTask {
	text: string;
	fullLine: string;
	line: number;
	completionDate: Date;
}

export class TaskDetector {
	private app: App;
	private completedTaskPattern: RegExp;

	constructor(app: App) {
		this.app = app;
		// Pattern to match completed tasks: - [x] or - [X] followed by task text
		this.completedTaskPattern = /^- \[[xX]\] (.+)$/;
	}

	async detectCompletedTasks(file: TFile): Promise<CompletedTask[]> {
		const completedTasks: CompletedTask[] = [];
		
		try {
			const content = await this.app.vault.read(file);
			const lines = content.split('\n');
			
			for (let i = 0; i < lines.length; i++) {
				const line = lines[i];
				const match = line.match(this.completedTaskPattern);
				
				if (match) {
					const taskText = match[1];
					
					completedTasks.push({
						text: taskText,
						fullLine: line,
						line: i + 1,
						completionDate: new Date()
					});
				}
			}
		} catch (error) {
			console.error(`Error reading file ${file.path}:`, error);
		}
		
		return completedTasks;
	}

	// Alternative method to detect tasks using the Tasks plugin if available
	async detectCompletedTasksWithTasksPlugin(file: TFile): Promise<CompletedTask[]> {
		// This would integrate with the Tasks plugin if it's available
		// For now, we'll use our regex-based detection
		return this.detectCompletedTasks(file);
	}

	// Method to check if a specific line contains a completed task
	isCompletedTask(line: string): boolean {
		return this.completedTaskPattern.test(line);
	}

	// Method to extract task text from a completed task line
	extractTaskText(line: string): string | null {
		const match = line.match(this.completedTaskPattern);
		return match ? match[1] : null;
	}
}
