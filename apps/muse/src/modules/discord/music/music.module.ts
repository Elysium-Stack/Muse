import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';

import { SharedModule } from '@muse/shared.module';

import { MusicLoopCommands } from './commands/loop.command';
import { MusicNextCommands } from './commands/next.command';
import { MusicPauseCommands } from './commands/pause.command';
import { MusicPlayCommands } from './commands/play.command';
import { MusicPreviousCommands } from './commands/previous.command';
import { MusicQueueCommands } from './commands/queue.command';
import { MusicResumeCommands } from './commands/resume.command';
import { MusicSettingsCommands } from './commands/settings.commands';
import { MusicShuffleCommands } from './commands/shuffle.command';
import { MusicStopCommands } from './commands/stop.command';
import { MusicVolumeCommands } from './commands/volume.command';
import { MusicController } from './controllers/music.controller';
import { MusicService } from './services';
import { MusicInstancesService } from './services/instances.service';
import { MusicSettingsService } from './services/settings.service';

const musicBotHosts = process.env['MUSIC_BOT_HOSTS'].split(',');
@Module({
	imports: [
		ClientsModule.register(
			musicBotHosts.map((host, i) => ({
				name: `MUSIC_SERVICE_${i + 1}`,
				transport: Transport.TCP,
				options: {
					host,
					port: 1337,
				},
			}))
		),
		SharedModule,
	],
	controllers: [MusicController],
	providers: [
		MusicInstancesService,
		MusicService,
		MusicSettingsService,
		MusicSettingsCommands,
		MusicPlayCommands,
		MusicStopCommands,
		MusicNextCommands,
		MusicPreviousCommands,
		MusicLoopCommands,
		MusicPauseCommands,
		MusicResumeCommands,
		MusicShuffleCommands,
		MusicVolumeCommands,
		MusicQueueCommands,
	],
	exports: [],
})
export class MusicModule {}
