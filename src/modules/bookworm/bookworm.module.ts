import { SharedModule } from '@hermes';
import { Module } from '@nestjs/common';
import { BookwormGeneralCommands } from './commands/general.commands';
import { BookwormSettingsCommands } from './commands/settings.commands';
import { BookwormGeneralService } from './services/general.service';
import { BookwormSettingsService } from './services/settings.service';

@Module({
	imports: [SharedModule],
	controllers: [],
	providers: [
		BookwormSettingsService,
		BookwormSettingsCommands,
		BookwormGeneralService,
		BookwormGeneralCommands,
	],
})
export class BookwormModule {}
