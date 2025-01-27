import { Logger, UseFilters, UseGuards } from '@nestjs/common';
import {
	ActionRowBuilder,
	Attachment,
	ButtonBuilder,
	ButtonInteraction,
	ButtonStyle,
	Client,
	CommandInteraction,
	EmbedBuilder,
	Role,
} from 'discord.js';
import {
	AttachmentOption,
	Button,
	ButtonContext,
	ComponentParam,
	Context,
	NumberOption,
	Options,
	SlashCommandContext,
	StringOption,
	Subcommand,
} from 'necord';
import sharp, { Sharp } from 'sharp';

import { CustomRoleCommandDecorator } from '../custom-role.decorator';
import { CustomRoleEnabledGuard } from '../guards/enabled.guard';
import { CustomRoleIsBoosterGuard } from '../guards/is-booster.guard';
import { CustomRoleGeneralService } from '../services/general.service';
import { CustomRoleSettingsService } from '../services/settings.service';
import { CUSTOM_ROLE_EMBED_COLOR } from '../util/constants';

import { DiscordComponentsArrayDTO } from '@muse/types/discord-components-array.type';

import {
	EnabledExceptionFilter,
	ForbiddenExceptionFilter,
	GuildModeratorGuard,
	MESSAGE_PREFIX,
} from '@util';

class CustomRoleSetOptions {
	@StringOption({
		name: 'name',
		description: 'The name of your role',
		required: false,
	})
	name?: string;

	@StringOption({
		name: 'color',
		description: "Hexcode of the color you'd like",
		required: false,
	})
	color?: string;

	@AttachmentOption({
		name: 'icon',
		description: 'The icon for your role',
		required: false,
	})
	attachment?: Attachment;
}

class CustomRoleListOptions {
	@NumberOption({
		name: 'page',
		description: 'The page to view',
		required: false,
		min_value: 1,
		max_value: 999,
	})
	page: number | undefined;
}

@UseGuards(CustomRoleEnabledGuard)
@UseFilters(EnabledExceptionFilter, ForbiddenExceptionFilter)
@CustomRoleCommandDecorator()
export class CustomRoleGeneralCommands {
	private readonly _logger = new Logger(CustomRoleGeneralCommands.name);

	constructor(
		private _client: Client,
		private _general: CustomRoleGeneralService,
		private _settings: CustomRoleSettingsService
	) {}

	@UseGuards(CustomRoleIsBoosterGuard)
	@Subcommand({
		name: 'set',
		description: 'Set your custom role',
	})
	public async set(
		@Context() [interaction]: SlashCommandContext,
		@Options() { name, color, attachment }: CustomRoleSetOptions
	) {
		this._logger.verbose(`${interaction.user.tag} updated their role`);

		if (!name && !color && !attachment) {
			return interaction.reply({
				content: `${MESSAGE_PREFIX} You need to provide at least one of the following options: Name, Color, Icon.`,
				ephemeral: true,
			});
		}

		if (name && name.length > 100) {
			return interaction.reply({
				content: `${MESSAGE_PREFIX} Name of the role can't be longer than 100 characters.`,
				ephemeral: true,
			});
		}

		if (color && color.length > 0) {
			if (color[0] === '#') {
				color = color.slice(1);
			}

			if (!/^[\da-f]{6}$/i.test(color)) {
				return interaction.reply({
					content: `${MESSAGE_PREFIX} color must be a valid hex code.`,
					ephemeral: true,
				});
			}
		}

		let image: Buffer | undefined;
		if (attachment) {
			if (
				attachment.contentType !== 'image/png' &&
				attachment.contentType !== 'image/jpeg'
			) {
				return interaction.reply({
					content: `${MESSAGE_PREFIX} icon must be a png or jpeg image.`,
					ephemeral: true,
				});
			}

			const imageBuf = await this._handleUpload(attachment);
			image = await sharp(imageBuf).resize(128, 128).toBuffer();
		}

		await interaction.deferReply({
			ephemeral: true,
		});

		let map = await this._general.findByGuildAndUserId(
			interaction.guildId,
			interaction.user.id
		);
		const guild = await this._client.guilds.fetch(interaction.guildId);

		const { afterRoleId } = await this._settings.get(interaction.guildId);

		if (!afterRoleId) {
			return interaction.editReply({
				content: `${MESSAGE_PREFIX} Custom role settings aren't complete, please contact one of the admins`,
			});
		}

		const roleAfter = await guild.roles.fetch(afterRoleId);

		let role: Role;
		if (map) {
			role = await guild.roles.fetch(map.roleId);

			if (!role) {
				this._logger.error(
					`Role not found for user ${interaction.user.tag}, deleting..`
				);
				await this._general.removeByGuildAndUserId(
					interaction.guildId,
					interaction.user.id
				);
				map = undefined;
			}
		}

		if (!map) {
			if (!name || !color || !attachment) {
				return interaction.editReply({
					content: `${MESSAGE_PREFIX} For your first time you need to provide all of the following options: Name, Color, Icon.`,
				});
			}

			role = await guild.roles
				.create({
					name,
					color: Number.parseInt(color, 16),
					icon: image,
					position: roleAfter.position - 1,
				})
				.catch(error => {
					console.log(error);
					this._logger.error(error);
					return null;
				});

			if (!role) {
				return interaction.editReply({
					content: `${MESSAGE_PREFIX} Something went wrong while creating your role, please try again later.`,
				});
			}

			const member = await guild.members.fetch(interaction.user.id);
			await member.roles.add(role);

			map = await this._general.create(
				interaction.guildId,
				interaction.user.id,
				role.id
			);

			return interaction.editReply({
				content: `${MESSAGE_PREFIX} Your role has been created! Enjoy!`,
			});
		}

		await role
			.edit({
				name: name ?? role.name,
				color: color ? Number.parseInt(color, 16) : role.color,
				...(image ? { icon: image } : {}),
			})
			.catch(error => {
				console.log(error);
				this._logger.error(error);
				return null;
			});

		return interaction.editReply({
			content: `${MESSAGE_PREFIX} Your role has been changed! Enjoy!`,
		});
	}

