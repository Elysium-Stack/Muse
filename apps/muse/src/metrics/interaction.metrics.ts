import {
	makeCounterProvider,
	makeGaugeProvider,
} from '@willsoto/nestjs-prometheus';

export const interactionMetrics = [
	makeCounterProvider({
		name: 'discord_event_on_interaction_total',
		help: 'Amount of interactions called by users',
		labelNames: ['shard', 'interaction', 'command'],
	}),
	makeGaugeProvider({
		name: 'discord_stat_total_interactions',
		help: 'Amount of interactions',
	}),
];
