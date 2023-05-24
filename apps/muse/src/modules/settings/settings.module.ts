import { Module } from '@nestjs/common';
import { SettingsCommands } from './commands/settings.commands';
import { SettingsSharedModule } from './settings.shared.module';

@Module({
	imports: [SettingsSharedModule],
	controllers: [],
	providers: [SettingsCommands],
	exports: [],
})
export class SettingsModule {}
