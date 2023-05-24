import { SharedModule } from '@muse';
import { Module } from '@nestjs/common';
import { ReactionTriggerGeneralCommands } from './commands/general.commands';
import { ReactionTriggerSettingsCommands } from './commands/settings.commands';
import { ReactionTriggerMessageEvents } from './events/message.events';
import { ReactionTriggerGeneralService } from './services/general.service';
import { ReactionTriggerSettingsService } from './services/settings.service';

@Module({
	imports: [SharedModule],
	controllers: [],
	providers: [
		ReactionTriggerGeneralService,
		ReactionTriggerSettingsService,

		// events
		ReactionTriggerMessageEvents,

		// commands
		ReactionTriggerGeneralCommands,
		ReactionTriggerSettingsCommands,
	],
})
export class ReactionTriggerModule {}
