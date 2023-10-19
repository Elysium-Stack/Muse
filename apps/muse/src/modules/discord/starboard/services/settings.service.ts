import { BaseSettingsService } from '@muse/base';
import { SettingsService } from '@muse/modules/settings';
import { ALL_SETTINGS_BUTTON } from '@muse/modules/settings/util/constants';
import { Injectable } from '@nestjs/common';
import { MESSAGE_PREFIX, resolveEmoji } from '@util';
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
import { StarboardSettingsInterface } from '../types/settings.interface';
import {
	STARBOARD_EMBED_COLOR,
	STARBOARD_SETTINGS_CHOICES,
} from '../util/constants';
@Injectable()
export class StarboardSettingsService extends BaseSettingsService<StarboardSettingsInterface> {
	protected _base = 'starboard';

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

		const { enabled, channelId, treshold, emoji, self, ignoredChannelIds } =
			settings;

		const {
			emoji: parsedEmoji,
			unicode,
			clientEmoji,
		} = resolveEmoji(emoji, interaction.client);

		const embed = new EmbedBuilder()
			.setColor(STARBOARD_EMBED_COLOR)
			.setTitle('Starboard settings')
			.setDescription(`These are the settings for the starboard module`)
			.addFields(
				{
					name: 'Status',
					value: enabled ? 'Enabled' : 'Disabled',
					inline: true,
				},
				{
					name: 'Channel',
					value: channelId?.length ? `<#${channelId}>` : '-',
					inline: true,
				},
				{
					name: 'Treshold',
					value: treshold.toString(),
					inline: true,
				},
				{
					name: 'Emoji',
					value: `${unicode ? parsedEmoji : clientEmoji}`,
					inline: true,
				},
				{
					name: 'Author starring',
					value: self ? 'Enabled' : 'Disabled',
					inline: true,
				},
				{
					name: 'Ignored Channels',
					value: ignoredChannelIds?.length
						? ignoredChannelIds.map((id) => `<#${id}>`).join('\n')
						: '-',
					inline: false,
				},
			);

		const promptRow = new ActionRowBuilder<ButtonBuilder>().addComponents(
			new ButtonBuilder()
				.setCustomId(`STARBOARD_SETTINGS_PROMPT`)
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
			.setCustomId('STARBOARD_SETTINGS_CHANGE_SELECT')
			.setPlaceholder('Select the option to change')
			.setOptions(
				STARBOARD_SETTINGS_CHOICES.map(({ name, description, value }) =>
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
				.setCustomId(`STARBOARD_SETTINGS_SHOW`)
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

	async ignoreChannel(
		guildId: string,
		channelId: string,
		value: boolean = true,
	) {
		const settings = await this.get(guildId);

		if (!settings) {
			return;
		}

		const { ignoredChannelIds } = settings;
		const index = ignoredChannelIds.indexOf(channelId);

		if (!value) {
			if (index >= 0) {
				ignoredChannelIds.splice(index, 1);
			}
		}

		if (value) {
			if (index === -1) {
				ignoredChannelIds.push(channelId);
			}
		}

		return this.set(guildId, 'ignoredChannelIds', ignoredChannelIds);
	}
}