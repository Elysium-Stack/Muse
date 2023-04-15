import { SettingsService } from '@hermes/modules/settings';
import { Injectable, Logger } from '@nestjs/common';
import { Events } from 'discord.js';
import { Context, ContextOf, On, Once } from 'necord';

@Injectable()
export class AppEvents {
	private readonly _logger = new Logger(AppEvents.name);

	constructor(private readonly _settings: SettingsService) {}

	@Once(Events.ClientReady)
	public onReady(@Context() [client]: ContextOf<Events.ClientReady>) {
		this._logger.log(`Bot logged in as ${client.user.username}`);
	}

	@On(Events.Warn)
	public onWarn(@Context() [message]: ContextOf<Events.Warn>) {
		this._logger.warn(message);
	}

	@On(Events.GuildCreate)
	public onGuildCreate(@Context() [guild]: ContextOf<Events.GuildCreate>) {
		this._settings.checkSettings(guild?.id);
	}

	@On(Events.InteractionCreate)
	public onInteractionCreate(
		@Context() [interaction]: ContextOf<Events.InteractionCreate>,
	) {
		if (!interaction.isChatInputCommand()) {
			return;
		}

		const { _group, _subcommand } = interaction.options as any;

		let commandName = interaction.commandName;
		if (_group) {
			commandName += ` ${_group}`;
		}
		if (_subcommand) {
			commandName += ` ${_subcommand}`;
		}

		this._logger.log(
			`Interaction "${commandName}" used by ${interaction.user.username}:${interaction.user.discriminator}!`,
		);
	}
}
