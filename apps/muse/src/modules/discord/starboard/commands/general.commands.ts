import { DiscordComponentsArrayDTO } from '@muse/types/discord-components-array.type';
import { Logger, UseFilters, UseGuards } from '@nestjs/common';
import {
	EnabledExceptionFilter,
	ForbiddenExceptionFilter,
	MESSAGE_PREFIX,
} from '@util';
import { GuildModeratorGuard } from '@util/guards';
import {
	ActionRowBuilder,
	ButtonBuilder,
	ButtonInteraction,
	ButtonStyle,
	CommandInteraction,
	EmbedBuilder,
	TextChannel,
} from 'discord.js';
import {
	Button,
	ButtonContext,
	ChannelOption,
	ComponentParam,
	Context,
	NumberOption,
	Options,
	SlashCommandContext,
	Subcommand,
} from 'necord';
import { StarboardEnabledGuard } from '../guards/enabled.guard';
import { StarboardGeneralService } from '../services/general.service';
import { StarboardCommandDecorator } from '../starboard.decorator';
import { STARBOARD_EMBED_COLOR } from '../util/constants';

class StarboardListOptions {
	@NumberOption({
		name: 'page',
		description: 'The page to view',
		required: false,
		min_value: 1,
		max_value: 999,
	})
	page: number | undefined;
}

class StarboardAddOptions {
	@ChannelOption({
		name: 'source',
		description: 'The source channel to check',
		required: true,
	})
	sourceChannel: TextChannel;

	@ChannelOption({
		name: 'destination',
		description: 'The destination channel to keep the starboard in',
		required: true,
	})
	destinationChannel: TextChannel;
}

class StarboardRemoveOptions {
	@NumberOption({
		name: 'id',
		description: 'The id of a configuration to remove',
		required: true,
	})
	id: number | undefined;
}

@UseGuards(StarboardEnabledGuard, GuildModeratorGuard)
@UseFilters(EnabledExceptionFilter, ForbiddenExceptionFilter)
@StarboardCommandDecorator()
export class StarboardGeneralCommands {
	private readonly _logger = new Logger(StarboardGeneralCommands.name);

	constructor(private _general: StarboardGeneralService) {}

	@Subcommand({
		name: 'list',
		description: 'List the starboard specific configurations',
	})
	public async show(
		@Context() [interaction]: SlashCommandContext,
		@Options() { page }: StarboardListOptions,
	) {
		return this._listStarboards(interaction, page);
	}

	@Button('STARBOARD_LIST/:page')
	public onShowButton(
		@Context()
		[interaction]: ButtonContext,
		@ComponentParam('page') page: string,
	) {
		const pageInt = parseInt(page, 10);
		return this._listStarboards(interaction, pageInt);
	}

	@Subcommand({
		name: 'add',
		description: 'Add a starboard specific configuration',
	})
	public async add(
		@Context() [interaction]: SlashCommandContext,
		@Options() { sourceChannel, destinationChannel }: StarboardAddOptions,
	) {
		this._logger.verbose(
			`Adding starboard configuration for ${interaction.guildId} - source: ${sourceChannel.id} destination: ${destinationChannel.id}`,
		);

		await this._general.addSpecificChannel(
			interaction.guildId!,
			sourceChannel.id,
			destinationChannel.id,
		);

		return interaction.reply({
			content: `${MESSAGE_PREFIX} Stars that are done in <#${sourceChannel.id}> will now end up  in <#${destinationChannel.id}>`,
			ephemeral: true,
		});
	}

	@Subcommand({
		name: 'remove',
		description: 'Remove a starboard specific configuration',
	})
	public async remove(
		@Context() [interaction]: SlashCommandContext,
		@Options() { id }: StarboardRemoveOptions,
	) {
		this._logger.verbose(
			`Removing starboard configuration for ${interaction.guildId} - ${id}`,
		);

		const configuration = await this._general.removeSpecificChannelByID(
			interaction.guildId!,
			id!,
		);

		return interaction.reply({
			content: `${MESSAGE_PREFIX} Removed starboard configuration with ID "${configuration?.id}"`,
			ephemeral: true,
		});
	}

	private async _listStarboards(
		interaction: CommandInteraction | ButtonInteraction,
		page = 1,
	) {
		page = page ?? 1;

		const { configurations, total } =
			await this._general.getSpecificChannels(interaction.guildId!, page);

		if (!total) {
			const data = {
				content: `${MESSAGE_PREFIX} No specific channels have been configured yet`,
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

		if (!configurations?.length) {
			const data = {
				content: `${MESSAGE_PREFIX} No specific channels have been found for page ${page}`,
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
				`${MESSAGE_PREFIX} Starboard specific channels for ${
					interaction.guild!.name
				}`,
			)
			.setColor(STARBOARD_EMBED_COLOR)
			.addFields([
				{
					name: 'ID',
					value: configurations.map((c) => c.id).join('\n'),
					inline: true,
				},
				{
					name: 'Source',
					value: configurations
						.map((c) => `<#${c.sourceChannelId}>`)
						.join('\n'),
					inline: true,
				},
				{
					name: 'Destination',
					value: configurations
						.map((c) => `<#${c.channelId}>`)
						.join('\n'),
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
					.setCustomId(`STARBOARD_LIST/${page - 1}`)
					.setLabel('◀️')
					.setStyle(ButtonStyle.Primary),
			);
		}

		if (page < maxPage) {
			buttons.push(
				new ButtonBuilder()
					.setCustomId(`STARBOARD_LIST/${page + 1}`)
					.setLabel('▶️')
					.setStyle(ButtonStyle.Primary),
			);
		}

		if (buttons.length) {
			components.push(
				new ActionRowBuilder<ButtonBuilder>().addComponents(buttons),
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
