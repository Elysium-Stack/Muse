export const BOOKWORM_SETTINGS_CHOICES = [
	{
		name: 'Enabled',
		description: 'Wether bookworm module should be enabled or disabled.',
		value: 'enabled',
	},
	{
		name: 'Bookworm Channel',
		description: 'The channel the bookworm module operates in.',
		value: 'channelId',
	},
	{
		name: 'Daily enabled',
		description:
			'Wether the daily book questions should be enabled or disabled.',
		value: 'dailyEnabled',
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
