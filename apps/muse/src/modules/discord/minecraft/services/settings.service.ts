import { BaseSettingsService } from '@muse/base';
import { SettingsService } from '@muse/modules/settings';
import { ALL_SETTINGS_BUTTON } from '@muse/modules/settings/util/constants';
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

import { MinecraftSettingsInterface } from '../types/settings.interface';
import {
	MINECRAFT_EMBED_COLOR,
	MINECRAFT_SETTINGS_CHOICES,
} from '../util/constants';
@Injectable()
export class MinecraftSettingsService extends BaseSettingsService<MinecraftSettingsInterface> {
	protected _base = 'minecraft';

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
			bedrockEnabled,
			requiredRoleId,
			connectUrl,
			chatChannelId,
			bedrockPort,
			rconHost,
			rconPort,
			rconPass,
		} = settings;

		const embed = new EmbedBuilder()
			.setColor(MINECRAFT_EMBED_COLOR)
			.setTitle('Minecraft settings')
			.setDescription(`These are the settings for the minecraft module`)
			.addFields(
				{
					name: 'Status',
					value: enabled ? 'Enabled' : 'Disabled',
					inline: true,
				},
				{
					name: 'Required Role',
					value: requiredRoleId ? `<@${requiredRoleId}>` : '-',
					inline: true,
				},
				{
					name: 'Chat Channel',
					value: chatChannelId ? `<#${chatChannelId}>` : '-',
					inline: true,
				},
				{
					name: 'Bedrock enabled',
					value: bedrockEnabled ? 'Enabled' : 'Disabled',
					inline: true,
				},
				{
					name: ' ',
					value: ' ',
					inline: true,
				},
				{
					name: ' ',
					value: ' ',
					inline: true,
				},
				{
					name: 'Connect Url',
					value: connectUrl ?? '-',
					inline: true,
				},
				{
					name: 'Bedrock port',
					value: bedrockPort ?? '-',
					inline: true,
				},
				{
					name: ' ',
					value: ' ',
					inline: true,
				},
				{
					name: 'RCON Host',
					value: rconHost ?? '-',
					inline: true,
				},
				{
					name: 'RCON Port',
					value: rconPort ?? '-',
					inline: true,
				},
				{
					name: 'RCON Pass',
					value: rconPass ? `✶✶✶✶✶✶✶` : '-',
					inline: true,
				},
			);

		const promptRow = new ActionRowBuilder<ButtonBuilder>().addComponents(
			new ButtonBuilder()
				.setCustomId(`MINECRAFT_SETTINGS_PROMPT`)
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
			.setCustomId('MINECRAFT_SETTINGS_CHANGE_SELECT')
			.setPlaceholder('Select the option to change')
			.setOptions(
				MINECRAFT_SETTINGS_CHOICES.map(({ name, description, value }) =>
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
				.setCustomId(`MINECRAFT_SETTINGS_SHOW`)
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
