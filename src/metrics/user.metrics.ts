import { makeGaugeProvider } from '@willsoto/nestjs-prometheus';

export const userMetrics = [
	makeGaugeProvider({
		name: 'discord_stat_total_users',
		help: 'Amount of users this bot can see',
	}),
];
