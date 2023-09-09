export const STARBOARD_EMBED_COLOR = '#fff600';

export const STARBOARD_SETTINGS_CHOICES = [
	{
		name: 'Enabled',
		description: 'Wether starboard module should be enabled or disabled.',
		value: 'enabled',
	},
	{
		name: 'Channel',
		description: 'The channel of the starboard.',
		value: 'channelId',
	},
	{
		name: 'Self starring',
		description:
			'Wether the author of the message can star their own messages.',
		value: 'self',
	},
	{
		name: 'Ignored channels',
		description: 'The channels the starboard module ignores.',
		value: 'ignoredChannelIds',
	},
];
