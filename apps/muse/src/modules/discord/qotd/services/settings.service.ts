import { BaseSettingsService } from '@muse/base';
import { SettingsService } from '@muse/modules/settings';
import { ALL_SETTINGS_BUTTON } from '@muse/modules/settings/util/constants';
import { HOUR_OPTIONS } from '@muse/util/constants';
import { Injectable } from '@nestjs/common';
import { MESSAGE_PREFIX } from '@util';
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

import { QotDSettingsInterface } from '../types/settings.interface';
import { QOTD_EMBED_COLOR, QOTD_SETTINGS_CHOICES } from '../util/constants';
@Injectable()
export class QotDSettingsService extends BaseSettingsService<QotDSettingsInterface> {
	protected _base = 'qotd';

	constructor(protected _settings: SettingsService) {
		super(_settings);
	}

	async showSettings(
		interaction: MessageComponentInteraction | CommandInteraction,
	) {
		const settings = await this.get(interaction.guildId!);
		if (!settings) {
			return;
		}

		const {
			enabled,
			channelId,
			dailyEnabled,
			dailyChannelId,
			dailyHour,
			pingRoleId,
		} = settings;

		const hourOption = HOUR_OPTIONS.find((h) => h.value === dailyHour);
		const embed = new EmbedBuilder()
			.setColor(QOTD_EMBED_COLOR)
			.setTitle('QotD settings')
			.setDescription(`These are the settings for the qotd module`)
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
					name: 'Daily status',
					value: dailyEnabled ? 'Enabled' : 'Disabled',
					inline: true,
				},
				{
					name: 'Daily channel',
					value: channelId ? `<#${dailyChannelId}>` : '-',
					inline: true,
				},
				{
					name: 'Daily time',
					value: hourOption?.name ?? '-',
					inline: true,
				},
				{
					name: 'Ping role',
					value: pingRoleId ? `<@&${pingRoleId}>` : '-',
					inline: true,
				},
			);

		const promptRow = new ActionRowBuilder<ButtonBuilder>().addComponents(
			new ButtonBuilder()
				.setCustomId(`QOTD_SETTINGS_PROMPT`)
				.setLabel('Change settings')
				.setStyle(ButtonStyle.Primary),
			ALL_SETTINGS_BUTTON,
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
		message?: string,
	) {
		const select = new StringSelectMenuBuilder()
			.setCustomId('QOTD_SETTINGS_CHANGE_SELECT')
			.setPlaceholder('Select the option to change')
			.setOptions(
				QOTD_SETTINGS_CHOICES.map(({ name, description, value }) =>
					new StringSelectMenuOptionBuilder()
						.setLabel(name)
						.setDescription(description)
						.setValue(value),
				),
			);

		const selectRow =
			new ActionRowBuilder<SelectMenuBuilder>().addComponents(select);

		const showRow = new ActionRowBuilder<ButtonBuilder>().addComponents(
			new ButtonBuilder()
				.setCustomId(`QOTD_SETTINGS_SHOW`)
				.setLabel('Show settings')
				.setStyle(ButtonStyle.Primary),
			ALL_SETTINGS_BUTTON,
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
