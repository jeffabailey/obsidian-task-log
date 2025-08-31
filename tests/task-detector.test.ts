import { TaskDetector, CompletedTask } from '../src/task-detector';
import { App, TFile } from 'obsidian';

describe('TaskDetector', () => {
	let taskDetector: TaskDetector;
	let mockApp: App;
	let mockFile: TFile;

	beforeEach(() => {
		mockApp = new App();
		taskDetector = new TaskDetector(mockApp);
		mockFile = new TFile();
	});

	describe('detectCompletedTasks', () => {
		it('should detect completed tasks with lowercase x', async () => {
			const content = `
# Test File
- [ ] Incomplete task
- [x] Completed task
- [ ] Another incomplete task
- [x] Another completed task
			`.trim();

			(mockApp.vault.read as jest.Mock).mockResolvedValue(content);

			const result = await taskDetector.detectCompletedTasks(mockFile);

			expect(result).toHaveLength(2);
			expect(result[0].text).toBe('Completed task');
			expect(result[0].line).toBe(3);
			expect(result[1].text).toBe('Another completed task');
			expect(result[1].line).toBe(5);
		});

		it('should detect completed tasks with uppercase X', async () => {
			const content = `- [X] Completed task with uppercase X
- [ ] Incomplete task`;

			(mockApp.vault.read as jest.Mock).mockResolvedValue(content);

			const result = await taskDetector.detectCompletedTasks(mockFile);

			expect(result).toHaveLength(1);
			expect(result[0].text).toBe('Completed task with uppercase X');
			expect(result[0].line).toBe(1);
		});

		it('should not detect incomplete tasks', async () => {
			const content = `
- [ ] Incomplete task 1
- [ ] Incomplete task 2
- [ ] Incomplete task 3
			`.trim();

			(mockApp.vault.read as jest.Mock).mockResolvedValue(content);

			const result = await taskDetector.detectCompletedTasks(mockFile);

			expect(result).toHaveLength(0);
		});

		it('should handle empty file', async () => {
			(mockApp.vault.read as jest.Mock).mockResolvedValue('');

			const result = await taskDetector.detectCompletedTasks(mockFile);

			expect(result).toHaveLength(0);
		});

		it('should handle file with only whitespace', async () => {
			(mockApp.vault.read as jest.Mock).mockResolvedValue('   \n  \n  ');

			const result = await taskDetector.detectCompletedTasks(mockFile);

			expect(result).toHaveLength(0);
		});

		it('should handle file read errors gracefully', async () => {
			(mockApp.vault.read as jest.Mock).mockRejectedValue(new Error('File read error'));

			const result = await taskDetector.detectCompletedTasks(mockFile);

			expect(result).toHaveLength(0);
		});
	});

	describe('isCompletedTask', () => {
		it('should return true for completed tasks', () => {
			expect(taskDetector.isCompletedTask('- [x] Task')).toBe(true);
			expect(taskDetector.isCompletedTask('- [X] Task')).toBe(true);
		});

		it('should return false for incomplete tasks', () => {
			expect(taskDetector.isCompletedTask('- [ ] Task')).toBe(false);
			expect(taskDetector.isCompletedTask('- [] Task')).toBe(false);
			expect(taskDetector.isCompletedTask('- Task')).toBe(false);
		});

		it('should return false for non-task lines', () => {
			expect(taskDetector.isCompletedTask('# Header')).toBe(false);
			expect(taskDetector.isCompletedTask('Plain text')).toBe(false);
			expect(taskDetector.isCompletedTask('')).toBe(false);
		});
	});

	describe('extractTaskText', () => {
		it('should extract task text from completed tasks', () => {
			expect(taskDetector.extractTaskText('- [x] Complete this task')).toBe('Complete this task');
			expect(taskDetector.extractTaskText('- [X] Another task')).toBe('Another task');
		});

		it('should return null for non-completed tasks', () => {
			expect(taskDetector.extractTaskText('- [ ] Incomplete task')).toBeNull();
			expect(taskDetector.extractTaskText('Not a task')).toBeNull();
		});
	});

	describe('detectCompletedTasksWithTasksPlugin', () => {
		it('should fall back to regex detection', async () => {
			const content = '- [x] Test task';
			(mockApp.vault.read as jest.Mock).mockResolvedValue(content);

			const result = await taskDetector.detectCompletedTasksWithTasksPlugin(mockFile);

			expect(result).toHaveLength(1);
			expect(result[0].text).toBe('Test task');
		});
	});
});
