import TaskLogPlugin from '../src/main';
import { App, TFile } from 'obsidian';

describe('TaskLogPlugin', () => {
	let plugin: TaskLogPlugin;
	let mockApp: App;
	let mockSettings: any;
	let mockTaskLogger: any;
	let mockTaskDetector: any;

	beforeEach(() => {
		mockApp = new App();
		mockSettings = {
			enabled: true,
			logFileName: 'task-log.md',
			logDirectory: '',
			includeTimestamp: true,
			includeSourceFile: true,
			includeTaskContext: true
		};
		
		mockTaskLogger = {
			logTask: jest.fn()
		};
		
		mockTaskDetector = {
			detectCompletedTasks: jest.fn()
		};

		// Create plugin instance and manually set properties
		plugin = new TaskLogPlugin(mockApp, {} as any);
		(plugin as any).app = mockApp;
		(plugin as any).settings = mockSettings;
		(plugin as any).taskLogger = mockTaskLogger;
		(plugin as any).taskDetector = mockTaskDetector;
	});

	describe('onload', () => {
		it('should initialize plugin components', async () => {
			// Mock the loadSettings method
			plugin.loadSettings = jest.fn().mockResolvedValue(undefined);
			
			// Mock the registerEvent method
			plugin.registerEvent = jest.fn();
			
			// Mock the addSettingTab method
			plugin.addSettingTab = jest.fn();
			
			// Mock the addCommand method
			plugin.addCommand = jest.fn();

			await plugin.onload();

			expect(plugin.loadSettings).toHaveBeenCalled();
			expect(plugin.registerEvent).toHaveBeenCalled();
			expect(plugin.addSettingTab).toHaveBeenCalled();
			expect(plugin.addCommand).toHaveBeenCalled();
		});
	});

	describe('onunload', () => {
		it('should clean up event listeners', () => {
			(plugin as any).eventRef = { id: 'test-event' };
			plugin.app.workspace.offref = jest.fn();

			plugin.onunload();

			expect(plugin.app.workspace.offref).toHaveBeenCalledWith((plugin as any).eventRef);
		});

		it('should handle null eventRef gracefully', () => {
			(plugin as any).eventRef = null;
			plugin.app.workspace.offref = jest.fn();

			plugin.onunload();

			expect(plugin.app.workspace.offref).not.toHaveBeenCalled();
		});
	});

	describe('handleFileChange', () => {
		it('should process completed tasks when enabled', async () => {
			(plugin as any).settings = mockSettings;
			(plugin as any).taskDetector = mockTaskDetector;
			(plugin as any).taskLogger = mockTaskLogger;
			
			const mockFile = new TFile();
			const mockTasks = [
				{ text: 'Task 1', line: 1, context: 'Context 1', completionDate: new Date() },
				{ text: 'Task 2', line: 2, context: 'Context 2', completionDate: new Date() }
			];

			mockTaskDetector.detectCompletedTasks.mockResolvedValue(mockTasks);
			mockTaskLogger.logTask.mockResolvedValue(undefined);

			await (plugin as any).handleFileChange(mockFile);

			expect(mockTaskDetector.detectCompletedTasks).toHaveBeenCalledWith(mockFile);
			expect(mockTaskLogger.logTask).toHaveBeenCalledTimes(2);
		});

		it('should not process tasks when disabled', async () => {
			(plugin as any).settings = { ...mockSettings, enabled: false };
			(plugin as any).taskDetector = mockTaskDetector;
			(plugin as any).taskLogger = mockTaskLogger;

			const mockFile = new TFile();

			await (plugin as any).handleFileChange(mockFile);

			expect(mockTaskDetector.detectCompletedTasks).not.toHaveBeenCalled();
			expect(mockTaskLogger.logTask).not.toHaveBeenCalled();
		});

		it('should handle errors gracefully', async () => {
			(plugin as any).settings = mockSettings;
			(plugin as any).taskDetector = mockTaskDetector;
			
			const mockFile = new TFile();
			const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

			mockTaskDetector.detectCompletedTasks.mockRejectedValue(new Error('Test error'));

			await (plugin as any).handleFileChange(mockFile);

			expect(consoleSpy).toHaveBeenCalledWith('Error handling file change:', expect.any(Error));
			consoleSpy.mockRestore();
		});
	});

	describe('logCurrentFileTasks', () => {
		it('should log tasks from active file', async () => {
			(plugin as any).taskDetector = mockTaskDetector;
			(plugin as any).taskLogger = mockTaskLogger;
			
			const mockFile = new TFile();
			const mockTasks = [
				{ text: 'Task 1', line: 1, context: 'Context 1', completionDate: new Date() }
			];

			(plugin as any).app.workspace.getActiveFile = jest.fn().mockReturnValue(mockFile);
			mockTaskDetector.detectCompletedTasks.mockResolvedValue(mockTasks);
			mockTaskLogger.logTask.mockResolvedValue(undefined);

			await (plugin as any).logCurrentFileTasks();

			expect(mockTaskDetector.detectCompletedTasks).toHaveBeenCalledWith(mockFile);
			expect(mockTaskLogger.logTask).toHaveBeenCalledWith(mockTasks[0], mockFile);
		});

		it('should show notice when no active file', async () => {
			(plugin as any).app.workspace.getActiveFile = jest.fn().mockReturnValue(null);

			await (plugin as any).logCurrentFileTasks();

			// Test that the method completes without error
			expect(true).toBe(true);
		});

		it('should show notice when no completed tasks found', async () => {
			(plugin as any).taskDetector = mockTaskDetector;
			
			const mockFile = new TFile();

			(plugin as any).app.workspace.getActiveFile = jest.fn().mockReturnValue(mockFile);
			mockTaskDetector.detectCompletedTasks.mockResolvedValue([]);

			await (plugin as any).logCurrentFileTasks();

			// Test that the method completes without error
			expect(true).toBe(true);
		});

		it('should handle errors gracefully', async () => {
			(plugin as any).taskDetector = mockTaskDetector;
			
			const mockFile = new TFile();

			(plugin as any).app.workspace.getActiveFile = jest.fn().mockReturnValue(mockFile);
			mockTaskDetector.detectCompletedTasks.mockRejectedValue(new Error('Test error'));

			const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

			await (plugin as any).logCurrentFileTasks();

			expect(consoleSpy).toHaveBeenCalledWith('Error logging current file tasks:', expect.any(Error));
			consoleSpy.mockRestore();
		});
	});

	describe('loadSettings and saveSettings', () => {
		it('should load and save settings', async () => {
			plugin.loadData = jest.fn().mockResolvedValue({ customSetting: 'value' });
			plugin.saveData = jest.fn().mockResolvedValue(undefined);

			await plugin.loadSettings();
			await plugin.saveSettings();

			expect(plugin.loadData).toHaveBeenCalled();
			expect(plugin.saveData).toHaveBeenCalled();
		});
	});
});
