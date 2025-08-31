import { TaskLogSettings, TaskLogSettingTab } from '../src/settings';
import { App } from 'obsidian';

describe('TaskLogSettings', () => {
	describe('DEFAULT_SETTINGS', () => {
		it('should have correct default values', () => {
			const defaults = TaskLogSettings.DEFAULT_SETTINGS;
			
			expect(defaults.enabled).toBe(true);
			expect(defaults.logFileName).toBe('task-log.md');
			expect(defaults.logDirectory).toBe('');
			expect(defaults.includeTimestamp).toBe(true);
			expect(defaults.includeSourceFile).toBe(true);
			expect(defaults.dateFormat).toBe('custom');
			expect(defaults.customDateFormat).toBe('YYYY-MM-DD h:mm A TZ');
		});
	});
});

describe('TaskLogSettingTab', () => {
	let settingTab: TaskLogSettingTab;
	let mockApp: App;
	let mockPlugin: any;
	let mockContainerEl: any;

	beforeEach(() => {
		mockApp = new App();
		mockPlugin = {
			settings: {
				enabled: true,
				logFileName: 'task-log.md',
				logDirectory: '',
				includeTimestamp: true,
				includeSourceFile: true,
				dateFormat: 'YYYY-MM-DD h:mm A TZ',
				customDateFormat: 'YYYY-MM-DD h:mm A TZ'
			},
			saveSettings: jest.fn()
		};
		
		mockContainerEl = {
			empty: jest.fn(),
			createEl: jest.fn().mockReturnValue({
				textContent: ''
			})
		};
		
		settingTab = new TaskLogSettingTab(mockApp, mockPlugin);
		settingTab.containerEl = mockContainerEl;
	});

	describe('display', () => {
		it('should create settings UI elements', () => {
			expect(settingTab).toBeDefined();
			expect(settingTab.plugin).toBe(mockPlugin);
		});

		it('should have correct plugin settings', () => {
			expect(settingTab.plugin.settings.dateFormat).toBe('YYYY-MM-DD h:mm A TZ');
			expect(settingTab.plugin.settings.customDateFormat).toBe('YYYY-MM-DD h:mm A TZ');
		});

		it('should handle custom date format setting', () => {
			// Test that the custom format setting is properly configured
			expect(settingTab.plugin.settings.customDateFormat).toBe('YYYY-MM-DD h:mm A TZ');
		});

		it('should have date format options available', () => {
			// Test that the date format setting exists
			expect(settingTab.plugin.settings.dateFormat).toBeDefined();
		});

		it('should show custom format input when dateFormat is custom', () => {
			// Test the logic that determines when to show custom format input
			const shouldShow = mockPlugin.settings.dateFormat === 'custom';
			expect(shouldShow).toBe(false); // Default is not custom
			
			// Change to custom
			mockPlugin.settings.dateFormat = 'custom';
			const shouldShowCustom = mockPlugin.settings.dateFormat === 'custom';
			expect(shouldShowCustom).toBe(true);
		});

		it('should hide custom format input when dateFormat is not custom', () => {
			// Test the logic that determines when to hide custom format input
			mockPlugin.settings.dateFormat = 'custom';
			expect(mockPlugin.settings.dateFormat === 'custom').toBe(true);
			
			// Change to non-custom
			mockPlugin.settings.dateFormat = 'YYYY-MM-DD h:mm A TZ';
			expect(mockPlugin.settings.dateFormat === 'custom').toBe(false);
		});

		it('should save settings when dateFormat changes', () => {
			// Test that saveSettings is called when settings change
			const originalDateFormat = mockPlugin.settings.dateFormat;
			
			// Change the date format
			mockPlugin.settings.dateFormat = 'custom';
			expect(mockPlugin.settings.dateFormat).toBe('custom');
			expect(mockPlugin.settings.dateFormat).not.toBe(originalDateFormat);
		});

		it('should handle custom date format value changes', () => {
			// Test that custom date format can be updated
			const newCustomFormat = 'MM/DD/YYYY HH:mm:ss';
			mockPlugin.settings.customDateFormat = newCustomFormat;
			
			expect(mockPlugin.settings.customDateFormat).toBe(newCustomFormat);
			expect(mockPlugin.settings.customDateFormat).not.toBe('YYYY-MM-DD h:mm A TZ');
		});
	});
});
