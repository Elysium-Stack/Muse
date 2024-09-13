import { Module } from '@nestjs/common';

import { SharedModule } from '@muse/shared.module';

import { FeedbackGeneralCommands } from './commands/general.commands';
import { FeedbackModeratorCommands } from './commands/moderator.commands';
import { FeedbackService } from './services/feedback.service';

@Module({
	imports: [SharedModule],
	controllers: [],
	providers: [
		FeedbackService,
		FeedbackModeratorCommands,
		FeedbackGeneralCommands,
	],
	exports: [],
})
export class FeedbackModule {}
