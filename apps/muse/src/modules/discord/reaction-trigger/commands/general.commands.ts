import { Logger, UseFilters, UseGuards } from '@nestjs/common';
import {
	ActionRowBuilder,
	ButtonBuilder,
	ButtonInteraction,
	CommandInteraction,
	EmbedBuilder,
} from 'discord.js';
import {
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

import { ReactionTriggerEnabledGuard } from '../guards/enabled.guard';
import { ReactionTriggerCommandDecorator } from '../reaction-trigger.decorator';
import { ReactionTriggerGeneralService } from '../services/general.service';
import { REACTION_TRIGGER_EMBED_COLOR } from '../util/constants';

import { DiscordComponentsArrayDTO } from '@muse/types/discord-components-array.type';
import { createListButtons } from '@muse/util/create-list-buttons';

import { TriggerMatch } from '@prisma/client';

import {
	EnabledExceptionFilter,
	ForbiddenExceptionFilter,
	MESSAGE_PREFIX,
	resolveEmoji,
} from '@util';

import { GuildModeratorGuard } from '@util/guards';

class ReactionTriggerListOptions {
	@NumberOption({
		name: 'page',
		description: 'The page to view',
		required: false,
		min_value: 1,
		max_value: 999,
	})
	page: number | undefined;
}

class ReactionTriggerAddOptions {
	@StringOption({
		name: 'phrase',
		description: 'The phrase to use as a trigger',
		required: true,
		max_length: 100,
	})
	phrase: string | undefined;

	@StringOption({
		name: 'emoji',
		description: 'The emoji to react with',
		required: true,
	})
	emoji: string | undefined;

	@StringOption({
		name: 'match',
		description: 'The type of matching applied to the phrase',
		required: false,
		choices: [
			{
				name: 'Word',
				value: 'word',
			},
			{
				name: 'Any',
				value: 'any',
			},
			{
				name: 'Message',
				value: 'message',
			},
		],
	})
	match: TriggerMatch;
}

class ReactionTriggerRemoveOptions {
	@NumberOption({
		name: 'id',
		description: 'The id of a reaction trigger to remove',
		required: true,
	})
	id: number | undefined;
}

@UseGuards(ReactionTriggerEnabledGuard, GuildModeratorGuard)
@UseFilters(EnabledExceptionFilter, ForbiddenExceptionFilter)
@ReactionTriggerCommandDecorator()
export class ReactionTriggerGeneralCommands {
	private readonly _logger = new Logger(ReactionTriggerGeneralCommands.name);

	constructor(private _general: ReactionTriggerGeneralService) {}

	@Subcommand({
		name: 'list',
		description: 'List the reaction triggers configured',
	})
	public async show(
		@Context() [interaction]: SlashCommandContext,
		@Options() { page }: ReactionTriggerListOptions
	) {
		this._logger.verbose(
			`Loaded reaction trigger settings for ${interaction.guildId}`
		);

		return this._listTriggers(interaction, page);
	}

	@Button('REACTION_TRIGGER_LIST/:page')
	public onShowButton(
		@Context()
		[interaction]: ButtonContext,
		@ComponentParam('page') page: string
	) {
		const pageInt = Number.parseInt(page, 10);
		return this._listTriggers(interaction, pageInt);
	}

	@Subcommand({
		name: 'add',
		description: 'Add a reaction trigger',
	})
	public async add(
		@Context() [interaction]: SlashCommandContext,
		@Options() { phrase, emoji, match }: ReactionTriggerAddOptions
	) {
		const { unicode, clientEmoji } = resolveEmoji(
			emoji,
			interaction.client
		);

		if (!unicode && !clientEmoji) {
			return interaction.reply({
				content: `${MESSAGE_PREFIX} You can only use emojis from guilds that the bot is in.`,
				ephemeral: true,
			});
		}

		this._logger.verbose(
			`Adding reaction trigger for ${interaction.guildId} - ${phrase} ${
				clientEmoji ? clientEmoji.id : emoji
			}`
		);

		await this._general.addReactionTriggerByWord(
			interaction.guildId,
			phrase,
			match ?? 'word',
			clientEmoji ? clientEmoji.id : emoji
		);

		return interaction.reply({
			content: `${MESSAGE_PREFIX} Added reaction trigger with ${
				clientEmoji ?? emoji
			} for the phrase "${phrase}"`,
			ephemeral: true,
		});
	}

	@Subcommand({
		name: 'remove',
		description: 'Remove a reaction trigger',
	})
	public async remove(
		@Context() [interaction]: SlashCommandContext,
		@Options() { id }: ReactionTriggerRemoveOptions
	) {
		this._logger.verbose(
			`Removing reaction trigger for ${interaction.guildId} - ${id}`
		);

		const reactionTrigger = await this._general.removeReactionTriggerByID(
			interaction.guildId,
			id
		);

		return interaction.reply({
			content: `${MESSAGE_PREFIX} Removed reaction trigger with ID "${reactionTrigger?.id}"`,
			ephemeral: true,
		});
	}

	private async _listTriggers(
		interaction: CommandInteraction | ButtonInteraction,
		page = 1
	) {
		page = page ?? 1;

		const { triggers, total } = await this._general.getReactionTriggers(
			interaction.guildId,
			page
		);

		if (!total) {
			const data = {
				content: `${MESSAGE_PREFIX} No reaction triggers have been configured yet`,
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

		if (!triggers?.length) {
			const data = {
				content: `${MESSAGE_PREFIX} No reaction triggers found for page ${page}`,
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
				`${MESSAGE_PREFIX} Triggers for ${interaction.guild.name}`
			)
			.setColor(REACTION_TRIGGER_EMBED_COLOR)
			.addFields([
				{
					name: 'ID',
					value: triggers.map(t => t.id).join('\n'),
					inline: true,
				},
				{
					name: 'Emoji',
					value: triggers.map(t => t.emoji).join('\n'),
					inline: true,
				},
				{
					name: 'Phrase',
					value: triggers
						.map(
							t =>
								`${t.match === 'any' ? '' : `[${t.match}] `}${t.phrase}`
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

		const buttons = createListButtons(
			'REACTION_TRIGGER_LIST',
			page,
			maxPage
		);
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
