import { Module } from '@nestjs/common';

import { SharedModule } from '@muse';

import { ModLogSettingsCommands } from './commands/settings.commands';
import { ModLogMemberEvents } from './events/member.events';
import { ModLogMessageEvents } from './events/message.events';
import { ModLogSettingsService } from './services';

@Module({
	imports: [SharedModule],
	controllers: [],
	providers: [
		//services
		ModLogSettingsService,

		//events
		ModLogMessageEvents,
		ModLogMemberEvents,

		//commands
		ModLogSettingsCommands,
	],
})
export class ModLogModule {}
