import { Logger, UseFilters, UseGuards } from '@nestjs/common';
import {
	ActionRowBuilder,
	ButtonBuilder,
	ButtonStyle,
	ChannelSelectMenuBuilder,
	ChannelType,
	CommandInteraction,
	MessageComponentInteraction,
	RoleSelectMenuBuilder,
} from 'discord.js';
import {
	Button,
	ButtonContext,
	ChannelSelect,
	ComponentParam,
	Context,
	ISelectedChannels,
	ISelectedRoles,
	Options,
	RoleSelect,
	SelectedChannels,
	SelectedRoles,
	SelectedStrings,
	SlashCommandContext,
	StringOption,
	StringSelect,
	StringSelectContext,
	Subcommand,
} from 'necord';

import { WriterPromptSettingsService } from '../services/settings.service';
import { WriterPromptSettingsInterface } from '../types/settings.interface';
import { WRITER_PROMPT_SETTINGS_CHOICES } from '../util/constants';
import { WriterPromptCommandDecorator } from '../writer-prompt.decorator';

import { DiscordComponentsArrayDTO } from '@muse/types/discord-components-array.type';

import {
	ForbiddenExceptionFilter,
	GuildAdminGuard,
	MESSAGE_PREFIX,
	camelCaseToSnakeCase,
} from '@util';

class WriterPromptSettingsChangeOptions {
	@StringOption({
		name: 'option',
		description: 'The option to change',
		required: false,
		choices: WRITER_PROMPT_SETTINGS_CHOICES,
	})
	option: keyof WriterPromptSettingsInterface | undefined;
}

@UseGuards(GuildAdminGuard)
@UseFilters(ForbiddenExceptionFilter)
@WriterPromptCommandDecorator({
	name: 'settings',
	description: 'Writer prompt settings commands',
	options: [],
})
export class WriterPromptSettingsCommands {
	private readonly _logger = new Logger(WriterPromptSettingsCommands.name);

	constructor(private _settings: WriterPromptSettingsService) {}

	@Subcommand({
		name: 'show',
		description: 'Show writer prompt settings',
	})
	public async show(@Context() [interaction]: SlashCommandContext) {
		this._logger.verbose(
			`Loaded writer prompt settings for ${interaction.guildId}`
		);

		return this._settings.showSettings(interaction);
	}

