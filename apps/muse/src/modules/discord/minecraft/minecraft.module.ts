import { SharedModule } from '@muse';
import { Module } from '@nestjs/common';
import { MinecraftRegisterCommands } from './commands/register.commands';
import { MinecraftSettingsCommands } from './commands/settings.commands';
import { MinecraftMemberEvents } from './events/member.events';
import { MinecraftMessageEvents } from './events/message.events';
import { MinecraftGeneralService } from './services/general.service';
import { MinecraftSettingsService } from './services/settings.service';

@Module({
	imports: [SharedModule],
	controllers: [],
	providers: [
		MinecraftSettingsService,
		MinecraftSettingsCommands,
		MinecraftGeneralService,
		MinecraftRegisterCommands,
		MinecraftMemberEvents,
		MinecraftMessageEvents,
	],
})
export class MinecraftModule {}
