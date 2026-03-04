import { Logger, UseFilters, UseGuards } from '@nestjs/common';
import {
	ActionRowBuilder,
	ChannelType,
	ModalActionRowComponentBuilder,
	ModalBuilder,
	TextInputBuilder,
	TextInputStyle,
} from 'discord.js';
import {
	BooleanOption,
	Context,
	Modal,
	ModalContext,
	NumberOption,
	Options,
	SlashCommandContext,
	StringOption,
	Subcommand,
} from 'necord';

import { AdminCommandDecorator } from '..';
import { AdminPurgeService } from '../services/purge.service';

import {
	AdminGuard,
	ForbiddenExceptionFilter,
	GuildModeratorGuard,
	MESSAGE_PREFIX,
} from '@util';

class AdminPurgeListOptions {
	@StringOption({
		name: 'usertoken',
		description: 'A required user token to cheat the search system',
		required: true,
	})
	userToken: string;

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
		@Options() { months, userIdsOnly, userToken }: AdminPurgeListOptions
	) {
		if (this._purge.checkGuild(interaction.guildId)) {
			return interaction.reply({
				content: `${MESSAGE_PREFIX} A purge check is already running, please wait a minute for it's reply.`,
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
			userToken,
			months ?? 6,
			userIdsOnly ?? false
		);

		return interaction.reply({
			content: `${MESSAGE_PREFIX} Getting a list of purgeable members has started. **This can take a few minutes.**\nA response will be sent to this channel with the outcome.`,
			ephemeral: true,
		});
	}

	@Subcommand({
		name: 'yeet',
		description: "yeet a list of userid's",
	})
	public async yeet(@Context() [interaction]: SlashCommandContext) {
		const modal = new ModalBuilder()
			.setTitle('Uno yeet momento')
			.setCustomId(`ADMIN_PURGE_YEET_MODAL`)
			.setComponents([
				new ActionRowBuilder<ModalActionRowComponentBuilder>().addComponents(
					[
						new TextInputBuilder()
							.setCustomId('reason')
							.setLabel('Reason for kicking members')
							.setRequired(true)
							.setMaxLength(120)
							.setStyle(TextInputStyle.Short),
					]
				),
				new ActionRowBuilder<ModalActionRowComponentBuilder>().addComponents(
					[
						new TextInputBuilder()
							.setCustomId('userids')
							.setLabel("List of user id's. **COMMA SEPERATED**")
							.setRequired(true)
							.setStyle(TextInputStyle.Paragraph),
					]
				),
				new ActionRowBuilder<ModalActionRowComponentBuilder>().addComponents(
					[
						new TextInputBuilder()
							.setCustomId('message')
							.setLabel('A kick message')
							.setPlaceholder(
								'You can use {username} to address them by their username.'
							)
							.setRequired(false)
							.setStyle(TextInputStyle.Paragraph),
					]
				),
			]);

		return interaction.showModal(modal);
	}

	@Modal('ADMIN_PURGE_YEET_MODAL')
	public async onYeetModal(@Context() [interaction]: ModalContext) {
		const userids = interaction.fields.getTextInputValue('userids');
		const message = interaction.fields.getTextInputValue('message');
		const reason = interaction.fields.getTextInputValue('reason');

		await interaction.deferReply({
			ephemeral: true,
		});

		const ids = userids.split(',').map(id => id.trim());
		if (ids.length === 0) {
			return interaction.editReply({
				content: `${MESSAGE_PREFIX} No id's were supplied. Skipping yeet!`,
			});
		}

		const amount = await this._purge.kickMembers(
			interaction.guild,
			ids,
			reason,
			message
		);

		return interaction.editReply({
			content: `${MESSAGE_PREFIX} yeeted **${amount}** people **${
				message.length > 0 ? 'with' : 'without'
			}** a message!
${
	message
		? `\`\`\`
${message}
\`\`\``
		: ''
}`,
		});
	}
}
