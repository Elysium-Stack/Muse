export const MOD_LOG_EMBED_COLOR = '#870000';

export const MOD_LOG_SETTINGS_CHOICES = [
	{
		name: 'Enabled',
		description: 'Wether mod log module should be enabled or disabled.',
		value: 'enabled',
	},
	{
		name: 'Message delete channel',
		description: 'The channel where message deletes are logged.',
		value: 'deleteChannelId',
	},
	{
		name: 'Message edit channel',
		description: 'The channel where message edits are logged.',
		value: 'editChannelId',
	},
	{
		name: 'Member join channel',
		description: 'The channel where member joins are logged.',
		value: 'joinChannelId',
	},
	{
		name: 'Member leave channel',
		description: "The channel where member leave's are logged.",
		value: 'leaveChannelId',
	},
];
