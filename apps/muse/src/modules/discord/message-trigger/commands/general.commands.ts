import { DiscordComponentsArrayDTO } from '@muse/types/discord-components-array.type';
import { Logger, UseFilters, UseGuards } from '@nestjs/common';
import { TriggerMatch } from '@prisma/client';
import {
	EnabledExceptionFilter,
	ForbiddenExceptionFilter,
	MESSAGE_PREFIX,
} from '@util';
import {
	ActionRowBuilder,
	ButtonBuilder,
	ButtonInteraction,
	ButtonStyle,
	CommandInteraction,
	EmbedBuilder,
} from 'discord.js';
import { GuildAdminGuard } from 'libs/util/src/lib/guards';
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
import { MessageTriggerEnabledGuard } from '../guards/enabled.guard';
import { MessageTriggerCommandDecorator } from '../message-trigger.decorator';
import { MessageTriggerGeneralService } from '../services/general.service';
import { MESSAGE_TRIGGER_EMBED_COLOR } from '../util/constants';

class MessageTriggerListOptions {
	@NumberOption({
		name: 'page',
		description: 'The page to view',
		required: false,
		min_value: 1,
		max_value: 999,
	})
	page: number | undefined;
}

class MessageTriggerAddOptions {
	@StringOption({
		name: 'phrase',
		description: 'The phrase to use as a trigger',
		required: true,
		max_length: 100,
	})
	phrase: string | undefined;

	@StringOption({
		name: 'message',
		description: 'The message to reply with',
		required: true,
	})
	message: string | undefined;

	@StringOption({
		name: 'match',
		description: 'The type of matching applied to the phrase',
		required: false,
		choices: [
			{
				name: 'Any',
				value: 'any',
			},
			{
				name: 'Word',
				value: 'word',
			},
			{
				name: 'Message',
				value: 'message',
			},
		],
	})
	match: TriggerMatch;
}

class MessageTriggerRemoveOptions {
	@NumberOption({
		name: 'id',
		description: 'The id of a message trigger to remove',
		required: true,
	})
	id: number | undefined;
}

class MessageTriggerViewOptions {
	@NumberOption({
		name: 'id',
		description: 'The id of a message trigger to view',
		required: true,
	})
	id: number | undefined;
}

@UseGuards(MessageTriggerEnabledGuard, GuildAdminGuard)
@UseFilters(EnabledExceptionFilter, ForbiddenExceptionFilter)
@MessageTriggerCommandDecorator()
export class MessageTriggerGeneralCommands {
	private readonly _logger = new Logger(MessageTriggerGeneralCommands.name);

	constructor(private _general: MessageTriggerGeneralService) {}

	@Subcommand({
		name: 'view',
		description: 'View the message triggers by id',
	})
	public async view(
		@Context() [interaction]: SlashCommandContext,
		@Options() { id }: MessageTriggerViewOptions,
	) {
		this._logger.verbose(
			`Loaded message trigger settings for ${interaction.guildId}`,
		);

		const trigger = await this._general.getMessageTriggerById(
			interaction.guildId,
			id,
		);

		if (!trigger) {
			return interaction.reply({
				content: `${MESSAGE_PREFIX} Could not find trigger with ID "${id}"`,
				ephemeral: true,
			});
		}

		let embed = new EmbedBuilder()
			.setTitle(`${MESSAGE_PREFIX} Message trigger #${trigger.id}`)
			.setColor(MESSAGE_TRIGGER_EMBED_COLOR)
			.addFields([
				{
					name: 'ID',
					value: `${trigger.id}`,
					inline: true,
				},
				{
					name: 'Phrase',
					value: trigger.phrase,
					inline: true,
				},
				{
					name: 'Message',
					value: trigger.message,
					inline: false,
				},
			]);

		return interaction.reply({
			embeds: [embed],
			ephemeral: true,
		});
	}

	@Subcommand({
		name: 'list',
		description: 'List the message triggers configured',
	})
	public async show(
		@Context() [interaction]: SlashCommandContext,
		@Options() { page }: MessageTriggerListOptions,
	) {
		this._logger.verbose(
			`Loaded message trigger settings for ${interaction.guildId}`,
		);

		return this._listTriggers(interaction, page);
	}

	@Button('MESSAGE_TRIGGER_LIST/:page')
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
		description: 'Add a message trigger',
	})
	public async add(
		@Context() [interaction]: SlashCommandContext,
		@Options() { phrase, message, match }: MessageTriggerAddOptions,
	) {
		this._logger.verbose(
			`Adding message trigger for ${interaction.guildId} - ${phrase}\n"${message}"`,
		);

		await this._general.addMessageTriggerByWord(
			interaction.guildId!,
			phrase!,
			match ?? 'any',
			message,
		);

		return interaction.reply({
			content: `${MESSAGE_PREFIX} Added message trigger with phrase "${phrase}" and reply:\n${message}`,
			ephemeral: true,
		});
	}

	@Subcommand({
		name: 'remove',
		description: 'Remove a message trigger',
	})
	public async remove(
		@Context() [interaction]: SlashCommandContext,
		@Options() { id }: MessageTriggerRemoveOptions,
	) {
		this._logger.verbose(
			`Removing message trigger for ${interaction.guildId} - ${id}`,
		);

		const messageTrigger = await this._general.removeMessageTriggerByID(
			interaction.guildId!,
			id!,
		);

		return interaction.reply({
			content: `${MESSAGE_PREFIX} Removed message trigger with ID "${messageTrigger?.id}"`,
			ephemeral: true,
		});
	}

	private async _listTriggers(
		interaction: CommandInteraction | ButtonInteraction,
		page = 1,
	) {
		page = page ?? 1;

		const { triggers, total } = await this._general.getMessageTriggers(
			interaction.guildId!,
			page,
		);

		if (!total) {
			const data = {
				content: `${MESSAGE_PREFIX} No message triggers have been configured yet`,
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
				content: `${MESSAGE_PREFIX} No message triggers found for page ${page}`,
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
				`${MESSAGE_PREFIX} Triggers for ${interaction.guild!.name}`,
			)
			.setColor(MESSAGE_TRIGGER_EMBED_COLOR)
			.addFields([
				{
					name: 'ID',
					value: triggers.map((t) => t.id).join('\n'),
					inline: true,
				},
				{
					name: 'Phrase',
					value: triggers
						.map(
							(t) =>
								`${t.match !== 'any' ? `[${t.match}] ` : ''}${
									t.phrase
								}`,
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

		const buttons = [];
		const components: DiscordComponentsArrayDTO = [];

		if (page > 1) {
			buttons.push(
				new ButtonBuilder()
					.setCustomId(`MESSAGE_TRIGGER_LIST/${page - 1}`)
					.setLabel('◀️')
					.setStyle(ButtonStyle.Primary),
			);
		}

		if (page < maxPage) {
			buttons.push(
				new ButtonBuilder()
					.setCustomId(`MESSAGE_TRIGGER_LIST/${page + 1}`)
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
