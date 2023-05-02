import {
	EnabledExceptionFilter,
	ForbiddenExceptionFilter,
} from '@muse/filters';
import { GuildAdminGuard } from '@muse/guards';
import { MESSAGE_PREFIX } from '@muse/util/constants';
import { Logger, UseFilters, UseGuards } from '@nestjs/common';
import {
	ActionRowBuilder,
	ButtonBuilder,
	ButtonInteraction,
	ButtonStyle,
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

class ReactionTriggerListOptions {
	@NumberOption({
		name: 'page',
		description: 'The page to view',
		required: false,
		min_value: 1,
		max_value: 999,
	})
	page: number;
}

class ReactionTriggerAddOptions {
	@StringOption({
		name: 'phrase',
		description: 'The phrase to use as a trigger',
		required: true,
		max_length: 100,
	})
	phrase: string;

	@StringOption({
		name: 'emoji',
		description: 'The emoji to react with',
		required: true,
	})
	emoji: string;
}

class ReactionTriggerRemoveOptions {
	@NumberOption({
		name: 'id',
		description: 'The id of a reaction trigger to remove',
		required: true,
	})
	id: number;
}

@UseGuards(ReactionTriggerEnabledGuard, GuildAdminGuard)
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
		@Options() { page }: ReactionTriggerListOptions,
	) {
		this._logger.verbose(
			`Loaded reaction trigger settings for ${interaction.guildId}`,
		);

		return this._listTriggers(interaction, page);
	}

	@Button('REACTION_TRIGGER_LIST/:page')
	public onShowButton(
		@Context()
		[interaction]: ButtonContext,
		@ComponentParam('page') page: string,
	) {
		const pageInt = parseInt(page, 10);
		return this._listTriggers(interaction, pageInt);
	}

	@Subcommand({
		name: 'add',
		description: 'Add a reaction trigger',
	})
	public async add(
		@Context() [interaction]: SlashCommandContext,
		@Options() { phrase, emoji }: ReactionTriggerAddOptions,
	) {
		const splittedEmoji = emoji.split(':');
		const emojiId = splittedEmoji[splittedEmoji.length - 1].replace(
			/\>/g,
			'',
		);
		const resolvedEmoji = interaction.client.emojis.resolve(emojiId);

		if (!resolvedEmoji) {
			return interaction.reply({
				content: `${MESSAGE_PREFIX} You can only use emojis from guilds that the bot is in.`,
				ephemeral: true,
			});
		}

		this._logger.verbose(
			`Adding reaction trigger for ${interaction.guildId} - ${phrase} ${resolvedEmoji.id}`,
		);

		await this._general.addReactionTriggerByWord(
			interaction.guildId,
			phrase,
			resolvedEmoji.id,
		);

		return interaction.reply({
			content: `${MESSAGE_PREFIX} Added reaction trigger with ${resolvedEmoji} for the phrase "${phrase}"`,
			ephemeral: true,
		});
	}

	@Subcommand({
		name: 'remove',
		description: 'Remove a reaction trigger',
	})
	public async remove(
		@Context() [interaction]: SlashCommandContext,
		@Options() { id }: ReactionTriggerRemoveOptions,
	) {
		this._logger.verbose(
			`Removing reaction trigger for ${interaction.guildId} - ${id}`,
		);

		const reactionTrigger = await this._general.removeReactionTriggerByID(
			interaction.guildId,
			id,
		);

		return interaction.reply({
			content: `${MESSAGE_PREFIX} Removed reaction trigger with ID "${reactionTrigger.id}"`,
			ephemeral: true,
		});
	}

	private async _listTriggers(
		interaction: CommandInteraction | ButtonInteraction,
		page = 1,
	) {
		page = page ?? 1;

		const { triggers, total } = await this._general.getReactionTriggers(
			interaction.guildId,
			page,
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
				`${MESSAGE_PREFIX} Triggers for ${interaction.guild.name}`,
			)
			.setColor(REACTION_TRIGGER_EMBED_COLOR)
			.addFields([
				{
					name: 'ID',
					value: triggers.map((t) => t.id).join('\n'),
					inline: true,
				},
				{
					name: 'Emoji',
					value: triggers.map((t) => t.emoji).join('\n'),
					inline: true,
				},
				{
					name: 'Phrase',
					value: triggers.map((t) => t.phrase).join('\n'),
					inline: true,
				},
			]);

		if (maxPage > 1) {
			embed = embed.setFooter({
				text: `Page ${page}/${maxPage}`,
			});
		}

		const buttons = [];
		const components = [];

		if (page > 1) {
			buttons.push(
				new ButtonBuilder()
					.setCustomId(`REACTION_TRIGGER_LIST/${page - 1}`)
					.setLabel('◀️')
					.setStyle(ButtonStyle.Primary),
			);
		}

		if (page < maxPage) {
			buttons.push(
				new ButtonBuilder()
					.setCustomId(`REACTION_TRIGGER_LIST/${page + 1}`)
					.setLabel('▶️')
					.setStyle(ButtonStyle.Primary),
			);
		}

		if (buttons.length) {
			components.push(new ActionRowBuilder().addComponents(buttons));
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
