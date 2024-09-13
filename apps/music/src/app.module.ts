import { MusicModule } from '@music';
import { Module } from '@nestjs/common';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ScheduleModule } from '@nestjs/schedule';
import { PrismaModule } from '@prisma';
import { intents } from '@util';
import { PrometheusModule } from '@willsoto/nestjs-prometheus';
import { NecordModule } from 'necord';

import { MusicLoopCommands } from './commands/loop.command';
import { MusicNextCommands } from './commands/next.command';
import { MusicPauseCommands } from './commands/pause.command';
import { MusicPreviousCommands } from './commands/previous.command';
import { MusicResumeCommands } from './commands/resume.command';
import { MusicShuffleCommands } from './commands/shuffle.command';
import { MusicStopCommands } from './commands/stop.command';
import { MusicVolumeCommands } from './commands/volume.command';
import { MusicController } from './controllers/music.controller';
import { AppEvents } from './events/app.events';
import { MusicEvents } from './events/music.events';
import { botMetrics } from './metrics/bot.metrics';

@Module({
	imports: [
		NecordModule.forRoot({
			development:
				process.env.NODE_ENV === 'production'
					? false
					: process.env.DEVELOPMENT_SERVER_IDS!.split(','),
			skipRegistration: true,
			token: process.env[
				`MUSIC_${process.env.INSTANCE_NUMBER}_DISCORD_TOKEN`
			]!,
			intents,
		}),
		EventEmitterModule.forRoot(),
		PrometheusModule.register(),
		ScheduleModule.forRoot(),

		ClientsModule.register([
			{
				name: `MUSE_SERVICE`,
				transport: Transport.TCP,
				options: {
					host: 'muse',
					port: 1337,
				},
			},
		]),

		PrismaModule,
		MusicModule,
	],
	controllers: [MusicController],
	providers: [
		AppEvents,
		MusicEvents,

		// commands
		MusicStopCommands,
		MusicNextCommands,
		MusicPreviousCommands,
		MusicLoopCommands,
		MusicPauseCommands,
		MusicResumeCommands,
		MusicShuffleCommands,
		MusicVolumeCommands,

		// prometheus
		...botMetrics,
	],
})
export class AppModule {}
