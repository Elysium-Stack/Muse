import { SharedModule } from '@muse/shared.module';
import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
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
import { MusicService } from './services';
import { MusicSettingsService } from './services/settings.service';

@Module({
	imports: [
		ClientsModule.register([
			{
				name: 'MUSIC_SERVICE',
				transport: Transport.RMQ,
				options: {
					urls: [
						`amqp://${process.env.RABBITMQ_HOST}:${process.env.RABBITMQ_PORT}`,
					],
					queue: 'music_queue',
					queueOptions: {
						durable: false,
						noAck: false,
					},
				},
			},
		]),
		SharedModule,
	],
	controllers: [],
	providers: [
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
