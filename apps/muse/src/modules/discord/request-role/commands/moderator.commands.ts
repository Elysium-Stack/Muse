import { Logger, UseFilters, UseGuards } from '@nestjs/common';
import {
	ActionRowBuilder,
	ButtonBuilder,
	ButtonInteraction,
	ButtonStyle,
	CommandInteraction,
	EmbedBuilder,
	ModalActionRowComponentBuilder,
	ModalBuilder,
	Role,
	RoleSelectMenuBuilder,
	TextInputBuilder,
	TextInputStyle,
} from 'discord.js';
import {
	Button,
	ButtonContext,
	ComponentParam,
	Context,
	Ctx,
	ISelectedRoles,
	Modal,
	ModalContext,
	ModalParam,
	NumberOption,
	Options,
	RoleOption,
	RoleSelect,
	RoleSelectContext,
	SelectedRoles,
	SlashCommandContext,
	Subcommand,
} from 'necord';

import { RequestRoleCommandDecorator } from '../request-role.decorator';
import { RequestRoleGeneralService } from '../services';
import { REQUEST_ROLE_EMBED_COLOR } from '../util/constants';

import { DiscordComponentsArrayDTO } from '@muse/types/discord-components-array.type';
import { createListButtons } from '@muse/util/create-list-buttons';

import { Prisma } from '@prisma/client';

import { ForbiddenExceptionFilter, MESSAGE_PREFIX } from '@util';

import { GuildModeratorGuard } from '@util/guards';

class FeedbackTopicsListOptions {
	@NumberOption({
		name: 'page',
		description: 'The page to view',
		required: false,
		min_value: 1,
		max_value: 999,
	})
	page: number | undefined;
}

class RequestRoleCreateOptions {
	@RoleOption({
		name: 'role',
		description: 'The role to create an entry for',
		required: true,
	})
	role: Role;
}

class RequestRoleRemoveOptions {
	@NumberOption({
		name: 'id',
		description: 'The id of a entry to remove',
		required: true,
	})
	id: number | undefined;
}

@UseGuards(GuildModeratorGuard)
@UseFilters(ForbiddenExceptionFilter)
@RequestRoleCommandDecorator({
	name: 'manage',
	description: 'Request role manage entries commands',
	options: [],
})
export class RequestRoleModeratorCommands {
	private readonly _logger = new Logger(RequestRoleModeratorCommands.name);

	constructor(private _requestRole: RequestRoleGeneralService) {}

	@Subcommand({
		name: 'list',
		description: 'List request role entries',
	})
	public async list(
		@Context() [interaction]: SlashCommandContext,
		@Options() { page }: FeedbackTopicsListOptions
	) {
		this._logger.verbose(
			`Listing request role entries for ${interaction.guildId}`
		);

		return this._listEntries(interaction, page);
	}

	@Button('REQUEST_ROLE_LIST/:page')
	public onShowButton(
		@Context()
		[interaction]: ButtonContext,
		@ComponentParam('page') page: string
	) {
		const pageInt = Number.parseInt(page, 10);
		return this._listEntries(interaction, pageInt);
	}

	@Subcommand({
		name: 'add',
		description: 'Add a role entry',
	})
	public async add(
		@Context() [interaction]: SlashCommandContext,
		@Options() { role }: RequestRoleCreateOptions
	) {
		this._logger.verbose(
			`Adding request role entry for ${interaction.guildId} - ${role.id}`
		);

		const exists = await this._requestRole.getEntryByRoleId(
			interaction.guildId,
			role.id
		);

		if (exists) {
			return interaction.reply({
				content: `An entry for the role <@&${role.id}> already exists.`,
				ephemeral: true,
			});
		}

		const modal = new ModalBuilder()
			.setTitle(`Terms for request role`)
			.setCustomId(`REQUEST_ROLE_SET_TERMS/${role.id}`)
			.setComponents([
				new ActionRowBuilder<ModalActionRowComponentBuilder>().addComponents(
					[
						new TextInputBuilder()
							.setCustomId('tos')
							.setLabel('tos (optional)')
							.setPlaceholder('You must be a good person...')
							.setRequired(false)
							.setStyle(TextInputStyle.Paragraph),
					]
				),
			]);

		return interaction.showModal(modal);
	}

	@Subcommand({
		name: 'remove',
		description: 'Remove a role entry',
	})
	public async remove(
		@Context() [interaction]: SlashCommandContext,
		@Options() { id }: RequestRoleRemoveOptions
	) {
		this._logger.verbose(
			`Removing request role entry for ${interaction.guildId} - ${id}`
		);

		const topic = await this._requestRole.removeEntryById(
			interaction.guildId,
			id
		);

		if (!topic) {
			return interaction.reply({
				content: `${MESSAGE_PREFIX} That topic doesn't exist`,
				ephemeral: true,
			});
		}

		return interaction.reply({
			content: `${MESSAGE_PREFIX} Removed feedback topic with ID "${topic.id}"`,
			ephemeral: true,
		});
	}

