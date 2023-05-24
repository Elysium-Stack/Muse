import { SharedModule } from '@muse';
import { Module } from '@nestjs/common';
import { MusicLoopCommands } from './commands/loop.command';
import { MusicNextCommands } from './commands/next.command';
import { MusicPauseCommands } from './commands/pause.command';
import { MusicPlayCommands } from './commands/play.command';
import { MusicPreviousCommands } from './commands/previous.command';
import { MusicResumeCommands } from './commands/resume.command';
import { MusicSettingsCommands } from './commands/settings.commands';
import { MusicShuffleCommands } from './commands/shuffle.command';
import { MusicStopCommands } from './commands/stop.command';
import { MusicVolumeCommands } from './commands/volume.command';
import { LavalinkService } from './services/lavalink.service';
import { MusicPlayerService } from './services/player.service';
import { MusicSettingsService } from './services/settings.service';

@Module({
	imports: [SharedModule],
	controllers: [],
	providers: [
		LavalinkService,
		MusicSettingsService,
		MusicSettingsCommands,
		MusicPlayerService,
		MusicPlayCommands,
		MusicStopCommands,
		MusicNextCommands,
		MusicPreviousCommands,
		MusicShuffleCommands,
		MusicPauseCommands,
		MusicResumeCommands,
		MusicLoopCommands,
		MusicVolumeCommands,
	],
})
export class MusicModule {}
