import { Injectable, Logger } from '@nestjs/common';
import { Events } from 'discord.js';
import { Context, ContextOf, On } from 'necord';

import { CustomRoleGeneralService } from '../services/general.service';

@Injectable()
export class CustomRoleRoleEvents {
	private readonly _logger = new Logger(CustomRoleRoleEvents.name);

	constructor(private _general: CustomRoleGeneralService) {}

	@On(Events.GuildRoleDelete)
	public async onGuildRoleDelete(
		@Context() [role]: ContextOf<Events.GuildRoleDelete>
	) {
		return this._general.removeByGuildAndRoleId(role.guild.id, role.id);
	}
}
