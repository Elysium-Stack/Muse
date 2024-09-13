import { Module } from '@nestjs/common';

import { SharedModule } from '@muse';

import { QotDGeneralCommands } from './commands/general.commands';
import { QotDSettingsCommands } from './commands/settings.commands';
import { QotDQuestionService } from './services/question.service';
import { QotDSettingsService } from './services/settings.service';

@Module({
	imports: [SharedModule],
	controllers: [],
	providers: [
		QotDSettingsService,
		QotDSettingsCommands,
		QotDQuestionService,
		QotDGeneralCommands,
	],
})
export class QotDModule {}
