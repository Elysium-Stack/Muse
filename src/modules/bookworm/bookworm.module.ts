import { SharedModule } from '@muse';
import { Module } from '@nestjs/common';
import { BookwormGeneralCommands } from './commands/general.commands';
import { BookwormSettingsCommands } from './commands/settings.commands';
import { BookwormQuestionService } from './services/question.service';
import { BookwormSettingsService } from './services/settings.service';

@Module({
	imports: [SharedModule],
	controllers: [],
	providers: [
		BookwormSettingsService,
		BookwormSettingsCommands,
		BookwormQuestionService,
		BookwormGeneralCommands,
	],
})
export class BookwormModule {}
