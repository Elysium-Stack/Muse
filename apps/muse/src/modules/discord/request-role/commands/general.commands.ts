import { Logger } from '@nestjs/common';
import {
	ActionRowBuilder,
	ButtonBuilder,
	ButtonStyle,
	EmbedBuilder,
	MessageComponentInteraction,
	Role,
	SelectMenuBuilder,
	StringSelectMenuBuilder,
	StringSelectMenuOptionBuilder,
} from 'discord.js';
import {
	Button,
	ButtonContext,
	ComponentParam,
	Context,
	SelectedStrings,
	SlashCommandContext,
	StringSelect,
	StringSelectContext,
	Subcommand,
} from 'necord';

import { RequestRoleCommandDecorator } from '../request-role.decorator';
import { RequestRoleGeneralService } from '../services';
import { REQUEST_ROLE_EMBED_COLOR } from '../util/constants';

import { Prisma, RequestRoleEntries } from '@prisma/client';

import { MESSAGE_PREFIX } from '@util';

@RequestRoleCommandDecorator()
export class RequestRoleGeneralCommands {
	private readonly _logger = new Logger(RequestRoleGeneralCommands.name);

	constructor(private _requestRole: RequestRoleGeneralService) {}

	@Subcommand({
		name: 'request',
		description: 'Request a role',
	})
	public async give(@Context() [interaction]: SlashCommandContext) {
		const entries = await this._requestRole.getAllEntries(interaction.guildId);

		const entriesWithRole = (await Promise.all(
			entries.map(async e => {
				const role = await interaction.guild.roles
					.fetch(e.roleId)
					.catch(() => null);
				if (!role) {
					return e;
				}

				return {
					...e,
					role,
				};
			})
		)) as (RequestRoleEntries & { role: Role })[];

		const select = new StringSelectMenuBuilder()
			.setCustomId('REQUEST_ROLE_SELECT')
			.setPlaceholder("Select the role you'd like to request.")
			.setOptions(
				entriesWithRole
					.filter(e => !!e.role)
					.map(({ id, role }) =>
						new StringSelectMenuOptionBuilder()
							.setLabel(`${role.name}`)
							.setValue(id.toString())
					)
			);

		const selectRow = new ActionRowBuilder<SelectMenuBuilder>().addComponents(
			select
		);

		const data = {
			content: `${MESSAGE_PREFIX} What role would you like to request?`,
			embeds: [],
			components: [selectRow],
		};

		return interaction.reply({
			...data,
			ephemeral: true,
		});
	}

	@StringSelect('REQUEST_ROLE_SELECT')
	public async onTopicSelect(
		@Context() [interaction]: StringSelectContext,
		@SelectedStrings() [entryId]: string[]
	) {
		this._logger.log(
			`User ${interaction.user.id} requested role for entry ${entryId}`
		);

		const parsedEntryId = Number.parseInt(entryId, 10);
		const entry = await this._requestRole.getEntryById(parsedEntryId);

		if (
			(entry.blacklistedUsers as Prisma.JsonArray).includes(interaction.user.id)
		) {
			return interaction.update({
				content: `${MESSAGE_PREFIX} Sorry, you've been blacklisted from requesting this role`,
				components: [],
			});
		}

		const requiredRoles = entry.requiredRoles as Prisma.JsonArray;
		if (requiredRoles.length > 0) {
			const member = await interaction.guild.members.fetch(interaction.user.id);
			const allowed = member.roles.cache.some(role =>
				requiredRoles.includes(role.id)
			);

			if (!allowed) {
				return interaction.update({
					content: `${MESSAGE_PREFIX} Sorry, You do not have one of the required roles: ${requiredRoles
						.map(r => `<@&${r}>`)
						.join(', ')}`,
					components: [],
					allowedMentions: {
						roles: [],
					},
				});
			}
		}

		const role = await interaction.guild.roles.fetch(entry.roleId);

		if (entry.tos?.length) {
			const embed = new EmbedBuilder()
				.setTitle(`Request ${role.name} role terms`)
				.setDescription(entry.tos)
				.setColor(REQUEST_ROLE_EMBED_COLOR);
			return interaction.update({
				content: '',
				embeds: [embed],
				components: [
					new ActionRowBuilder<ButtonBuilder>().addComponents(
						new ButtonBuilder()
							.setCustomId(`REQUEST_ROLE_ACCEPT/${entry.id}`)
							.setLabel('✅')
							.setStyle(ButtonStyle.Primary),
						new ButtonBuilder()
							.setCustomId(`REQUEST_ROLE_DECLINE`)
							.setLabel('❌')
							.setStyle(ButtonStyle.Secondary)
					),
				],
			});
		}

		return this._setRole(interaction, entry.id);
	}

	@Button('REQUEST_ROLE_ACCEPT/:entryId')
	public onAcceptButton(
		@Context()
		[interaction]: ButtonContext,
		@ComponentParam('entryId') entryId: string
	) {
		const parsedEntryId = Number.parseInt(entryId, 10);

		return this._setRole(interaction, parsedEntryId);
	}

	@Button('REQUEST_ROLE_DECLINE')
	public onDeclineButton(
		@Context()
		[interaction]: ButtonContext
	) {
		return interaction.update({
			content: `${MESSAGE_PREFIX} That's alright, try again later!`,
			components: [],
			embeds: [],
		});
	}

	private async _setRole(
		interaction: MessageComponentInteraction,
		entryId: number
	) {
		const { success, role } = await this._requestRole.giveRole(
			interaction.guildId,
			interaction.user.id,
			entryId
		);

		const baseData = {
			allowedMentions: {
				roles: [],
			},
			components: [],
			embeds: [],
		};

		if (!role) {
			return interaction.update({
				...baseData,
				content: `${MESSAGE_PREFIX} Something wen't wrong, try again later.`,
			});
		}

		if (!success) {
			return interaction.update({
				...baseData,
				content: `${MESSAGE_PREFIX} I wasn't able to set the role, please notify any of the moderators of this problem.`,
			});
		}

		return interaction.update({
			...baseData,
			content: `${MESSAGE_PREFIX} You have now acquired the role <@&${role.id}>`,
		});
	}
}
