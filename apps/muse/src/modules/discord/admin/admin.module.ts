import { SharedModule } from '@muse';
import { Module } from '@nestjs/common';
import { AdminSayCommands } from './commands/say.commands';
import { AdminUtilsCommands } from './commands/util.commands';

@Module({
	imports: [SharedModule],
	controllers: [],
	providers: [AdminUtilsCommands, AdminSayCommands],
})
export class AdminModule {}
