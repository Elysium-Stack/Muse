import { SharedModule } from '@muse';
import { Module } from '@nestjs/common';
import { MinecraftRegisterCommands } from './commands/register.commands';
import { MinecraftSettingsCommands } from './commands/settings.commands';
import { MinecraftRegisterService } from './services/register.service';
import { MinecraftSettingsService } from './services/settings.service';

@Module({
	imports: [SharedModule],
	controllers: [],
	providers: [
		MinecraftSettingsService,
		MinecraftSettingsCommands,
		MinecraftRegisterService,
		MinecraftRegisterCommands,
	],
})
export class MinecraftModule {}
