import { SharedModule } from '@muse';
import { Module } from '@nestjs/common';
import { StarboardSettingsCommands } from './commands/settings.commands';
import { StarboardReactionEvents } from './events/reaction.events';
import { StarboardGeneralService } from './services';
import { StarboardSettingsService } from './services/settings.service';

@Module({
	imports: [SharedModule],
	controllers: [],
	providers: [
		StarboardSettingsService,
		StarboardGeneralService,

		// events
		StarboardReactionEvents,

		// commands
		StarboardSettingsCommands,
	],
})
export class StarboardModule {}
