import { bookwormPromptSetting } from '@hermes/modules/bookworm/util/prompt-settings';

export const MESSAGE_PREFIX = '𓏢';

export const MODULES = [
	{
		name: 'Bookworm',
		settingsPrompt: bookwormPromptSetting,
	},
];
