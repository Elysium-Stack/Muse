import { SettingsService } from '@muse/modules/settings';
import { Injectable, Logger } from '@nestjs/common';
import { Events } from 'discord.js';
import { Context, ContextOf, On } from 'necord';

@Injectable()
export class GuildEvents {
	private readonly _logger = new Logger(GuildEvents.name);

	constructor(private readonly _settings: SettingsService) {}

	@On(Events.GuildCreate)
	public onGuildCreate(@Context() [guild]: ContextOf<Events.GuildCreate>) {
		this._logger.log(`Joined a new guild ${guild.name}`);
		this._settings.checkSettings(guild?.id);
	}

	@On(Events.GuildDelete)
	public onGuildDelete(@Context() [guild]: ContextOf<Events.GuildDelete>) {
		this._logger.log(`Deleted a guild ${guild.name}`);
	}
}
