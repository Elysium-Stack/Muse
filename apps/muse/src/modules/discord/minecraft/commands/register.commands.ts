import { Logger, UseFilters, UseGuards } from '@nestjs/common';
import { EnabledExceptionFilter, ForbiddenExceptionFilter } from '@util';
import { Client } from 'discord.js';
import {
	Context,
	Options,
	SlashCommandContext,
	StringOption,
	Subcommand,
} from 'necord';
import { MinecraftEnabledGuard } from '../guards/enabled.guard';
import { MinecraftRequiredRoleGuard } from '../guards/required-role.guard';
import { MinecraftCommandDecorator } from '../minecraft.decorator';
import { MinecraftRegisterService } from '../services/register.service';
import { MinecraftSettingsService } from '../services/settings.service';

class MinecraftRegisterOptions {
	@StringOption({
		name: 'username',
		description: 'Your minecraft username',
		required: true,
	})
	username: string | undefined;
}

@UseGuards(MinecraftEnabledGuard)
@UseFilters(EnabledExceptionFilter)
@MinecraftCommandDecorator()
export class MinecraftRegisterCommands {
	private readonly _logger = new Logger(MinecraftRegisterCommands.name);

	constructor(
		private _register: MinecraftRegisterService,
		private _settings: MinecraftSettingsService,
		private _client: Client,
	) {}

	@UseGuards(MinecraftRequiredRoleGuard)
	@UseFilters(ForbiddenExceptionFilter)
	@Subcommand({
		name: 'register',
		description: 'Register to the whitelist',
	})
	public async register(
		@Context() [interaction]: SlashCommandContext,
		@Options() { username }: MinecraftRegisterOptions,
	) {
		this._logger.verbose(`Register for the minecraft server`);

		if (!username) {
			return interaction.reply({
				content: 'Please provide a username',
				ephemeral: true,
			});
		}

		const userData = await this._register.fetchUserData(username);

		if (!userData?.id) {
			return interaction.reply({
				content:
					'I am sorry, but I could not find a user with that username on the minecraft database.',
				ephemeral: true,
			});
		}

		const response = await this._register.register(
			interaction.guildId,
			interaction.user.id,
			userData.uuid,
			userData.name,
		);
		if (response === null) {
			return interaction.reply({
				content: `Something wen't wrong registering you to our server, please try again later`,
				ephemeral: true,
			});
		}

		const { connectUrl } = await this._settings.get(interaction.guildId);
		return interaction.reply({
			content: `Welcome ${
				userData.name
			}, You've been whitelisted on our server.${
				connectUrl ? `\nJoin now at **${connectUrl}**` : ''
			}`,
			ephemeral: true,
		});
	}
}