	@Button('WRITER_PROMPT_SETTINGS_SHOW')
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
		@Options() { option }: WriterPromptSettingsChangeOptions
	) {
		this._logger.verbose(
			`Change writer prompt settings, option: ${option}`
		);

		if (!option) {
			return this._settings.promptSettings(interaction);
		}

		return this._askSettingValue(interaction, option);
	}

	@Button('WRITER_PROMPT_SETTINGS_PROMPT')
	public onPromptButton(
		@Context()
		[interaction]: ButtonContext
	) {
		return this._settings.promptSettings(interaction);
	}

	@Button('WRITER_PROMPT_SETTINGS_BACK')
	public onBackButton(
		@Context()
		[interaction]: ButtonContext
	) {
		return this._settings.promptSettings(interaction);
	}

	@StringSelect('WRITER_PROMPT_SETTINGS_CHANGE_SELECT')
	public onStringSelect(
		@Context() [interaction]: StringSelectContext,
		@SelectedStrings() selected: (keyof WriterPromptSettingsInterface)[]
	) {
		return this._askSettingValue(interaction, selected[0]);
	}

	@Button('WRITER_PROMPT_SETTINGS_CHANGE_ENABLED/:value')
	public async onEnabledButton(
		@Context() [interaction]: ButtonContext,
		@ComponentParam('value') value: string
	) {
		const parsedValue = value === 'true' ? true : false;

		await this._settings.set(interaction.guildId, 'enabled', parsedValue);

		return interaction.update({
			content: `${MESSAGE_PREFIX} writer prompt has been ${
				parsedValue ? 'enabled' : 'disabled'
			}`,
			components: [this._getBackButtonRow()],
		});
	}

	@ChannelSelect('WRITER_PROMPT_SETTINGS_CHANGE_CHANNEL_ID')
	public async onChannelChange(
		@Context() [interaction]: ButtonContext,
		@SelectedChannels() [[id]]: ISelectedChannels
	) {
		await this._settings.set(interaction.guildId, 'channelId', id);

		return interaction.update({
			content: `${MESSAGE_PREFIX} writer prompt channel has been changed to <#${id}>`,
			components: [this._getBackButtonRow()],
		});
	}

	@RoleSelect('WRITER_PROMPT_SETTINGS_CHANGE_WRITER_ROLE_ID')
	public async onWriterRoleChange(
		@Context() [interaction]: ButtonContext,
		@SelectedRoles() [[id]]: ISelectedRoles
	) {
		await this._settings.set(interaction.guildId, 'writerRoleId', id);

		return interaction.update({
			content: `${MESSAGE_PREFIX} writer prompt writer role has been changed to <@&${id}>`,
			components: [this._getBackButtonRow()],
		});
	}

	@RoleSelect('WRITER_PROMPT_SETTINGS_CHANGE_PING_ROLE_ID')
	public async onPingRoleChange(
		@Context() [interaction]: ButtonContext,
		@SelectedRoles() [[id]]: ISelectedRoles
	) {
		await this._settings.set(interaction.guildId, 'pingRoleId', id);

		return interaction.update({
			content: `${MESSAGE_PREFIX} writer prompt ping role has been changed to <@&${id}>`,
			components: [this._getBackButtonRow()],
		});
	}

	private async _askSettingValue(
		interaction: MessageComponentInteraction | CommandInteraction,
		option: keyof WriterPromptSettingsInterface
	) {
		let components: DiscordComponentsArrayDTO = [];
		const settings = await this._settings.get(interaction.guildId);

		let currentValue = settings?.[option];
		let readableOption: string = option;

		switch (option) {
			case 'enabled': {
				readableOption =
					option === 'enabled' ? 'Enabled' : 'Daily enabled';
				currentValue = settings?.[option] ? 'Enabled' : 'Disabled';
				components = [
					new ActionRowBuilder<ButtonBuilder>().addComponents(
						new ButtonBuilder()
							.setCustomId(
								`WRITER_PROMPT_SETTINGS_CHANGE_${camelCaseToSnakeCase(
									option
								).toUpperCase()}/true`
							)
							.setLabel('Enable')
							.setStyle(ButtonStyle.Primary)
							.setDisabled(settings?.[option] === true),
						new ButtonBuilder()
							.setCustomId(
								`WRITER_PROMPT_SETTINGS_CHANGE_${camelCaseToSnakeCase(
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
			case 'channelId': {
				readableOption =
					option === 'channelId' ? 'Channel' : 'Daily channel';
				currentValue = settings?.[option]
					? `<#${settings[option]}>`
					: 'none';
				components = [
					new ActionRowBuilder<ChannelSelectMenuBuilder>().addComponents(
						new ChannelSelectMenuBuilder()
							.setCustomId(
								`WRITER_PROMPT_SETTINGS_CHANGE_${camelCaseToSnakeCase(
									option
								).toUpperCase()}`
							)
							.addChannelTypes(ChannelType.GuildText)
							.setPlaceholder('Select a channel')
					),
				];
				break;
			}
			case 'writerRoleId': {
				readableOption = 'Writer role';
				currentValue = settings?.[option]
					? `<@&${settings[option]}>`
					: 'none';
				components = [
					new ActionRowBuilder<RoleSelectMenuBuilder>().addComponents(
						new RoleSelectMenuBuilder()
							.setCustomId(
								`WRITER_PROMPT_SETTINGS_CHANGE_${camelCaseToSnakeCase(
									option
								).toUpperCase()}`
							)
							.setPlaceholder('Select a role')
					),
				];
				break;
			}
			case 'pingRoleId': {
				readableOption = 'Ping role';
				currentValue = settings?.[option]
					? `<@&${settings[option]}>`
					: 'none';
				components = [
					new ActionRowBuilder<RoleSelectMenuBuilder>().addComponents(
						new RoleSelectMenuBuilder()
							.setCustomId(
								`WRITER_PROMPT_SETTINGS_CHANGE_${camelCaseToSnakeCase(
									option
								).toUpperCase()}`
							)
							.setPlaceholder('Select a role')
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
				.setCustomId(`WRITER_PROMPT_SETTINGS_BACK`)
				.setLabel(
					isCancel ? 'Cancel' : 'Back to writer prompt settings'
				)
				.setStyle(isCancel ? ButtonStyle.Danger : ButtonStyle.Primary)
		);
	}
}
