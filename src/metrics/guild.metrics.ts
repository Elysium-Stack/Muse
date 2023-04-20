import { makeGaugeProvider } from '@willsoto/nestjs-prometheus';

export const guildMetrics = [
	makeGaugeProvider({
		name: 'discord_stat_total_guilds',
		help: 'Amount of guild this bot is a member of',
	}),
];
