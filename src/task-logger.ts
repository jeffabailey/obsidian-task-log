import { App, TFile, TFolder } from 'obsidian';
import { TaskLogSettings } from './settings';
import { CompletedTask } from './task-detector';
import * as path from 'path';

export class TaskLogger {
	private app: App;
	private settings: TaskLogSettings;

	constructor(app: App, settings: TaskLogSettings) {
		this.app = app;
		this.settings = settings;
	}

	async logTask(task: CompletedTask, sourceFile: TFile): Promise<void> {
		try {
			const logFilePath = await this.getLogFilePath();
			const logEntry = this.formatLogEntry(task, sourceFile);
			
			await this.appendToLogFile(logFilePath, logEntry);
		} catch (error) {
			console.error('Error logging task:', error);
			throw error;
		}
	}

	public async getLogFilePath(): Promise<string> {
		let logPath: string;
		
		// Check if logDirectory is an absolute path
		const isAbsolutePath = this.settings.logDirectory && this.isAbsolutePath(this.settings.logDirectory);
		
		if (isAbsolutePath) {
			// Use absolute path as-is
			logPath = path.join(this.settings.logDirectory, this.settings.logFileName);
		} else {
			// Use relative path within the vault
			if (this.settings.logDirectory) {
				logPath = path.join(this.settings.logDirectory, this.settings.logFileName);
			} else {
				logPath = this.settings.logFileName;
			}
		}
		
		return logPath;
	}

	private formatLogEntry(task: CompletedTask, sourceFile: TFile): string {
		const parts: string[] = [];
		
		// Add timestamp if enabled
		if (this.settings.includeTimestamp) {
			const formattedDate = this.formatDate(task.completionDate);
			parts.push(`## ${formattedDate}`);
		}
		
		// Add source file information if enabled
		if (this.settings.includeSourceFile) {
			parts.push(`**Source:** [[${sourceFile.basename}]]`);
			parts.push(`**Line:** ${task.line}`);
		}
		
		// Add task text (as-is, without formatting)
		parts.push(task.fullLine);
		
		parts.push('---\n');
		
		return parts.join('\n');
	}

	private formatDate(date: Date): string {
		const year = date.getFullYear();
		const month = String(date.getMonth() + 1).padStart(2, '0');
		const day = String(date.getDate()).padStart(2, '0');
		const hours = date.getHours();
		const minutes = String(date.getMinutes()).padStart(2, '0');
		const seconds = String(date.getSeconds()).padStart(2, '0');
		const milliseconds = String(date.getMilliseconds()).padStart(3, '0');
		
		// Get timezone abbreviation
		const timezone = this.getTimezoneAbbreviation();

		switch (this.settings.dateFormat) {
			case 'YYYY-MM-DD h:mm A TZ':
				const hour12 = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;
				const ampm = hours >= 12 ? 'PM' : 'AM';
				return `${year}-${month}-${day} ${hour12}:${minutes} ${ampm} ${timezone}`;
			case 'YYYY-MM-DDTHH:mm:ss.sssZ':
				return `${year}-${month}-${day}T${String(hours).padStart(2, '0')}:${minutes}:${seconds}.${milliseconds}Z`;
			case 'YYYY-MM-DD':
				return `${year}-${month}-${day}`;
			case 'YYYY-MM-DD HH:mm:ss':
				return `${year}-${month}-${day} ${String(hours).padStart(2, '0')}:${minutes}:${seconds}`;
			case 'MM/DD/YYYY':
				return `${month}/${day}/${year}`;
			case 'DD/MM/YYYY':
				return `${day}/${month}/${year}`;
			case 'custom':
				// For custom format, we'll use a simple template replacement
				// This could be enhanced with a more sophisticated date formatting library
				let customFormat = this.settings.customDateFormat || 'YYYY-MM-DD h:mm A TZ';
				customFormat = customFormat
					.replace(/YYYY/g, year.toString())
					.replace(/MM/g, month)
					.replace(/DD/g, day)
					.replace(/HH/g, String(hours).padStart(2, '0'))
					.replace(/h/g, hours === 0 ? '12' : hours > 12 ? String(hours - 12) : String(hours))
					.replace(/mm/g, minutes)
					.replace(/ss/g, seconds)
					.replace(/sss/g, milliseconds)
					.replace(/A/g, hours >= 12 ? 'PM' : 'AM')
					.replace(/TZ/g, timezone);
				return customFormat;
			default:
				return `${year}-${month}-${day}`;
		}
	}

