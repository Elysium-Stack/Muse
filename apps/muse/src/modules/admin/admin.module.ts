import { SharedModule } from '@muse';
import { Module } from '@nestjs/common';
import { AdminUtilsCommands } from './commands/util.commands';

@Module({
	imports: [SharedModule],
	controllers: [],
	providers: [AdminUtilsCommands],
})
export class AdminModule {}
