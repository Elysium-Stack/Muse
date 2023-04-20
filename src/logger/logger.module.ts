import { Module } from '@nestjs/common';
import { makeCounterProvider } from '@willsoto/nestjs-prometheus';
import { MuseLogger } from './logger.service';

@Module({
	providers: [
		makeCounterProvider({
			name: 'logging_total',
			help: 'Log entries',
			labelNames: ['logger', 'level'],
		}),
		MuseLogger,
	],
	exports: [MuseLogger],
})
export class MuseLoggerModule {}
