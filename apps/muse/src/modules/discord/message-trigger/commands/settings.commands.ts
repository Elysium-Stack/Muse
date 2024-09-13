import { DiscordComponentsArrayDTO } from '@muse/types/discord-components-array.type';
import { Logger, UseFilters, UseGuards } from '@nestjs/common';
import {
	ForbiddenExceptionFilter,
	MESSAGE_PREFIX,
	camelCaseToSnakeCase,
} from '@util';
import {
	ActionRowBuilder,
	ButtonBuilder,
	ButtonStyle,
	ChannelSelectMenuBuilder,
	ChannelType,
	CommandInteraction,
	MessageComponentInteraction,
	TextChannel,
} from 'discord.js';
import { GuildAdminGuard, GuildModeratorGuard } from 'libs/util/src/lib/guards';
import {
	Button,
	ButtonContext,
	ChannelOption,
	ChannelSelect,
	ComponentParam,
	Context,
	ISelectedChannels,
	Options,
	SelectedChannels,
	SelectedStrings,
	SlashCommandContext,
	StringOption,
	StringSelect,
	StringSelectContext,
	Subcommand,
} from 'necord';

import { MessageTriggerCommandDecorator } from '../message-trigger.decorator';
import { MessageTriggerSettingsService } from '../services/settings.service';
import { MessageTriggerSettingsInterface } from '../types/settings.interface';
import { MESSAGE_TRIGGER_SETTINGS_CHOICES } from '../util/constants';

class MessageTriggerSettingsChangeOptions {
	@StringOption({
		name: 'option',
		description: 'The option to change',
		required: false,
		choices: MESSAGE_TRIGGER_SETTINGS_CHOICES,
	})
	option: keyof MessageTriggerSettingsInterface | undefined;
}

class MessageTriggerIgnoreOptions {
	@ChannelOption({
		name: 'channel',
		description: 'The channel to ignore/unignore',
		required: false,
	})
	channel: TextChannel | undefined;
}

@UseFilters(ForbiddenExceptionFilter)
@MessageTriggerCommandDecorator({
	name: 'settings',
	description: 'Message trigger settings commands',
})
export class MessageTriggerSettingsCommands {
	private readonly _logger = new Logger(MessageTriggerSettingsCommands.name);

	constructor(private _settings: MessageTriggerSettingsService) {}

	@UseGuards(GuildAdminGuard)
	@Subcommand({
		name: 'show',
		description: 'Show message trigger settings',
	})
	public async show(@Context() [interaction]: SlashCommandContext) {
		this._logger.verbose(
			`Loaded message trigger settings for ${interaction.guildId}`,
		);

		return this._settings.showSettings(interaction);
	}

