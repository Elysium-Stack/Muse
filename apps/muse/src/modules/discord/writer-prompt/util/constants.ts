export const WRITER_PROMPT_EMBED_COLOR = '#2b64c6';

export const WRITER_PROMPT_SETTINGS_CHOICES = [
	{
		name: 'Enabled',
		description:
			'Wether the writer prompt module should be enabled or disabled.',
		value: 'enabled',
	},
	{
		name: 'Writer prompt Channel',
		description: 'The channel the writer prompts are posted in.',
		value: 'channelId',
	},
	{
		name: 'Writer role',
		description: 'The role that is given to users that can write prompts.',
		value: 'writerRoleId',
	},
	{
		name: 'Ping role',
		description: 'The role to ping when a prompt is sent.',
		value: 'pingRoleId',
	},
];
