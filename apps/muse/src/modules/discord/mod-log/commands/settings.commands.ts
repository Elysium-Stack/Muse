import { Logger, UseFilters, UseGuards } from '@nestjs/common';
import {
	ActionRowBuilder,
	ButtonBuilder,
	ButtonStyle,
	ChannelSelectMenuBuilder,
	ChannelType,
	CommandInteraction,
	MessageComponentInteraction,
} from 'discord.js';
import {
	Button,
	ButtonContext,
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

import { ModLogCommandDecorator } from '../mod-log.decorator';
import { ModLogSettingsService } from '../services/settings.service';
import { ModLogSettingsInterface } from '../types/settings.interface';
import { MOD_LOG_SETTINGS_CHOICES } from '../util/constants';

import { DiscordComponentsArrayDTO } from '@muse/types/discord-components-array.type';

import {
	ForbiddenExceptionFilter,
	MESSAGE_PREFIX,
	camelCaseToSnakeCase,
} from '@util';

import { GuildAdminGuard } from 'libs/util/src/lib/guards';

class ModLogSettingsChangeOptions {
	@StringOption({
		name: 'option',
		description: 'The option to change',
		required: false,
		choices: MOD_LOG_SETTINGS_CHOICES,
	})
	option: keyof ModLogSettingsInterface | undefined;
}

@UseGuards(GuildAdminGuard)
@UseFilters(ForbiddenExceptionFilter)
@ModLogCommandDecorator({
	name: 'settings',
	description: 'Mod log settings commands',
	options: [],
})
export class ModLogSettingsCommands {
	private readonly _logger = new Logger(ModLogSettingsCommands.name);

	constructor(private _settings: ModLogSettingsService) {}

	@Subcommand({
		name: 'show',
		description: 'Show mod log settings',
	})
	public async show(@Context() [interaction]: SlashCommandContext) {
		this._logger.verbose(
			`Loaded mod log settings for ${interaction.guildId}`
		);

		return this._settings.showSettings(interaction);
	}

	@Button('MOD_LOG_SETTINGS_SHOW')
	public onShowButton(
		@Context()
		[interaction]: ButtonContext
	) {
		return this._settings.showSettings(interaction);
	}

	// settings change flow
	@Subcommand({
		name: 'change',
		description: 'Change settings',
	})
	public async changeSettings(
		@Context() [interaction]: SlashCommandContext,
		@Options() { option }: ModLogSettingsChangeOptions
	) {
		this._logger.verbose(`Change mod log settings, option: ${option}`);

		if (!option) {
			return this._settings.promptSettings(interaction);
		}

		return this._askSettingValue(interaction, option);
	}

	@Button('MOD_LOG_SETTINGS_PROMPT')
	public onPromptButton(
		@Context()
		[interaction]: ButtonContext
	) {
		return this._settings.promptSettings(interaction);
	}

	@Button('MOD_LOG_SETTINGS_BACK')
	public onBackButton(
		@Context()
		[interaction]: ButtonContext
	) {
		return this._settings.promptSettings(interaction);
	}

	@StringSelect('MOD_LOG_SETTINGS_CHANGE_SELECT')
	public onStringSelect(
		@Context() [interaction]: StringSelectContext,
		@SelectedStrings() selected: (keyof ModLogSettingsInterface)[]
	) {
		return this._askSettingValue(interaction, selected[0]);
	}

	@Button('MOD_LOG_SETTINGS_CHANGE_ENABLED/:value')
	public async onEnabledButton(
		@Context() [interaction]: ButtonContext,
		@ComponentParam('value') value: string
	) {
		const parsedValue = value === 'true' ? true : false;

		await this._settings.set(interaction.guildId, 'enabled', parsedValue);

		return interaction.update({
			content: `${MESSAGE_PREFIX} Mod log has been ${
				parsedValue ? 'enabled' : 'disabled'
			}`,
			components: [this._getBackButtonRow()],
		});
	}

	@ChannelSelect('MOD_LOG_SETTINGS_CHANGE_DELETE_CHANNEL_ID')
	public async onDeleteChannelChange(
		@Context() [interaction]: ButtonContext,
		@SelectedChannels() data: ISelectedChannels
	) {
		const id = [...data.keys()][0];
		await this._settings.set(interaction.guildId, 'deleteChannelId', id);

		return interaction.update({
			content: `${MESSAGE_PREFIX} Mod log message delete channel has been changed to:${
				id.length > 0 ? `\n<#${id}>` : ' None'
			}`,
			components: [this._getBackButtonRow()],
		});
	}

	@ChannelSelect('MOD_LOG_SETTINGS_CHANGE_EDIT_CHANNEL_ID')
	public async onEditChannelChange(
		@Context() [interaction]: ButtonContext,
		@SelectedChannels() data: ISelectedChannels
	) {
		const id = [...data.keys()][0];
		await this._settings.set(interaction.guildId, 'editChannelId', id);

		return interaction.update({
			content: `${MESSAGE_PREFIX} Mod log message edit channel has been changed to:${
				id.length > 0 ? `\n<#${id}>` : ' None'
			}`,
			components: [this._getBackButtonRow()],
		});
	}

	@ChannelSelect('MOD_LOG_SETTINGS_CHANGE_JOIN_CHANNEL_ID')
	public async onJoinChannelChange(
		@Context() [interaction]: ButtonContext,
		@SelectedChannels() data: ISelectedChannels
	) {
		const id = [...data.keys()][0];
		await this._settings.set(interaction.guildId, 'joinChannelId', id);

		return interaction.update({
			content: `${MESSAGE_PREFIX} Mod log member join channel has been changed to:${
				id.length > 0 ? `\n<#${id}>` : ' None'
			}`,
			components: [this._getBackButtonRow()],
		});
	}

	@ChannelSelect('MOD_LOG_SETTINGS_CHANGE_LEAVE_CHANNEL_ID')
	public async onLeaveChannelChange(
		@Context() [interaction]: ButtonContext,
		@SelectedChannels() data: ISelectedChannels
	) {
		const id = [...data.keys()][0];
		await this._settings.set(interaction.guildId, 'leaveChannelId', id);

		return interaction.update({
			content: `${MESSAGE_PREFIX} Mod log member leave channel has been changed to:${
				id.length > 0 ? `\n<#${id}>` : ' None'
			}`,
			components: [this._getBackButtonRow()],
		});
	}

	private async _askSettingValue(
		interaction: MessageComponentInteraction | CommandInteraction,
		option: keyof ModLogSettingsInterface
	) {
		let components: DiscordComponentsArrayDTO = [];
		const settings = await this._settings.get(interaction.guildId);

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
								`MOD_LOG_SETTINGS_CHANGE_${camelCaseToSnakeCase(
									option
								).toUpperCase()}/true`
							)
							.setLabel('Enable')
							.setStyle(ButtonStyle.Primary)
							.setDisabled(settings?.[option] === true),
						new ButtonBuilder()
							.setCustomId(
								`MOD_LOG_SETTINGS_CHANGE_${camelCaseToSnakeCase(
									option
								).toUpperCase()}/false`
							)
							.setLabel('Disable')
							.setStyle(ButtonStyle.Danger)
							.setDisabled(settings?.[option] === false)
					),
				];
				break;
			}
			case 'deleteChannelId': {
				readableOption = 'Message delete log channel';
				currentValue = settings?.[option]?.length
					? `<#${settings?.[option]}>`
					: 'none';
				components = [
					new ActionRowBuilder<ChannelSelectMenuBuilder>().addComponents(
						new ChannelSelectMenuBuilder()
							.setCustomId(
								`MOD_LOG_SETTINGS_CHANGE_${camelCaseToSnakeCase(
									option
								).toUpperCase()}`
							)
							.addChannelTypes(ChannelType.GuildText)
							.setPlaceholder('Select the channel to log to')
					),
				];
				break;
			}
			case 'editChannelId': {
				readableOption = 'Message edit log channel';
				currentValue = settings?.[option]?.length
					? `<#${settings?.[option]}>`
					: 'none';
				components = [
					new ActionRowBuilder<ChannelSelectMenuBuilder>().addComponents(
						new ChannelSelectMenuBuilder()
							.setCustomId(
								`MOD_LOG_SETTINGS_CHANGE_${camelCaseToSnakeCase(
									option
								).toUpperCase()}`
							)
							.addChannelTypes(ChannelType.GuildText)
							.setPlaceholder('Select the channel to log to')
					),
				];
				break;
			}
			case 'joinChannelId': {
				readableOption = 'Member join log channel';
				currentValue = settings?.[option]?.length
					? `<#${settings?.[option]}>`
					: 'none';
				components = [
					new ActionRowBuilder<ChannelSelectMenuBuilder>().addComponents(
						new ChannelSelectMenuBuilder()
							.setCustomId(
								`MOD_LOG_SETTINGS_CHANGE_${camelCaseToSnakeCase(
									option
								).toUpperCase()}`
							)
							.addChannelTypes(ChannelType.GuildText)
							.setPlaceholder('Select the channel to log to')
					),
				];
				break;
			}
			case 'leaveChannelId': {
				readableOption = 'Member leave log channel';
				currentValue = settings?.[option]?.length
					? `<#${settings?.[option]}>`
					: 'none';
				components = [
					new ActionRowBuilder<ChannelSelectMenuBuilder>().addComponents(
						new ChannelSelectMenuBuilder()
							.setCustomId(
								`MOD_LOG_SETTINGS_CHANGE_${camelCaseToSnakeCase(
									option
								).toUpperCase()}`
							)
							.addChannelTypes(ChannelType.GuildText)
							.setPlaceholder('Select the channel to log to')
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
				.setCustomId(`MOD_LOG_SETTINGS_BACK`)
				.setLabel(isCancel ? 'Cancel' : 'Back to mod log settings')
				.setStyle(isCancel ? ButtonStyle.Danger : ButtonStyle.Primary)
		);
	}
}
