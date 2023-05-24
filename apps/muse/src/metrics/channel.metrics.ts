import { makeGaugeProvider } from '@willsoto/nestjs-prometheus';

export const channelMetrics = [
	makeGaugeProvider({
		name: 'discord_stat_total_channels',
		help: 'Amount of channels this bot is has access to',
	}),
];