	@UseGuards(GuildModeratorGuard)
	@Subcommand({
		name: 'ignore',
		description: 'Ignore the current channel',
	})
	public async ignore(
		@Context() [interaction]: SlashCommandContext,
		@Options() { channel }: MessageTriggerIgnoreOptions,
	) {
		this._logger.verbose(
			`Ignoring reaction trigger channel for ${interaction.guildId} - ${
				channel?.id ?? interaction.channelId
			}`,
		);

		await this._settings.ignoreChannel(
			interaction.guildId,
			channel?.id ?? interaction.channelId,
			true,
		);

		return interaction.reply({
			content: `${MESSAGE_PREFIX} Message triggers are now **ignored** for ${
				channel?.id ? `<#${channel.id}>` : 'this channel'
			}!`,
			ephemeral: true,
		});
	}

	@UseGuards(GuildModeratorGuard)
	@Subcommand({
		name: 'unignore',
		description: 'Unignore the current channel',
	})
	public async unignore(
		@Context() [interaction]: SlashCommandContext,
		@Options() { channel }: MessageTriggerIgnoreOptions,
	) {
		this._logger.verbose(
			`Unignoring reaction trigger channel for ${interaction.guildId} - ${
				channel?.id ?? interaction.channelId
			}`,
		);

		await this._settings.ignoreChannel(
			interaction.guildId,
			channel?.id ?? interaction.channelId,
			false,
		);

		return interaction.reply({
			content: `${MESSAGE_PREFIX} Message triggers are now **unignored** for ${
				channel?.id ? `<#${channel.id}>` : 'this channel'
			}!`,
			ephemeral: true,
		});
	}

	@UseGuards(GuildAdminGuard)
	@Button('MESSAGE_TRIGGER_SETTINGS_SHOW')
	public onShowButton(
		@Context()
		[interaction]: ButtonContext,
	) {
		return this._settings.showSettings(interaction);
	}

	// settings change flow
	@UseGuards(GuildAdminGuard)
	@Subcommand({
		name: 'change',
		description: 'Change settings',
	})
	public async changeSettings(
		@Context() [interaction]: SlashCommandContext,
		@Options() { option }: MessageTriggerSettingsChangeOptions,
	) {
		this._logger.verbose(
			`Change message trigger settings, option: ${option}`,
		);

		if (!option) {
			return this._settings.promptSettings(interaction);
		}

		return this._askSettingValue(interaction, option);
	}

	@UseGuards(GuildAdminGuard)
	@Button('MESSAGE_TRIGGER_SETTINGS_PROMPT')
	public onPromptButton(
		@Context()
		[interaction]: ButtonContext,
	) {
		return this._settings.promptSettings(interaction);
	}

	@UseGuards(GuildAdminGuard)
	@Button('MESSAGE_TRIGGER_SETTINGS_BACK')
	public onBackButton(
		@Context()
		[interaction]: ButtonContext,
	) {
		return this._settings.promptSettings(interaction);
	}

	@UseGuards(GuildAdminGuard)
	@StringSelect('MESSAGE_TRIGGER_SETTINGS_CHANGE_SELECT')
	public onStringSelect(
		@Context() [interaction]: StringSelectContext,
		@SelectedStrings() selected: (keyof MessageTriggerSettingsInterface)[],
	) {
		return this._askSettingValue(interaction, selected[0]);
	}

	@UseGuards(GuildAdminGuard)
	@Button('MESSAGE_TRIGGER_SETTINGS_CHANGE_ENABLED/:value')
	public async onEnabledButton(
		@Context() [interaction]: ButtonContext,
		@ComponentParam('value') value: string,
	) {
		const parsedValue = value === 'true' ? true : false;

		await this._settings.set(interaction.guildId!, 'enabled', parsedValue);

		return interaction.update({
			content: `${MESSAGE_PREFIX} Message trigger has been ${
				parsedValue ? 'enabled' : 'disabled'
			}`,
			components: [this._getBackButtonRow()],
		});
	}

	@UseGuards(GuildAdminGuard)
	@ChannelSelect('MESSAGE_TRIGGER_SETTINGS_CHANGE_IGNORED_CHANNEL_IDS')
	public async onChannelChange(
		@Context() [interaction]: ButtonContext,
		@SelectedChannels() data: ISelectedChannels,
	) {
		const ids = [...data.keys()];
		await this._settings.set(
			interaction.guildId!,
			'ignoredChannelIds',
			ids,
		);

		return interaction.update({
			content: `${MESSAGE_PREFIX} Message trigger ignored channels has been changed to:${
				ids.length > 0
					? `\n${ids.map((id) => `<#${id}>`).join(', ')}`
					: ' None'
			}`,
			components: [this._getBackButtonRow()],
		});
	}

	private async _askSettingValue(
		interaction: MessageComponentInteraction | CommandInteraction,
		option: keyof MessageTriggerSettingsInterface,
	) {
		let components: DiscordComponentsArrayDTO = [];
		const settings = await this._settings.get(interaction.guildId!);

		let currentValue: string | string[] | boolean | undefined =
			settings?.[option];
		let readableOption: string = option;

		switch (option) {
			case 'enabled': {
				readableOption = 'Enabled';
				currentValue = settings?.[option] ? 'Enabled' : 'Disabled';
				components = [
					new ActionRowBuilder<ButtonBuilder>().addComponents(
						new ButtonBuilder()
							.setCustomId(
								`MESSAGE_TRIGGER_SETTINGS_CHANGE_${camelCaseToSnakeCase(
									option,
								).toUpperCase()}/true`,
							)
							.setLabel('Enable')
							.setStyle(ButtonStyle.Primary)
							.setDisabled(settings?.[option] === true),
						new ButtonBuilder()
							.setCustomId(
								`MESSAGE_TRIGGER_SETTINGS_CHANGE_${camelCaseToSnakeCase(
									option,
								).toUpperCase()}/false`,
							)
							.setLabel('Disable')
							.setStyle(ButtonStyle.Danger)
							.setDisabled(settings?.[option] === false),
					),
				];
				break;
			}
			case 'ignoredChannelIds': {
				readableOption = 'Ignored channels';
				currentValue = settings?.[option]?.length
					? `\n${settings[option].map((id) => `<#${id}>`).join(', ')}`
					: 'none';
				components = [
					new ActionRowBuilder<ChannelSelectMenuBuilder>().addComponents(
						new ChannelSelectMenuBuilder()
							.setMinValues(1)
							.setMaxValues(25) // 25 is the max currently..
							.setCustomId(
								`MESSAGE_TRIGGER_SETTINGS_CHANGE_${camelCaseToSnakeCase(
									option,
								).toUpperCase()}`,
							)
							.addChannelTypes(ChannelType.GuildText)
							.setPlaceholder(
								'Select the channels to ignore (max 25)',
							),
					),
				];
				break;
			}
		}

		components.push(this._getBackButtonRow(true));

		if (interaction instanceof MessageComponentInteraction) {
			return interaction.update({
				content: `${MESSAGE_PREFIX} What would you like to change **${readableOption}** to?
				
Current value: ${currentValue}`,
				components,
			});
		}

		return interaction.reply({
			content: `${MESSAGE_PREFIX} What would you like to change **${readableOption}** to?
				
Current value: ${currentValue}`,
			components,
			ephemeral: true,
		});
	}

	private _getBackButtonRow(isCancel = false) {
		return new ActionRowBuilder<ButtonBuilder>().addComponents(
			new ButtonBuilder()
				.setCustomId(`MESSAGE_TRIGGER_SETTINGS_BACK`)
				.setLabel(
					isCancel ? 'Cancel' : 'Back to message trigger settings',
				)
				.setStyle(isCancel ? ButtonStyle.Danger : ButtonStyle.Primary),
		);
	}
}
