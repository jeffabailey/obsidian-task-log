// Mock Obsidian module for testing
export class Plugin {
	app: any;
	settings: any;

	constructor() {
		this.app = {
					vault: {
			read: jest.fn(),
			write: jest.fn(),
			create: jest.fn(),
			createFolder: jest.fn(),
			modify: jest.fn(),
			getAbstractFileByPath: jest.fn(),
			on: jest.fn(),
			adapter: {
				getFullPath: jest.fn(() => '/mock/vault/path')
			}
		},
			workspace: {
				on: jest.fn(),
				offref: jest.fn(),
				getActiveFile: jest.fn()
			}
		};
		this.settings = {};
	}

	registerEvent() {}
	addSettingTab() {}
	addCommand() {}
	loadData() {}
	saveData() {}
}

export class TFile {
	path: string;
	basename: string;
	extension: string;

	constructor() {
		this.path = 'test.md';
		this.basename = 'test';
		this.extension = 'md';
	}
}

export class TFolder {
	path: string;
	name: string;

	constructor(path: string, name: string) {
		this.path = path;
		this.name = name;
	}
}

export class App {
	vault: any;
	workspace: any;

	constructor() {
		this.vault = {
			read: jest.fn(),
			write: jest.fn(),
			create: jest.fn(),
			createFolder: jest.fn(),
			modify: jest.fn(),
			getAbstractFileByPath: jest.fn(),
			on: jest.fn(),
			adapter: {
				getFullPath: jest.fn(() => '/mock/vault/path')
			}
		};
		this.workspace = {
			on: jest.fn(),
			offref: jest.fn(),
			getActiveFile: jest.fn()
		};
	}
}

export class PluginSettingTab {
	app: any;
	plugin: any;

	constructor(app: any, plugin: any) {
		this.app = app;
		this.plugin = plugin;
	}

	display() {}
}

export class Setting {
	containerEl: any;
	name: string;
	desc: string;
	settingEl: any;

	constructor(containerEl: any) {
		this.containerEl = containerEl;
		this.settingEl = {
			style: {
				display: 'block'
			}
		};
	}

	setName(name: string) {
		this.name = name;
		return this;
	}

	setDesc(desc: string) {
		this.desc = desc;
		return this;
	}

	addToggle(callback: (toggle: any) => void) {
		const toggle = {
			setValue: jest.fn(),
			onChange: jest.fn()
		};
		callback(toggle);
		return this;
	}

	addText(callback: (text: any) => void) {
		const text = {
			setPlaceholder: jest.fn(),
			setValue: jest.fn(),
			onChange: jest.fn()
		};
		callback(text);
		return this;
	}

	addDropdown(callback: (dropdown: any) => void) {
		const dropdown = {
			addOption: jest.fn().mockReturnThis(),
			setValue: jest.fn(),
			onChange: jest.fn()
		};
		callback(dropdown);
		return this;
	}
}

export class Notice {
	constructor(message: string) {
		console.log(`Notice: ${message}`);
	}
}
