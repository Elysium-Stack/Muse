import { Injectable } from '@nestjs/common';
import {
	ActionRowBuilder,
	ButtonBuilder,
	ButtonStyle,
	CommandInteraction,
	EmbedBuilder,
	MessageComponentInteraction,
	SelectMenuBuilder,
	StringSelectMenuBuilder,
	StringSelectMenuOptionBuilder,
} from 'discord.js';

import { CustomRoleSettingsInterface } from '../types/settings.interface';
import {
	CUSTOM_ROLE_EMBED_COLOR,
	CUSTOM_ROLE_SETTINGS_CHOICES,
} from '../util/constants';

import { BaseSettingsService } from '@muse/base';
import { SettingsService } from '@muse/modules/settings';
import { ALL_SETTINGS_BUTTON } from '@muse/modules/settings/util/constants';

import { MESSAGE_PREFIX } from '@util';

@Injectable()
export class CustomRoleSettingsService extends BaseSettingsService<CustomRoleSettingsInterface> {
	protected _base = 'customRole';

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

		const { enabled, afterRoleId } = settings;

		const embed = new EmbedBuilder()
			.setColor(CUSTOM_ROLE_EMBED_COLOR)
			.setTitle('Custom role settings')
			.setDescription(`These are the settings for the custom role module`)
			.addFields(
				{
					name: 'Status',
					value: enabled ? 'Enabled' : 'Disabled',
					inline: true,
				},
				{
					name: 'Roles placed after role',
					value: afterRoleId?.length ? `<@&${afterRoleId}>` : '-',
					inline: true,
				}
			);

		const promptRow = new ActionRowBuilder<ButtonBuilder>().addComponents(
			new ButtonBuilder()
				.setCustomId(`CUSTOM_ROLE_SETTINGS_PROMPT`)
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
			.setCustomId('CUSTOM_ROLE_SETTINGS_CHANGE_SELECT')
			.setPlaceholder('Select the option to change')
			.setOptions(
				CUSTOM_ROLE_SETTINGS_CHOICES.map(
					({ name, description, value }) =>
						new StringSelectMenuOptionBuilder()
							.setLabel(name)
							.setDescription(description)
							.setValue(value)
				)
			);

		const selectRow =
			new ActionRowBuilder<SelectMenuBuilder>().addComponents(select);

		const showRow = new ActionRowBuilder<ButtonBuilder>().addComponents(
			new ButtonBuilder()
				.setCustomId(`CUSTOM_ROLE_SETTINGS_SHOW`)
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
