import { SharedModule } from '@muse';
import { Module } from '@nestjs/common';
import { MusicPlayCommands } from './commands/play.command';
import { MusicSettingsCommands } from './commands/settings.commands';
import { LavalinkService } from './services/lavalink.service';
import { MusicSettingsService } from './services/settings.service';

@Module({
	imports: [SharedModule],
	controllers: [],
	providers: [
		LavalinkService,
		MusicSettingsService,
		MusicSettingsCommands,
		MusicPlayCommands,
	],
})
export class MusicModule {}
