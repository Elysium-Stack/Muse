import { Logger, UseFilters, UseGuards } from '@nestjs/common';
import { Client } from 'discord.js';
import {
	BooleanOption,
	Context,
	Options,
	SlashCommandContext,
	StringOption,
	Subcommand,
} from 'necord';

import { MinecraftEnabledGuard } from '../guards/enabled.guard';
import { MinecraftRequiredRoleGuard } from '../guards/required-role.guard';
import { MinecraftCommandDecorator } from '../minecraft.decorator';
import { MinecraftGeneralService } from '../services/general.service';
import { MinecraftSettingsService } from '../services/settings.service';

import {
	EnabledExceptionFilter,
	ForbiddenExceptionFilter,
	MESSAGE_PREFIX,
} from '@util';

class MinecraftRegisterOptions {
	@StringOption({
		name: 'username',
		description: 'Your minecraft username',
		required: true,
	})
	username: string | undefined;

	@BooleanOption({
		name: 'bedrock',
		description: "Wether your'e playing on bedrock or not",
		required: false,
	})
	bedrock: boolean | undefined;
}

@UseGuards(MinecraftEnabledGuard)
@UseFilters(EnabledExceptionFilter)
@MinecraftCommandDecorator()
export class MinecraftRegisterCommands {
	private readonly _logger = new Logger(MinecraftRegisterCommands.name);

	constructor(
		private _general: MinecraftGeneralService,
		private _settings: MinecraftSettingsService,
		private _client: Client
	) {}

	@UseGuards(MinecraftRequiredRoleGuard)
	@UseFilters(ForbiddenExceptionFilter)
	@Subcommand({
		name: 'register',
		description: 'Register to the whitelist',
	})
	public async register(
		@Context() [interaction]: SlashCommandContext,
		@Options() { username, bedrock }: MinecraftRegisterOptions
	) {
		this._logger.verbose(`Register for the minecraft server`);

		bedrock = bedrock ?? false;

		if (!username) {
			return interaction.reply({
				content: `${MESSAGE_PREFIX} Please provide a username`,
				ephemeral: true,
			});
		}

		const { connectUrl, bedrockPort, bedrockEnabled } =
			await this._settings.get(interaction.guildId);

		if (bedrock && !bedrockEnabled) {
			return interaction.reply({
				content: `${MESSAGE_PREFIX} I am sorry, but bedrock registrations are disabled.`,
				ephemeral: true,
			});
		}

		const userData = await this._general.fetchUserData(username, bedrock);

		if (!userData?.uuid) {
			return interaction.reply({
				content: `${MESSAGE_PREFIX} I am sorry, but I could not find a user with that username on the ${bedrock ? 'xbox' : 'minecraft'} database.`,
				ephemeral: true,
			});
		}

		await interaction.deferReply({
			ephemeral: true,
		});
		await this._general.register(
			interaction.guildId,
			interaction.user.id,
			userData.uuid,
			userData.name,
			bedrock
		);
		// if (response === null) {
		// 	return interaction.reply({
		// 		content: `${MESSAGE_PREFIX} Something wen't wrong registering you to our server, please try again later`,
		// 		ephemeral: true,
		// 	});
		// }

		return interaction.followUp({
			content: `${MESSAGE_PREFIX} Welcome ${
				userData.name
			}, You've been whitelisted on our server.${
				connectUrl
					? `\nJoin now at **${connectUrl}**${
							bedrock ? ` with port **${bedrockPort}**` : ''
						}`
					: ''
			}`,
		});
	}
}
