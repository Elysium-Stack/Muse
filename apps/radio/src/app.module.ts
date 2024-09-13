import { MusicModule } from '@music';
import { Module } from '@nestjs/common';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ScheduleModule } from '@nestjs/schedule';
import { PrismaModule } from '@prisma';
import { intents } from '@util';
import { PrometheusModule } from '@willsoto/nestjs-prometheus';
import { NecordModule } from 'necord';

import { RadioController } from './controllers/radio.controller';
import { AppEvents } from './events/app.events';
import { MusicEvents } from './events/music.events';
import { botMetrics } from './metrics/bot.metrics';
import { RadioService } from './services/radio.service';

@Module({
	imports: [
		NecordModule.forRoot({
			development:
				process.env.NODE_ENV === 'production'
					? false
					: process.env.DEVELOPMENT_SERVER_IDS!.split(','),
			skipRegistration: true,
			token: process.env.RADIO_DISCORD_TOKEN!,
			intents,
		}),
		EventEmitterModule.forRoot(),
		PrometheusModule.register(),
		ScheduleModule.forRoot(),

		PrismaModule,
		MusicModule,
	],
	controllers: [RadioController],
	providers: [
		RadioService,
		AppEvents,
		MusicEvents,

		// prometheus
		...botMetrics,
	],
})
export class AppModule {}
