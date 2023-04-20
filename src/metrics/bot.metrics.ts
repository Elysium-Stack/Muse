import { makeGaugeProvider } from '@willsoto/nestjs-prometheus';

export const botMetrics = [
	makeGaugeProvider({
		name: 'discord_connected',
		help: 'Determines if the bot is connected to Discord',
		labelNames: ['shard'],
	}),
	makeGaugeProvider({
		name: 'discord_latency',
		help: 'latency to Discord',
		labelNames: ['shard'],
	}),
];