	@UseGuards(GuildModeratorGuard)
	@Subcommand({
		name: 'list',
		description: 'List the custom role mappings',
	})
	public async show(
		@Context() [interaction]: SlashCommandContext,
		@Options() { page }: CustomRoleListOptions
	) {
		this._logger.verbose(
			`Loaded custom role mappngs for ${interaction.guildId}`
		);

		return this._listMappings(interaction, page);
	}

	@UseGuards(GuildModeratorGuard)
	@Button('CUSTOM_ROLE_LIST/:page')
	public onShowButton(
		@Context()
		[interaction]: ButtonContext,
		@ComponentParam('page') page: string
	) {
		const pageInt = Number.parseInt(page, 10);
		return this._listMappings(interaction, pageInt);
	}

	private async _handleUpload(attachment: Attachment): Promise<Buffer> {
		const request = await fetch(attachment.proxyURL);
		return Buffer.from(await request.arrayBuffer());
	}

	private async _listMappings(
		interaction: CommandInteraction | ButtonInteraction,
		page = 1
	) {
		page = page ?? 1;

		const { mappings, total } = await this._general.getMappings(
			interaction.guildId,
			page
		);

		if (!total) {
			const data = {
				content: `${MESSAGE_PREFIX} No mappings have been configured yet`,
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

		if (!mappings?.length) {
			const data = {
				content: `${MESSAGE_PREFIX} No mappings found for page ${page}`,
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
				`${MESSAGE_PREFIX} Custom roles for ${interaction.guild.name}`
			)
			.setColor(CUSTOM_ROLE_EMBED_COLOR)
			.addFields([
				{
					name: 'Member',
					value: mappings.map(m => `<@${m.userId}>`).join('\n'),
					inline: true,
				},
				{
					name: 'Role',
					value: mappings.map(m => `<@&${m.roleId}>`).join('\n'),
					inline: true,
				},
			]);

		if (maxPage > 1) {
			embed = embed.setFooter({
				text: `Page ${page}/${maxPage}`,
			});
		}

		const buttons = [];
		const components: DiscordComponentsArrayDTO = [];

		if (page > 1) {
			buttons.push(
				new ButtonBuilder()
					.setCustomId(`CUSTOM_ROLE_LIST/1`)
					.setLabel('⏪')
					.setStyle(ButtonStyle.Primary),
				new ButtonBuilder()
					.setCustomId(`CUSTOM_ROLE_LIST/${page - 1}`)
					.setLabel('◀️')
					.setStyle(ButtonStyle.Primary)
			);
		}

		if (page < maxPage) {
			buttons.push(
				new ButtonBuilder()
					.setCustomId(`CUSTOM_ROLE_LIST/${page + 1}`)
					.setLabel('▶️')
					.setStyle(ButtonStyle.Primary),
				new ButtonBuilder()
					.setCustomId(`CUSTOM_ROLE_LIST/${maxPage}`)
					.setLabel('⏩')
					.setStyle(ButtonStyle.Primary)
			);
		}

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
