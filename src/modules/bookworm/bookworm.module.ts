import { SharedModule } from '@hermes';
import { Module } from '@nestjs/common';
import { BookwormSettingsCommands } from './commands/settings.commands';
import { BookwormSettingsService } from './services/bookworm.service';

@Module({
	imports: [SharedModule],
	controllers: [],
	providers: [BookwormSettingsService, BookwormSettingsCommands],
})
export class BookwormModule {}
