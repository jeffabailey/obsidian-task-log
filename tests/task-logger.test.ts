import { TaskLogger } from '../src/task-logger';
import { TaskLogSettings } from '../src/settings';
import { CompletedTask } from '../src/task-detector';
import { App, TFile } from 'obsidian';

describe('TaskLogger', () => {
	let taskLogger: TaskLogger;
	let mockApp: App;
	let mockSettings: TaskLogSettings;
	let mockTask: CompletedTask;
	let mockSourceFile: TFile;

	beforeEach(() => {
		mockApp = new App();
		mockSettings = {
			enabled: true,
			logFileName: 'task-log.md',
			logDirectory: '',
			includeTimestamp: true,
			includeSourceFile: true,
			dateFormat: 'YYYY-MM-DD h:mm A TZ',
			customDateFormat: 'YYYY-MM-DD h:mm A TZ'
		};
		taskLogger = new TaskLogger(mockApp, mockSettings);
		
		mockTask = {
			text: 'Test completed task',
			fullLine: '- [x] Test completed task',
			line: 5,
			completionDate: new Date(2023, 0, 1, 12, 0, 0) // January 1, 2023, 12:00:00 local time
		};
		
		mockSourceFile = new TFile();
	});

	describe('logTask', () => {
		it('should successfully log a task', async () => {
			// Mock the log file doesn't exist
			(mockApp.vault.getAbstractFileByPath as jest.Mock).mockReturnValue(null);
			(mockApp.vault.create as jest.Mock).mockResolvedValue(undefined);

			await taskLogger.logTask(mockTask, mockSourceFile);

			expect(mockApp.vault.create).toHaveBeenCalled();
		});

		it('should handle errors gracefully', async () => {
			(mockApp.vault.getAbstractFileByPath as jest.Mock).mockReturnValue(null);
			(mockApp.vault.create as jest.Mock).mockRejectedValue(new Error('Create error'));

			await expect(taskLogger.logTask(mockTask, mockSourceFile)).rejects.toThrow('Create error');
		});
	});

	describe('formatLogEntry', () => {
		it('should format log entry with all options enabled', () => {
			// Access private method through any type
			const formatLogEntry = (taskLogger as any).formatLogEntry.bind(taskLogger);
			const result = formatLogEntry(mockTask, mockSourceFile);

			expect(result).toContain('## 2023-01-01 12:00 PM');
			expect(result).toContain('**Source:** [[test]]');
			expect(result).toContain('**Line:** 5');
			expect(result).toContain('- [x] Test completed task');
			expect(result).toContain('---');
		});

		it('should format log entry without timestamp when disabled', () => {
			mockSettings.includeTimestamp = false;
			taskLogger = new TaskLogger(mockApp, mockSettings);
			
			const formatLogEntry = (taskLogger as any).formatLogEntry.bind(taskLogger);
			const result = formatLogEntry(mockTask, mockSourceFile);

			expect(result).not.toContain('## 2023-01-01 12:00 PM');
			expect(result).toContain('**Source:** [[test]]');
			expect(result).toContain('- [x] Test completed task');
		});

		it('should format log entry without source file when disabled', () => {
			mockSettings.includeSourceFile = false;
			taskLogger = new TaskLogger(mockApp, mockSettings);
			
			const formatLogEntry = (taskLogger as any).formatLogEntry.bind(taskLogger);
			const result = formatLogEntry(mockTask, mockSourceFile);

			expect(result).not.toContain('**Source:** [[test]]');
			expect(result).not.toContain('**Line:** 5');
			expect(result).toContain('- [x] Test completed task');
		});

		it('should format date according to YYYY-MM-DD h:mm A TZ setting', () => {
			mockSettings.dateFormat = 'YYYY-MM-DD h:mm A TZ';
			taskLogger = new TaskLogger(mockApp, mockSettings);
			
			const formatLogEntry = (taskLogger as any).formatLogEntry.bind(taskLogger);
			const result = formatLogEntry(mockTask, mockSourceFile);

			expect(result).toContain('## 2023-01-01 12:00 PM');
		});

		it('should format date according to YYYY-MM-DDTHH:mm:ss.sssZ setting', () => {
			mockSettings.dateFormat = 'YYYY-MM-DDTHH:mm:ss.sssZ';
			taskLogger = new TaskLogger(mockApp, mockSettings);
			
			const formatLogEntry = (taskLogger as any).formatLogEntry.bind(taskLogger);
			const result = formatLogEntry(mockTask, mockSourceFile);

			expect(result).toContain('## 2023-01-01T12:00:00.000Z');
		});

		it('should format date according to YYYY-MM-DD HH:mm:ss setting', () => {
			mockSettings.dateFormat = 'YYYY-MM-DD HH:mm:ss';
			taskLogger = new TaskLogger(mockApp, mockSettings);
			
			const formatLogEntry = (taskLogger as any).formatLogEntry.bind(taskLogger);
			const result = formatLogEntry(mockTask, mockSourceFile);

			expect(result).toContain('## 2023-01-01 12:00:00');
		});

		it('should format date according to MM/DD/YYYY setting', () => {
			mockSettings.dateFormat = 'MM/DD/YYYY';
			taskLogger = new TaskLogger(mockApp, mockSettings);
			
			const formatLogEntry = (taskLogger as any).formatLogEntry.bind(taskLogger);
			const result = formatLogEntry(mockTask, mockSourceFile);

			expect(result).toContain('## 01/01/2023');
		});

		it('should format date according to custom setting', () => {
			mockSettings.dateFormat = 'custom';
			mockSettings.customDateFormat = 'DD-MM-YYYY HH:mm';
			taskLogger = new TaskLogger(mockApp, mockSettings);
			
			const formatLogEntry = (taskLogger as any).formatLogEntry.bind(taskLogger);
			const result = formatLogEntry(mockTask, mockSourceFile);

			expect(result).toContain('## 01-01-2023 12:00');
		});
	});

	describe('getLogFilePath', () => {
		it('should return relative path when logDirectory is empty', async () => {
			const getLogFilePath = (taskLogger as any).getLogFilePath.bind(taskLogger);
			const result = await getLogFilePath();

			expect(result).toBe('task-log.md');
		});

		it('should return path with directory when logDirectory is set', async () => {
			mockSettings.logDirectory = 'logs';
			taskLogger = new TaskLogger(mockApp, mockSettings);
			
			const getLogFilePath = (taskLogger as any).getLogFilePath.bind(taskLogger);
			const result = await getLogFilePath();

			expect(result).toBe('logs/task-log.md');
		});

		it('should return absolute path when logDirectory is absolute', async () => {
			mockSettings.logDirectory = '/Users/username/Documents/logs';
			taskLogger = new TaskLogger(mockApp, mockSettings);
			
			const getLogFilePath = (taskLogger as any).getLogFilePath.bind(taskLogger);
			const result = await getLogFilePath();

			expect(result).toBe('/Users/username/Documents/logs/task-log.md');
		});

		it('should detect Windows absolute paths', async () => {
			mockSettings.logDirectory = 'C:\\Users\\username\\Documents\\logs';
			taskLogger = new TaskLogger(mockApp, mockSettings);
			
			const getLogFilePath = (taskLogger as any).getLogFilePath.bind(taskLogger);
			const result = await getLogFilePath();

			// Use path.join to handle cross-platform path separators
			const expectedPath = require('path').join('C:\\Users\\username\\Documents\\logs', 'task-log.md');
			expect(result).toBe(expectedPath);
		});
	});

	describe('appendToLogFile', () => {
		it('should create new log file when it does not exist', async () => {
			(mockApp.vault.getAbstractFileByPath as jest.Mock).mockReturnValue(null);
			(mockApp.vault.create as jest.Mock).mockResolvedValue(undefined);

			const appendToLogFile = (taskLogger as any).appendToLogFile.bind(taskLogger);
			await appendToLogFile('test-log.md', 'test entry');

			expect(mockApp.vault.create).toHaveBeenCalledWith('test-log.md', expect.stringContaining('# Task Log'));
		});

		it('should append to existing log file', async () => {
			const mockLogFile = new TFile();
			(mockApp.vault.getAbstractFileByPath as jest.Mock).mockReturnValue(mockLogFile);
			(mockApp.vault.read as jest.Mock).mockResolvedValue('# Task Log\n---\n');
			(mockApp.vault.modify as jest.Mock).mockResolvedValue(undefined);

			const appendToLogFile = (taskLogger as any).appendToLogFile.bind(taskLogger);
			await appendToLogFile('task-log.md', 'new entry');

			expect(mockApp.vault.modify).toHaveBeenCalledWith(mockLogFile, expect.stringContaining('new entry'));
		});

		it('should create directory if it does not exist', async () => {
			mockSettings.logDirectory = 'logs';
			taskLogger = new TaskLogger(mockApp, mockSettings);
			
			// Mock directory doesn't exist, then file doesn't exist
			(mockApp.vault.getAbstractFileByPath as jest.Mock)
				.mockReturnValueOnce(null) // Directory doesn't exist
				.mockReturnValueOnce(null); // File doesn't exist
			(mockApp.vault.create as jest.Mock).mockResolvedValue(undefined);

			const appendToLogFile = (taskLogger as any).appendToLogFile.bind(taskLogger);
			await appendToLogFile('logs/task-log.md', 'test entry');

			// Should create the log file with header
			expect(mockApp.vault.create).toHaveBeenCalledWith('logs/task-log.md', expect.stringContaining('# Task Log'));
		});
	});

	describe('getLogFileContent', () => {
		it('should return log file content when file exists', async () => {
			const mockLogFile = new TFile();
			(mockApp.vault.getAbstractFileByPath as jest.Mock).mockReturnValue(mockLogFile);
			(mockApp.vault.read as jest.Mock).mockResolvedValue('# Task Log\n---\n');

			const result = await taskLogger.getLogFileContent();

			expect(result).toBe('# Task Log\n---\n');
		});

		it('should return empty string when file does not exist', async () => {
			(mockApp.vault.getAbstractFileByPath as jest.Mock).mockReturnValue(null);

			const result = await taskLogger.getLogFileContent();

			expect(result).toBe('');
		});
	});

	describe('clearLogFile', () => {
		it('should clear log file content', async () => {
			const mockLogFile = new TFile();
			(mockApp.vault.getAbstractFileByPath as jest.Mock).mockReturnValue(mockLogFile);
			(mockApp.vault.modify as jest.Mock).mockResolvedValue(undefined);

			await taskLogger.clearLogFile();

			expect(mockApp.vault.modify).toHaveBeenCalledWith(mockLogFile, expect.stringContaining('# Task Log'));
		});
	});
});
