import { Module } from '@nestjs/common';

import { SharedModule } from '@muse';

import { MessageTriggerGeneralCommands } from './commands/general.commands';
import { MessageTriggerSettingsCommands } from './commands/settings.commands';
import { MessageTriggerMessageEvents } from './events/message.events';
import { MessageTriggerGeneralService } from './services/general.service';
import { MessageTriggerSettingsService } from './services/settings.service';

@Module({
	imports: [SharedModule],
	controllers: [],
	providers: [
		MessageTriggerGeneralService,
		MessageTriggerSettingsService,

		// events
		MessageTriggerMessageEvents,

		// commands
		MessageTriggerGeneralCommands,
		MessageTriggerSettingsCommands,
	],
})
export class MessageTriggerModule {}
