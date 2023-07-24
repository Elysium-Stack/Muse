import { Injectable, Logger } from '@nestjs/common';
import { Events } from 'discord.js';
import { Context, ContextOf, On } from 'necord';
import { MinecraftRegisterService } from '../services/register.service';

@Injectable()
export class MinecraftMemberEvents {
	private readonly _logger = new Logger(MinecraftMemberEvents.name);

	constructor(private _register: MinecraftRegisterService) {}

	@On(Events.GuildMemberRemove)
	public async onGuildMemberRemove(
		@Context() [member]: ContextOf<Events.GuildMemberRemove>,
	) {
		const guildId = member.guild.id;

		await this._register.removeAll(guildId, member.id);
		this._logger.log('Member left, deregistered from whitelist');
	}
}