	@Modal('REQUEST_ROLE_SET_TERMS/:roleId')
	public async onRequestRoleAddModalResponse(
		@Ctx() [interaction]: ModalContext,
		@ModalParam('roleId') roleId: string
	) {
		const tos = interaction.fields.getTextInputValue('tos');

		const entry = await this._requestRole.addEntry(
			interaction.guildId,
			roleId,
			tos
		);

		return interaction.reply({
			content: `${MESSAGE_PREFIX} What roles are allowed to do this request (optional)?`,
			components: [
				new ActionRowBuilder<RoleSelectMenuBuilder>().addComponents(
					new RoleSelectMenuBuilder()
						.setCustomId(
							`REQUEST_ROLE_SET_REQUIRED_ROLES/${entry.id}`
						)
						.setMinValues(1)
						.setMaxValues(20)
						.setPlaceholder('Select the required roles')
				),
				new ActionRowBuilder<ButtonBuilder>().addComponents(
					new ButtonBuilder()
						.setCustomId(`REQUEST_ROLE_CONTINUE`)
						.setLabel('Skip')
						.setStyle(ButtonStyle.Secondary)
				),
			],
			ephemeral: true,
		});
	}

	@RoleSelect('REQUEST_ROLE_SET_REQUIRED_ROLES/:id')
	public async onRequiredRolesChange(
		@Context() [interaction]: RoleSelectContext,
		@ComponentParam('id') id: string,
		@SelectedRoles() [ids]: ISelectedRoles
	) {
		const parsedIds = ids.filter(i => typeof i === 'string') as string[];

		if (parsedIds?.length) {
			const parsedId = Number.parseInt(id, 10);
			await this._requestRole.setRolesById(parsedId, parsedIds);
		}

		return interaction.update({
			content: `${MESSAGE_PREFIX} Entry has been saved!`,
			components: [],
		});
	}

	@Button('REQUEST_ROLE_CONTINUE')
	public onContinueButton(@Context() [interaction]: ButtonContext) {
		return interaction.update({
			content: `${MESSAGE_PREFIX} Entry has been saved!`,
			components: [],
		});
	}

	private async _listEntries(
		interaction: CommandInteraction | ButtonInteraction,
		page = 1
	) {
		page = page ?? 1;

		const { entries, total } = await this._requestRole.getEntriesPerPage(
			interaction.guildId,
			page
		);

		if (!total) {
			const data = {
				content: `${MESSAGE_PREFIX} No entries have been configured yet`,
				embeds: [],
				components: [],
			};

			if (interaction instanceof ButtonInteraction) {
				return interaction.update(data);
			}

			return interaction.reply({
				...data,
				ephemeral: true,
			});
		}

		if (!entries?.length) {
			const data = {
				content: `${MESSAGE_PREFIX} No entries found for page ${page}`,
				embeds: [],
				components: [],
			};

			if (interaction instanceof ButtonInteraction) {
				return interaction.update(data);
			}

			return interaction.reply({
				...data,
				ephemeral: true,
			});
		}

		const maxPage = Math.ceil(total / 10);

		let embed = new EmbedBuilder()
			.setTitle(
				`${MESSAGE_PREFIX} Request role entries for ${interaction.guild.name}`
			)
			.setColor(REQUEST_ROLE_EMBED_COLOR)
			.addFields([
				{
					name: 'ID',
					value: entries.map(e => e.id).join('\n'),
					inline: true,
				},
				{
					name: 'Role',
					value: entries.map(e => `<@&${e.roleId}>`).join('\n'),
					inline: true,
				},
				{
					name: 'Required Roles',
					value: entries
						.map(e =>
							(e.requiredRoles as Prisma.JsonArray).join(', ')
						)
						.join('\n'),
					inline: true,
				},
			]);

		if (maxPage > 1) {
			embed = embed.setFooter({
				text: `Page ${page}/${maxPage}`,
			});
		}

		const buttons = createListButtons('REQUEST_ROLE_LIST', page, maxPage);
		const components: DiscordComponentsArrayDTO = [];

		if (buttons.length > 0) {
			components.push(
				new ActionRowBuilder<ButtonBuilder>().addComponents(buttons)
			);
		}

		if (interaction instanceof ButtonInteraction) {
			return interaction.update({
				embeds: [embed],
				components,
			});
		}

		return interaction.reply({
			embeds: [embed],
			components,
			ephemeral: true,
		});
	}
}