	private getTimezoneAbbreviation(): string {
		try {
			// Try to get timezone abbreviation from Intl.DateTimeFormat
			const timeZoneName = new Intl.DateTimeFormat('en', { timeZoneName: 'short' }).formatToParts(new Date()).find(part => part.type === 'timeZoneName');
			if (timeZoneName) {
				return timeZoneName.value;
			}
		} catch (error) {
			// Fallback if Intl.DateTimeFormat is not available
		}
		
		// Fallback: try to get timezone offset and convert to common abbreviations
		const offset = new Date().getTimezoneOffset();
		const offsetHours = Math.abs(Math.floor(offset / 60));
		const offsetMinutes = Math.abs(offset % 60);
		const sign = offset <= 0 ? '+' : '-';
		
		// Common timezone mappings based on offset
		if (offset === -480) return 'PST'; // Pacific Standard Time
		if (offset === -420) return 'PDT'; // Pacific Daylight Time
		if (offset === -360) return 'MST'; // Mountain Standard Time
		if (offset === -300) return 'MDT'; // Mountain Daylight Time
		if (offset === -300) return 'CST'; // Central Standard Time
		if (offset === -240) return 'CDT'; // Central Daylight Time
		if (offset === -240) return 'EST'; // Eastern Standard Time
		if (offset === -180) return 'EDT'; // Eastern Daylight Time
		if (offset === 0) return 'UTC';   // UTC
		if (offset === 60) return 'CET';  // Central European Time
		if (offset === 120) return 'EET'; // Eastern European Time
		
		// Generic fallback
		return `${sign}${String(offsetHours).padStart(2, '0')}:${String(offsetMinutes).padStart(2, '0')}`;
	}

	private async appendToLogFile(logFilePath: string, logEntry: string): Promise<void> {
		try {
			// Check if log file exists
			const logFile = this.app.vault.getAbstractFileByPath(logFilePath);
			
			if (!logFile) {
				// Create the log file with header
				const header = this.createLogFileHeader();
				await this.app.vault.create(logFilePath, header + logEntry);
			} else {
				// Append to existing file
				const currentContent = await this.app.vault.read(logFile as TFile);
				const newContent = currentContent + logEntry;
				await this.app.vault.modify(logFile as TFile, newContent);
			}
		} catch (error) {
			console.error(`Error writing to log file ${logFilePath}:`, error);
			
			// Try to create the directory if it doesn't exist and it's a relative path
			if (this.settings.logDirectory && !this.isAbsolutePath(this.settings.logDirectory)) {
				await this.ensureDirectoryExists(this.settings.logDirectory);
				// Retry creating the file
				await this.appendToLogFile(logFilePath, logEntry);
			} else {
				throw error;
			}
		}
	}

	private createLogFileHeader(): string {
		return `# Task Log

This file contains a log of completed tasks.

---
`;
	}

	private async ensureDirectoryExists(dirPath: string): Promise<void> {
		try {
			const folder = this.app.vault.getAbstractFileByPath(dirPath);
			if (!folder) {
				await this.app.vault.createFolder(dirPath);
			}
		} catch (error) {
			console.error(`Error creating directory ${dirPath}:`, error);
			throw error;
		}
	}

	private isAbsolutePath(path: string): boolean {
		return path.startsWith('/') || path.startsWith('\\') || (path.length > 2 && path[1] === ':');
	}

	// Method to get the current log file content
	async getLogFileContent(): Promise<string> {
		try {
			const logFilePath = await this.getLogFilePath();
			const logFile = this.app.vault.getAbstractFileByPath(logFilePath);
			
			if (logFile && logFile instanceof TFile) {
				return await this.app.vault.read(logFile);
			}
			
			return '';
		} catch (error) {
			console.error('Error reading log file:', error);
			return '';
		}
	}

	// Method to clear the log file
	async clearLogFile(): Promise<void> {
		try {
			const logFilePath = await this.getLogFilePath();
			const logFile = this.app.vault.getAbstractFileByPath(logFilePath);
			
			if (logFile && logFile instanceof TFile) {
				const header = this.createLogFileHeader();
				await this.app.vault.modify(logFile, header);
			}
		} catch (error) {
			console.error('Error clearing log file:', error);
			throw error;
		}
	}
}
