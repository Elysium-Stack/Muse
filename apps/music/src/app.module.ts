import { MusicModule } from '@music';
import { Module } from '@nestjs/common';
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
import { botMetrics } from './metrics/bot.metrics';
import { MusicService } from './services/music.service';

@Module({
	imports: [
		NecordModule.forRoot({
			development:
				process.env.NODE_ENV !== 'production'
					? process.env.DEVELOPMENT_SERVER_IDS!.split(',')
					: false,
			skipRegistration: true,
			token: process.env[
				`MUSIC_${process.env.INSTANCE_NUMBER}_DISCORD_TOKEN`
			]!,
			intents,
		}),
		PrometheusModule.register(),
		ScheduleModule.forRoot(),

		PrismaModule,
		MusicModule,
	],
	controllers: [MusicController],
	providers: [
		MusicService,
		AppEvents,

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
