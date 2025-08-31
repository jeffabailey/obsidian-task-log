import { App, PluginSettingTab, Setting } from 'obsidian';

export interface TaskLogSettings {
	enabled: boolean;
	logFileName: string;
	logDirectory: string;
	includeTimestamp: boolean;
	includeSourceFile: boolean;
	dateFormat: string;
	customDateFormat: string;
}

export class TaskLogSettings {
	static readonly DEFAULT_SETTINGS: TaskLogSettings = {
		enabled: true,
		logFileName: 'task-log.md',
		logDirectory: '',
		includeTimestamp: true,
		includeSourceFile: true,
		dateFormat: 'custom',
		customDateFormat: 'YYYY-MM-DD h:mm A TZ'
	};
}

export class TaskLogSettingTab extends PluginSettingTab {
	plugin: any;

	constructor(app: App, plugin: any) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;
		containerEl.empty();

		containerEl.createEl('h2', { text: 'Task Log Settings' });

		new Setting(containerEl)
			.setName('Enable Task Logging')
			.setDesc('Enable or disable automatic task logging')
			.addToggle(toggle => toggle
				.setValue(this.plugin.settings.enabled)
				.onChange(async (value) => {
					this.plugin.settings.enabled = value;
					await this.plugin.saveSettings();
				}));

		new Setting(containerEl)
			.setName('Log File Name')
			.setDesc('Name of the file where completed tasks will be logged')
			.addText(text => text
				.setPlaceholder('task-log.md')
				.setValue(this.plugin.settings.logFileName)
				.onChange(async (value) => {
					this.plugin.settings.logFileName = value;
					await this.plugin.saveSettings();
				}));

		new Setting(containerEl)
			.setName('Log Directory')
			.setDesc('Directory where the log file will be stored. Leave empty for vault root, or enter a relative path (e.g., "logs/") or absolute path (e.g., "/Users/username/Documents/logs")')
			.addText(text => text
				.setPlaceholder('logs/')
				.setValue(this.plugin.settings.logDirectory)
				.onChange(async (value) => {
					this.plugin.settings.logDirectory = value;
					await this.plugin.saveSettings();
				}));

		new Setting(containerEl)
			.setName('Include Timestamp')
			.setDesc('Include completion timestamp in log entries')
			.addToggle(toggle => toggle
				.setValue(this.plugin.settings.includeTimestamp)
				.onChange(async (value) => {
					this.plugin.settings.includeTimestamp = value;
					await this.plugin.saveSettings();
				}));

		new Setting(containerEl)
			.setName('Include Source File')
			.setDesc('Include source file information in log entries')
			.addToggle(toggle => toggle
				.setValue(this.plugin.settings.includeSourceFile)
				.onChange(async (value) => {
					this.plugin.settings.includeSourceFile = value;
					await this.plugin.saveSettings();
				}));

		// Create the date format setting element
		const dateFormatSetting = new Setting(containerEl)
			.setName('Date Format')
			.setDesc('The current date format for log entries (editable)')
			.addText(text => text
				.setPlaceholder('YYYY-MM-DD h:mm A TZ')
				.setValue(this.plugin.settings.customDateFormat || 'YYYY-MM-DD h:mm A TZ')
				.onChange(async (value: string) => {
					this.plugin.settings.customDateFormat = value;
					// If user manually edits this field, set dropdown to custom
					if (this.plugin.settings.dateFormat !== 'custom') {
						this.plugin.settings.dateFormat = 'custom';
						// Update the dropdown to show "Custom Format"
						const dropdown = containerEl.querySelector('select');
						if (dropdown) {
							(dropdown as HTMLSelectElement).value = 'custom';
						}
					}
					await this.plugin.saveSettings();
				}));

		// Make the date format text field wider
		const textInput = dateFormatSetting.controlEl.querySelector('input');
		if (textInput) {
			textInput.style.width = '400px';
		}

		// Function to update the date format field when dropdown changes
		const updateDateFormatField = (format: string) => {
			this.plugin.settings.customDateFormat = format;
			// Update the text input to show the new value
			const textInput = dateFormatSetting.controlEl.querySelector('input');
			if (textInput) {
				(textInput as HTMLInputElement).value = format;
			}
		};

		new Setting(containerEl)
			.setName('Choose Date Format')
			.setDesc('Format for the completion date in log entries')
			.addDropdown(dropdown => dropdown
				.addOption('YYYY-MM-DD h:mm A TZ', 'YYYY-MM-DD h:mm A TZ (Readable)')
				.addOption('YYYY-MM-DDTHH:mm:ss.sssZ', 'YYYY-MM-DDTHH:mm:ss.sssZ (ISO 8601)')
				.addOption('YYYY-MM-DD', 'YYYY-MM-DD (ISO Date)')
				.addOption('YYYY-MM-DD HH:mm:ss', 'YYYY-MM-DD HH:mm:ss (ISO Date + Time)')
				.addOption('MM/DD/YYYY', 'MM/DD/YYYY (US Format)')
				.addOption('DD/MM/YYYY', 'DD/MM/YYYY (European Format)')
				.addOption('custom', 'Custom Format')
				.setValue(this.plugin.settings.dateFormat)
				.onChange(async (value) => {
					this.plugin.settings.dateFormat = value;
					await this.plugin.saveSettings();
					// Update the date format field when dropdown changes
					if (value === 'custom') {
						// Keep current custom value
					} else {
						updateDateFormatField(value);
					}
				}));

		// Initially set the date format field to show the current format
		if (this.plugin.settings.dateFormat === 'custom') {
			// Keep current custom value
		} else {
			updateDateFormatField(this.plugin.settings.dateFormat);
		}
	}
}
