import { Module } from '@nestjs/common';

import { SharedModule } from '@muse';

import { CustomRoleGeneralCommands } from './commands/general.commands';
import { CustomRoleSettingsCommands } from './commands/settings.commands';
import { CustomRoleMemberEvents } from './events/member.events';
import { CustomRoleRoleEvents } from './events/role.events';
import { CustomRoleGeneralService } from './services/general.service';
import { CustomRoleSettingsService } from './services/settings.service';

@Module({
	imports: [SharedModule],
	controllers: [],
	providers: [
		CustomRoleGeneralService,
		CustomRoleGeneralCommands,
		CustomRoleSettingsService,
		CustomRoleSettingsCommands,

		CustomRoleMemberEvents,
		CustomRoleRoleEvents,
	],
})
export class CustomRoleModule {}
