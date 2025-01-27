import { Injectable, Logger } from '@nestjs/common';
import { Events } from 'discord.js';
import { Context, ContextOf, On } from 'necord';

import { CustomRoleGeneralService } from '../services/general.service';

@Injectable()
export class CustomRoleMemberEvents {
	private readonly _logger = new Logger(CustomRoleMemberEvents.name);

	constructor(private _general: CustomRoleGeneralService) {}

	@On(Events.GuildMemberRemove)
	public async onGuildMemberRemove(
		@Context() [member]: ContextOf<Events.GuildMemberRemove>
	) {
		return this._general.removeByGuildAndUserId(
			member.guild.id,
			member.user.id
		);
	}

	@On(Events.GuildMemberUpdate)
	public async guildMemberUpdatePremium(
		@Context() [oldMember, member]: ContextOf<Events.GuildMemberUpdate>
	) {
		if (oldMember.premiumSinceTimestamp === member.premiumSinceTimestamp) {
			return;
		}

		this._logger.log(
			`Premium status changed for ${member.user.tag} (${member.user.id}) from=${oldMember.premiumSinceTimestamp} to=${member.premiumSinceTimestamp}`
		);

		const map = await this._general.findByGuildAndUserId(
			member.guild.id,
			member.user.id
		);

		if (!map) {
			return;
		}

		const role = await member.guild.roles.fetch(map.roleId);

		if (!role) {
			this._logger.warn(
				`Removing map for ${member.user.tag} (${member.user.id}) at ${member.guild.id}`
			);
			await this._general.removeByGuildAndUserId(
				member.guild.id,
				member.user.id
			);
			return;
		}

		if (!member.premiumSinceTimestamp) {
			this._logger.warn(
				`Removing role from ${member.user.tag} because they are no longer a booster`
			);
			await member.roles.remove(role).catch(() => null);
			await this._general.removeByGuildAndUserId(
				member.guild.id,
				member.user.id
			);
			return;
		}

		await member.roles.add(role).catch(error => {
			this._logger.error(error);
			this._logger.warn(
				`Removing map for ${member.user.tag} (${member.user.id}) at ${member.guild.id} because of an error`
			);
			this._general.removeByGuildAndUserId(
				member.guild.id,
				member.user.id
			);
		});
	}
}
