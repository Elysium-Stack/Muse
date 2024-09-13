import { Module } from '@nestjs/common';

import { SharedModule } from '@muse';

import { TimezoneSetCommands } from './commands/set.commands';
import { TimezoneSettingsCommands } from './commands/settings.commands';
import { TimezoneViewCommands } from './commands/view.commands';
import { TimezoneMessageEvents } from './events/message.events';
import { TimezoneSettingsService } from './services';
import { TimezoneGeneralService } from './services/general.service';

@Module({
	imports: [SharedModule],
	controllers: [],
	providers: [
		// services
		TimezoneSettingsService,
		TimezoneGeneralService,

		// events
		TimezoneMessageEvents,

		// commands
		TimezoneSetCommands,
		TimezoneViewCommands,
		TimezoneSettingsCommands,
	],
})
export class TimezoneModule {}
