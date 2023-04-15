import { Module } from '@nestjs/common';
import { AdminUtilsCommands } from './commands/util.commands';

@Module({
	imports: [],
	controllers: [],
	providers: [AdminUtilsCommands],
})
export class AdminModule {}
