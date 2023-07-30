export const MINECRAFT_EMBED_COLOR = '#52A435';

export const MINECRAFT_SETTINGS_CHOICES = [
	{
		name: 'Enabled',
		description: 'Wether minecraft module should be enabled or disabled.',
		value: 'enabled',
	},
	{
		name: 'Required Role',
		description: 'The required role to join the minecraft server.',
		value: 'requiredRoleId',
	},
	{
		name: 'Chat Channel',
		description:
			'The channel to listen to for chats to send to the server.',
		value: 'chatChannelId',
	},
	{
		name: 'Connect url',
		description: 'The url to be used to connect to your server.',
		value: 'connectUrl',
	},
];
