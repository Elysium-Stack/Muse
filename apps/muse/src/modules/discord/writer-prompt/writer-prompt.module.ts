import { Module } from '@nestjs/common';

import { SharedModule } from '@muse';

import { WriterPromptGeneralCommands } from './commands/general.commands';
import { WriterPromptSettingsCommands } from './commands/settings.commands';
import { WriterPromptGeneralService } from './services/general.service';
import { WriterPromptSettingsService } from './services/settings.service';

@Module({
	imports: [SharedModule],
	controllers: [],
	providers: [
		WriterPromptSettingsService,
		WriterPromptSettingsCommands,
		WriterPromptGeneralService,
		WriterPromptGeneralCommands,
	],
})
export class WriterPromptModule {}
