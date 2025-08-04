import { Injectable } from '@nestjs/common';
import {
	ActionRowBuilder,
	ButtonBuilder,
	ButtonStyle,
	CommandInteraction,
	EmbedBuilder,
	MessageComponentInteraction,
	StringSelectMenuBuilder,
	StringSelectMenuOptionBuilder,
} from 'discord.js';

import { WriterPromptSettingsInterface } from '../types/settings.interface';
import {
	WRITER_PROMPT_EMBED_COLOR,
	WRITER_PROMPT_SETTINGS_CHOICES,
} from '../util/constants';

import { BaseSettingsService } from '@muse/base';
import { SettingsService } from '@muse/modules/settings';
import { ALL_SETTINGS_BUTTON } from '@muse/modules/settings/util/constants';

import { MESSAGE_PREFIX } from '@util';

@Injectable()
export class WriterPromptSettingsService extends BaseSettingsService<WriterPromptSettingsInterface> {
	protected _base = 'writerPrompt';

	constructor(protected _settings: SettingsService) {
		super(_settings);
	}

	async showSettings(
		interaction: MessageComponentInteraction | CommandInteraction
	) {
		const settings = await this.get(interaction.guildId);
		if (!settings) {
			return;
		}

		const { enabled, channelId, writerRoleId, pingRoleId } = settings;

		const embed = new EmbedBuilder()
			.setColor(WRITER_PROMPT_EMBED_COLOR)
			.setTitle('Writer prompt settings')
			.setDescription(
				`These are the settings for the writer prompt module`
			)
			.addFields(
				{
					name: 'Status',
					value: enabled ? 'Enabled' : 'Disabled',
					inline: true,
				},
				{
					name: 'Channel',
					value: channelId ? `<#${channelId}>` : '-',
					inline: true,
				},
				{
					name: 'Writer role',
					value: writerRoleId ? `<@&${writerRoleId}>` : '-',
					inline: true,
				},
				{
					name: 'Ping role',
					value: pingRoleId ? `<@&${pingRoleId}>` : '-',
					inline: true,
				}
			);

		const promptRow = new ActionRowBuilder<ButtonBuilder>().addComponents(
			new ButtonBuilder()
				.setCustomId(`WRITER_PROMPT_SETTINGS_PROMPT`)
				.setLabel('Change settings')
				.setStyle(ButtonStyle.Primary),
			ALL_SETTINGS_BUTTON
		);

		const data = {
			content: '',
			embeds: [embed],
			components: [promptRow],
		};

		if (interaction instanceof MessageComponentInteraction) {
			return interaction.update(data);
		}

		return interaction.reply({
			...data,
			ephemeral: true,
		});
	}

	public promptSettings(
		interaction: MessageComponentInteraction | CommandInteraction,
		isFollowUp = false,
		message?: string
	) {
		const select = new StringSelectMenuBuilder()
			.setCustomId('WRITER_PROMPT_SETTINGS_CHANGE_SELECT')
			.setPlaceholder('Select the option to change')
			.setOptions(
				WRITER_PROMPT_SETTINGS_CHOICES.map(
					({ name, description, value }) =>
						new StringSelectMenuOptionBuilder()
							.setLabel(name)
							.setDescription(description)
							.setValue(value)
				)
			);

		const selectRow =
			new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
				select
			);

		const showRow = new ActionRowBuilder<ButtonBuilder>().addComponents(
			new ButtonBuilder()
				.setCustomId(`WRITER_PROMPT_SETTINGS_SHOW`)
				.setLabel('Show settings')
				.setStyle(ButtonStyle.Primary),
			ALL_SETTINGS_BUTTON
		);

		const data = {
			content: `${MESSAGE_PREFIX}${
				isFollowUp ? ` ${message}\n\n` : ' '
			}What option would you like to change?`,
			embeds: [],
			components: [selectRow, showRow],
		};

		if (interaction instanceof MessageComponentInteraction) {
			return interaction.update(data);
		}

		return interaction.reply({
			...data,
			ephemeral: true,
		});
	}
}
