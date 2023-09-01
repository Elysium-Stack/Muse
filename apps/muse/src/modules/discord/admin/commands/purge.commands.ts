import { Logger, UseFilters, UseGuards } from '@nestjs/common';
import {
	AdminGuard,
	ForbiddenExceptionFilter,
	GuildModeratorGuard,
	MESSAGE_PREFIX,
} from '@util';
import { ChannelType } from 'discord.js';
import {
	BooleanOption,
	Context,
	NumberOption,
	Options,
	SlashCommandContext,
	Subcommand,
} from 'necord';
import { AdminCommandDecorator } from '..';
import { AdminPurgeService } from '../services/purge.service';

class AdminPurgeListOptions {
	@NumberOption({
		name: 'months',
		description: 'The threshold for how old members have to be in months.',
		required: false,
		min_value: 1,
		max_value: 999,
	})
	months: number | undefined;

	@BooleanOption({
		name: 'userids-only',
		description:
			"Only return a list of user id's, this can be used for the kick command",
		required: false,
	})
	userIdsOnly: boolean | undefined;
}

@UseGuards(GuildModeratorGuard)
@UseFilters(ForbiddenExceptionFilter)
@AdminCommandDecorator({
	name: 'purge',
	description: 'Admin utility commands',
})
export class AdminPurgeCommands {
	private readonly _logger = new Logger(AdminPurgeCommands.name);

	constructor(private _purge: AdminPurgeService) {}

	@UseGuards(AdminGuard)
	@UseFilters(ForbiddenExceptionFilter)
	@Subcommand({
		name: 'clear',
		description: 'Clear the purge progress map',
	})
	public async clear(@Context() [interaction]: SlashCommandContext) {
		this._purge.clearMap();

		return interaction.reply({
			content: `${MESSAGE_PREFIX} Done.`,
			ephemeral: true,
		});
	}

	@Subcommand({
		name: 'list',
		description: 'List all users that can be purged',
	})
	public async list(
		@Context() [interaction]: SlashCommandContext,
		@Options() { months, userIdsOnly }: AdminPurgeListOptions,
	) {
		if (this._purge.checkGuild(interaction.guildId)) {
			return interaction.reply({
				content: `${MESSAGE_PREFIX} A purge check is already running, please wait a minute for it\'s reply.`,
				ephemeral: true,
			});
		}

		if (interaction.channel.type !== ChannelType.GuildText) {
			return interaction.reply({
				content: `${MESSAGE_PREFIX} This command can only be used in a guild text channel.`,
				ephemeral: true,
			});
		}

		this._logger.log(`Starting purge check for "${interaction.guildId}"`);
		this._purge.createList(
			interaction.user,
			interaction.guild,
			interaction.channel,
			months ?? 6,
			userIdsOnly ?? false,
		);

		return interaction.reply({
			content: `${MESSAGE_PREFIX} Getting a list of purgeable members has started. **This can take a while.**\nA response will be sent to this channel with the outcome.`,
		});
	}
}
