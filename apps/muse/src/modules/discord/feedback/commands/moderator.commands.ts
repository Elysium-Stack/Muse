import { Logger, UseFilters, UseGuards } from '@nestjs/common';
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
	StringOption,
	Subcommand,
} from 'necord';

import { FeedbackCommandDecorator } from '../feedback.decorator';
import { FeedbackService } from '../services';
import { FEEDBACK_EMBED_COLOR } from '../util/constants';

import { DiscordComponentsArrayDTO } from '@muse/types/discord-components-array.type';

import { FeedbackTopicsType } from '@prisma/client';

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

class FeedbackTopicsCreateOptions {
	@StringOption({
		name: 'name',
		description: 'The name of the topic',
		required: true,
	})
	name: string | undefined;

	@StringOption({
		name: 'type',
		description: 'The response reporting type',
		required: true,
		choices: [
			{
				name: 'Channel',
				value: 'CHANNEL',
			},
			{
				name: 'Google Sheet',
				value: 'GOOGLE_SHEET',
			},
		],
	})
	type: string | undefined;

	@ChannelOption({
		name: 'channel',
		description: 'The channel to report to',
		required: false,
	})
	channel: TextChannel | undefined;
}

class FeedbackTopicRemoveOptions {
	@NumberOption({
		name: 'id',
		description: 'The id of a topic to remove',
		required: true,
	})
	id: number | undefined;
}

@UseGuards(GuildModeratorGuard)
@UseFilters(ForbiddenExceptionFilter)
@FeedbackCommandDecorator({
	name: 'topic',
	description: 'Feedback topic commands',
})
export class FeedbackModeratorCommands {
	private readonly _logger = new Logger(FeedbackModeratorCommands.name);

	constructor(private _feedback: FeedbackService) {}

	@Subcommand({
		name: 'list',
		description: 'List feedback topics',
	})
	public async list(
		@Context() [interaction]: SlashCommandContext,
		@Options() { page }: FeedbackTopicsListOptions
	) {
		this._logger.verbose(
			`Listing feedback topics for ${interaction.guildId}`
		);

		return this._listTopics(interaction, page);
	}

	@Button('FEEDBACK_TOPICS_LIST/:page')
	public onShowButton(
		@Context()
		[interaction]: ButtonContext,
		@ComponentParam('page') page: string
	) {
		const pageInt = Number.parseInt(page, 10);
		return this._listTopics(interaction, pageInt);
	}

	@Subcommand({
		name: 'add',
		description: 'Add a feedback topic',
	})
	public async add(
		@Context() [interaction]: SlashCommandContext,
		@Options() { name, type, channel }: FeedbackTopicsCreateOptions
	) {
		this._logger.verbose(
			`Adding feedback topic for ${interaction.guildId} - ${name}`
		);

		const referenceId = channel?.id;

		if (type === 'CHANNEL' && !referenceId) {
			return interaction.reply({
				content: `${MESSAGE_PREFIX} Please select a channel if you want to report to a channel`,
				ephemeral: true,
			});
		}

		if (type === 'GOOGLE_SHEET') {
			this._logger.warn(`Google Sheet reporting is not yet implemented`);
			return interaction.reply({
				content: `${MESSAGE_PREFIX} Google Sheet reporting is not yet implemented`,
				ephemeral: true,
			});
		}

		if (!referenceId) {
			return interaction.reply({
				content: `${MESSAGE_PREFIX} A reference is required`,
				ephemeral: true,
			});
		}

		await this._feedback.addFeedbackTopicByName(
			interaction.guildId,
			name,
			type as FeedbackTopicsType,
			referenceId
		);

		return interaction.reply({
			content: `${MESSAGE_PREFIX} Added feedback topic with name "${name}"`,
			ephemeral: true,
		});
	}

	@Subcommand({
		name: 'remove',
		description: 'Remove a feedback topic',
	})
	public async remove(
		@Context() [interaction]: SlashCommandContext,
		@Options() { id }: FeedbackTopicRemoveOptions
	) {
		this._logger.verbose(
			`Removing feedback topic for ${interaction.guildId} - ${id}`
		);

		const topic = await this._feedback.removeFeedbackTopicById(
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

	private async _listTopics(
		interaction: CommandInteraction | ButtonInteraction,
		page = 1
	) {
		page = page ?? 1;

		const { topics, total } = await this._feedback.getTopicsPerPage(
			interaction.guildId,
			page
		);

		if (!total) {
			const data = {
				content: `${MESSAGE_PREFIX} No feedback topics have been configured yet`,
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

		if (!topics?.length) {
			const data = {
				content: `${MESSAGE_PREFIX} No feedback topics found for page ${page}`,
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
			.setTitle(`${MESSAGE_PREFIX} Topics for ${interaction.guild.name}`)
			.setColor(FEEDBACK_EMBED_COLOR)
			.addFields([
				{
					name: 'ID',
					value: topics.map(t => t.id).join('\n'),
					inline: true,
				},
				{
					name: 'Report',
					value: topics
						.map(t =>
							t.type === 'CHANNEL'
								? `<#${t.referenceId}>`
								: 'Google Sheet'
						)
						.join('\n'),
					inline: true,
				},
				{
					name: 'Name',
					value: topics.map(t => t.name).join('\n'),
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
					.setCustomId(`FEEDBACK_TOPICS_LIST/${page - 1}`)
					.setLabel('◀️')
					.setStyle(ButtonStyle.Primary)
			);
		}

		if (page < maxPage) {
			buttons.push(
				new ButtonBuilder()
					.setCustomId(`FEEDBACK_TOPICS_LIST/${page + 1}`)
					.setLabel('▶️')
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
