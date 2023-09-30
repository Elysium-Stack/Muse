import { DiscordComponentsArrayDTO } from '@muse/types/discord-components-array.type';
import { MusicCommandDecorator } from '@music';
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
	RoleSelectMenuBuilder,
} from 'discord.js';
import { GuildAdminGuard } from 'libs/util/src/lib/guards';
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
import { MusicSettingsService } from '../services/settings.service';
import { MusicSettingsInterface } from '../types/settings.interface';
import { MUSIC_SETTINGS_CHOICES } from '../util/constants';
class MusicSettingsChangeOptions {
	@StringOption({
		name: 'option',
		description: 'The option to change',
		required: false,
		choices: MUSIC_SETTINGS_CHOICES,
	})
	option: keyof MusicSettingsInterface | undefined;
}

@UseGuards(GuildAdminGuard)
@UseFilters(ForbiddenExceptionFilter)
@MusicCommandDecorator({
	name: 'settings',
	description: 'Music settings commands',
})
export class MusicSettingsCommands {
	private readonly _logger = new Logger(MusicSettingsCommands.name);

	constructor(private _settings: MusicSettingsService) {}

	@Subcommand({
		name: 'show',
		description: 'Show music settings',
	})
	public async show(@Context() [interaction]: SlashCommandContext) {
		this._logger.verbose(
			`Loaded music settings for ${interaction.guildId}`,
		);

		return this._settings.showSettings(interaction);
	}

	@Button('MUSIC_SETTINGS_SHOW')
	public onShowButton(
		@Context()
		[interaction]: ButtonContext,
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
		@Options() { option }: MusicSettingsChangeOptions,
	) {
		this._logger.verbose(`Change music settings, option: ${option}`);

		if (!option) {
			return this._settings.promptSettings(interaction);
		}

		return this._askSettingValue(interaction, option);
	}

	@Button('MUSIC_SETTINGS_PROMPT')
	public onPromptButton(
		@Context()
		[interaction]: ButtonContext,
	) {
		return this._settings.promptSettings(interaction);
	}

	@Button('MUSIC_SETTINGS_BACK')
	public onBackButton(
		@Context()
		[interaction]: ButtonContext,
	) {
		return this._settings.promptSettings(interaction);
	}

	@StringSelect('MUSIC_SETTINGS_CHANGE_SELECT')
	public onStringSelect(
		@Context() [interaction]: StringSelectContext,
		@SelectedStrings() selected: (keyof MusicSettingsInterface)[],
	) {
		return this._askSettingValue(interaction, selected[0]);
	}

	@Button('MUSIC_SETTINGS_CHANGE_ENABLED/:value')
	public async onEnabledButton(
		@Context() [interaction]: ButtonContext,
		@ComponentParam('value') value: string,
	) {
		const parsedValue = value === 'true' ? true : false;

		await this._settings.set(interaction.guildId!, 'enabled', parsedValue);

		return interaction.update({
			content: `${MESSAGE_PREFIX} Music has been ${
				parsedValue ? 'enabled' : 'disabled'
			}`,
			components: [this._getBackButtonRow()],
		});
	}

	@ChannelSelect('MUSIC_SETTINGS_CHANGE_CHANNEL_ID')
	public async onChannelChange(
		@Context() [interaction]: ButtonContext,
		@SelectedChannels() [[id]]: ISelectedChannels,
	) {
		await this._settings.set(interaction.guildId!, 'channelId', id);

		return interaction.update({
			content: `${MESSAGE_PREFIX} Music channel has been changed to <#${id}>`,
			components: [this._getBackButtonRow()],
		});
	}

	@RoleSelect('MUSIC_SETTINGS_CHANGE_DJ_ROLE_ID')
	public async onPingRoldChange(
		@Context() [interaction]: ButtonContext,
		@SelectedRoles() [[id]]: ISelectedRoles,
	) {
		await this._settings.set(interaction.guildId!, 'djRoleId', id);

		return interaction.update({
			content: `${MESSAGE_PREFIX} Music DJ role has been changed to <@&${id}>`,
			components: [this._getBackButtonRow()],
		});
	}

	private async _askSettingValue(
		interaction: MessageComponentInteraction | CommandInteraction,
		option: keyof MusicSettingsInterface,
	) {
		let components: DiscordComponentsArrayDTO = [];
		const settings = await this._settings.get(interaction.guildId!);

		let currentValue = settings?.[option];
		let readableOption: string = option;

		switch (option) {
			case 'enabled':
				readableOption = 'Enabled';
				currentValue = settings?.[option] ? 'Enabled' : 'Disabled';
				components = [
					new ActionRowBuilder<ButtonBuilder>().addComponents(
						new ButtonBuilder()
							.setCustomId(
								`MUSIC_SETTINGS_CHANGE_${camelCaseToSnakeCase(
									option,
								).toUpperCase()}/true`,
							)
							.setLabel('Enable')
							.setStyle(ButtonStyle.Primary)
							.setDisabled(settings?.[option] === true),
						new ButtonBuilder()
							.setCustomId(
								`MUSIC_SETTINGS_CHANGE_${camelCaseToSnakeCase(
									option,
								).toUpperCase()}/false`,
							)
							.setLabel('Disable')
							.setStyle(ButtonStyle.Danger)
							.setDisabled(settings?.[option] === false),
					),
				];
				break;
			case 'channelId':
				readableOption = 'Channel';
				currentValue = settings?.[option]
					? `<#${settings[option]}>`
					: 'none';
				components = [
					new ActionRowBuilder<ChannelSelectMenuBuilder>().addComponents(
						new ChannelSelectMenuBuilder()
							.setCustomId(
								`MUSIC_SETTINGS_CHANGE_${camelCaseToSnakeCase(
									option,
								).toUpperCase()}`,
							)
							.addChannelTypes(ChannelType.GuildText)
							.setPlaceholder('Select a channel'),
					),
				];
				break;
			case 'djRoleId':
				readableOption = 'DJ role';
				currentValue = settings?.[option]
					? `<@&${settings[option]}>`
					: 'none';
				components = [
					new ActionRowBuilder<RoleSelectMenuBuilder>().addComponents(
						new RoleSelectMenuBuilder()
							.setCustomId(
								`MUSIC_SETTINGS_CHANGE_${camelCaseToSnakeCase(
									option,
								).toUpperCase()}`,
							)
							.setPlaceholder('Select a role'),
					),
				];
				break;
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
				.setCustomId(`MUSIC_SETTINGS_BACK`)
				.setLabel(isCancel ? 'Cancel' : 'Back to music settings')
				.setStyle(isCancel ? ButtonStyle.Danger : ButtonStyle.Primary),
		);
	}
}
