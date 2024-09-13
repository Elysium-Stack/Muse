import { SharedModule } from '@muse/shared.module';
import { Module } from '@nestjs/common';

import { RequestRoleGeneralCommands } from './commands/general.commands';
import { RequestRoleModeratorCommands } from './commands/moderator.commands';
import { RequestRoleSettingsCommands } from './commands/settings.commands';
import { RequestRoleSettingsService } from './services';
import { RequestRoleGeneralService } from './services/request-role.service';

@Module({
	imports: [SharedModule],
	controllers: [],
	providers: [
		RequestRoleGeneralService,
		RequestRoleSettingsService,

		RequestRoleModeratorCommands,
		RequestRoleGeneralCommands,
		RequestRoleSettingsCommands,
	],
	exports: [],
})
export class RequestRoleModule {}
