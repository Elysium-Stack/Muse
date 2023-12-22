export const QOTD_EMBED_COLOR = '#dc00ff';

export const QOTD_SETTINGS_CHOICES = [
	{
		name: 'Enabled',
		description: 'Wether QotD module should be enabled or disabled.',
		value: 'enabled',
	},
	{
		name: 'QotD Channel',
		description: 'The channel the QotD module operates in.',
		value: 'channelId',
	},
	{
		name: 'Daily enabled',
		description:
			'Wether the daily book questions should be enabled or disabled.',
		value: 'dailyEnabled',
	},
	{
		name: 'Daily hour',
		description: 'At which hour the daily question should be asked.',
		value: 'dailyHour',
	},
	{
		name: 'Daily Channel',
		description: 'The channel the daily questions should be posted in.',
		value: 'dailyChannelId',
	},
	{
		name: 'Ping role',
		description: 'The role to ping when a daily question is asked.',
		value: 'pingRoleId',
	},
];
