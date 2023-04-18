import { SharedModule } from '@muse';
import { Module } from '@nestjs/common';
import { MusicSettingsCommands } from './commands/settings.commands';
import { MusicSettingsService } from './services/settings.service';

@Module({
	imports: [SharedModule],
	controllers: [],
	providers: [MusicSettingsService, MusicSettingsCommands],
})
export class MusicModule {}
